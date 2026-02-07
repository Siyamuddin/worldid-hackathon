from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from typing import List, Optional
from pydantic import BaseModel
from app.config.database import get_db
from app.models.event import Event
from app.models.reward import Reward, RewardType
from app.models.participant import Participant
from app.models.event_participant import EventParticipant
from app.models.claim import Claim, ClaimStatus
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventListResponse
from app.schemas.reward import RewardResponse
from app.middleware.participant_auth import get_current_participant
from app.config.logging import logger
from decimal import Decimal

router = APIRouter()


class DistributeRewardsRequest(BaseModel):
    participant_ids: List[int]


class AddRewardRequest(BaseModel):
    reward_type: RewardType
    token_address: str
    amount: Optional[float] = None  # For ERC-20
    token_id: Optional[int] = None  # For ERC-721/1155
    name: Optional[str] = None
    description: Optional[str] = None


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Create a new event with rewards"""
    try:
        # Check if participant_id column exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='events' AND column_name='participant_id'
        """)).first()
        
        if not result:
            logger.error("participant_id column does not exist. Database migration required.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database migration required. The participant_id column does not exist. Please run the migration script."
            )
        
        # Create event
        event = Event(
            participant_id=current_participant.id,
            name=event_data.name,
            description=event_data.description,
            start_date=event_data.start_date,
            end_date=event_data.end_date
        )
        db.add(event)
        db.flush()  # Get event ID
        
        # Create rewards
        for reward_data in event_data.rewards:
            reward = Reward(
                event_id=event.id,
                reward_type=reward_data.reward_type,
                token_address=reward_data.token_address,
                amount=Decimal(str(reward_data.amount)) if reward_data.amount else None,
                token_id=reward_data.token_id,
                name=reward_data.name,
                description=reward_data.description
            )
            db.add(reward)
        
        db.commit()
        db.refresh(event)
        
        return event
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except (OperationalError, ProgrammingError) as e:
        error_msg = str(e).lower()
        if "participant_id" in error_msg or "column" in error_msg or "does not exist" in error_msg:
            logger.error(f"Database schema error creating event: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database migration required. The participant_id column does not exist. Please run the migration script."
            )
        logger.error(f"Database error creating event: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while creating event"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating event: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating event"
        )


@router.get("", response_model=List[EventResponse])
async def get_participant_events(
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Get all events created by the current participant"""
    try:
        # Check if participant_id column exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='events' AND column_name='participant_id'
        """)).first()
        
        if not result:
            # Column doesn't exist, return empty list
            logger.warning("participant_id column does not exist. Returning empty list.")
            return []
        
        events = db.query(Event).filter(Event.participant_id == current_participant.id).all()
        return events
    except (OperationalError, ProgrammingError) as e:
        error_msg = str(e).lower()
        if "participant_id" in error_msg or "column" in error_msg or "does not exist" in error_msg:
            logger.warning(f"Schema mismatch: {str(e)}. Returning empty list.")
            return []
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting participant events: {str(e)}", exc_info=True)
        return []


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Get a specific event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Update an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Update fields
    if event_data.name is not None:
        event.name = event_data.name
    if event_data.description is not None:
        event.description = event_data.description
    if event_data.start_date is not None:
        event.start_date = event_data.start_date
    if event_data.end_date is not None:
        event.end_date = event_data.end_date
    if event_data.is_active is not None:
        event.is_active = event_data.is_active
    if event_data.is_published is not None:
        event.is_published = event_data.is_published
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    db.delete(event)
    db.commit()
    
    return None


@router.get("/{event_id}/participants")
async def get_event_participants(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Get all participants for an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    participants = [
        {
            "id": ep.participant.id,
            "wallet_address": ep.participant.wallet_address,
            "joined_at": ep.joined_at
        }
        for ep in event.event_participants
    ]
    
    return {"event_id": event_id, "participants": participants, "count": len(participants)}


@router.get("/{event_id}/claims")
async def get_event_claims(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Get all claims for an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    claims = db.query(Claim).filter(Claim.event_id == event_id).all()
    
    return {
        "event_id": event_id,
        "claims": [
            {
                "id": claim.id,
                "participant_id": claim.participant_id,
                "wallet_address": claim.participant.wallet_address,
                "reward_id": claim.reward_id,
                "status": claim.status,
                "transaction_hash": claim.transaction_hash,
                "created_at": claim.created_at
            }
            for claim in claims
        ],
        "count": len(claims)
    }


@router.post("/{event_id}/publish", response_model=EventResponse)
async def publish_event(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Publish an event (make it visible to participants)"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.is_published = True
    db.commit()
    db.refresh(event)
    
    return event


@router.post("/{event_id}/unpublish", response_model=EventResponse)
async def unpublish_event(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Unpublish an event (hide it from participants)"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.is_published = False
    db.commit()
    db.refresh(event)
    
    return event


@router.post("/{event_id}/rewards", response_model=RewardResponse)
async def add_reward_to_event(
    event_id: int,
    reward_data: AddRewardRequest,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Add a reward to an existing event (event creator only)"""
    # Verify event exists and user is the creator
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.participant_id == current_participant.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found or you are not the creator"
        )
    
    # Create reward
    reward = Reward(
        event_id=event_id,
        reward_type=reward_data.reward_type,
        token_address=reward_data.token_address,
        amount=Decimal(str(reward_data.amount)) if reward_data.amount else None,
        token_id=reward_data.token_id,
        name=reward_data.name,
        description=reward_data.description
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    
    logger.info(f"Reward {reward.id} added to event {event_id} by participant {current_participant.id}")
    
    return reward


@router.post("/{event_id}/distribute-rewards")
async def distribute_rewards(
    event_id: int,
    request: DistributeRewardsRequest,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Distribute rewards to selected participants (event creator only)"""
    try:
        logger.info(f"Distribute rewards request for event {event_id} by participant {current_participant.id}. Participant IDs: {request.participant_ids}")
        
        # Verify event exists and user is the creator
        event = db.query(Event).filter(
            Event.id == event_id,
            Event.participant_id == current_participant.id
        ).first()
        
        if not event:
            logger.warning(f"Event {event_id} not found or participant {current_participant.id} is not the creator")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found or you are not the creator"
            )
        
        # Get all rewards for this event
        rewards = db.query(Reward).filter(Reward.event_id == event_id).all()
        logger.info(f"Found {len(rewards)} rewards for event {event_id}")
        
        if not rewards:
            logger.warning(f"No rewards configured for event {event_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No rewards configured for this event. Please add rewards to the event first using POST /api/events/{event_id}/rewards"
            )
        
        # Validate participant_ids list
        if not request.participant_ids or len(request.participant_ids) == 0:
            logger.warning(f"Empty participant_ids list provided for event {event_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No participant IDs provided"
            )
        
        # Verify all participant IDs are valid and joined the event
        valid_participants = db.query(Participant).filter(
            Participant.id.in_(request.participant_ids)
        ).all()
        
        valid_participant_ids = {p.id for p in valid_participants}
        invalid_participants = set(request.participant_ids) - valid_participant_ids
        
        if invalid_participants:
            logger.warning(f"Invalid participant IDs: {invalid_participants}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Some participant IDs are invalid: {invalid_participants}"
            )
        
        # Verify participants joined the event
        event_participants = db.query(EventParticipant).filter(
            EventParticipant.event_id == event_id,
            EventParticipant.participant_id.in_(request.participant_ids)
        ).all()
        
        joined_participant_ids = {ep.participant_id for ep in event_participants}
        missing_participants = set(request.participant_ids) - joined_participant_ids
        
        if missing_participants:
            logger.warning(f"Participants {missing_participants} have not joined event {event_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Participants {missing_participants} have not joined this event"
            )
        
        logger.info(f"All {len(request.participant_ids)} participants are valid and have joined the event")
        
        # Create claims for each participant for each reward
        created_claims = []
        skipped_claims = []
        
        for participant_id in request.participant_ids:
            participant = next(p for p in valid_participants if p.id == participant_id)
            
            # Check if participant has wallet address
            if not participant.wallet_address:
                logger.warning(f"Participant {participant_id} does not have a wallet address. Skipping reward distribution.")
                skipped_claims.append({
                    "participant_id": participant_id,
                    "reason": "No wallet address"
                })
                continue
            
            for reward in rewards:
                # Check if claim already exists
                existing_claim = db.query(Claim).filter(
                    Claim.event_id == event_id,
                    Claim.participant_id == participant_id,
                    Claim.reward_id == reward.id
                ).first()
                
                if existing_claim:
                    skipped_claims.append({
                        "participant_id": participant_id,
                        "reward_id": reward.id,
                        "reason": "Claim already exists"
                    })
                    continue
                
                # Create new claim
                claim = Claim(
                    event_id=event_id,
                    participant_id=participant_id,
                    reward_id=reward.id,
                    status=ClaimStatus.PENDING
                )
                db.add(claim)
                created_claims.append({
                    "participant_id": participant_id,
                    "reward_id": reward.id,
                    "wallet_address": participant.wallet_address
                })
        
        db.commit()
        
        logger.info(
            f"Event creator {current_participant.id} distributed rewards to {len(created_claims)} claims "
            f"for {len(request.participant_ids)} participants in event {event_id}"
        )
        
        return {
            "event_id": event_id,
            "created_claims": len(created_claims),
            "skipped_claims": len(skipped_claims),
            "details": {
                "created": created_claims,
                "skipped": skipped_claims
            },
            "message": f"Successfully created {len(created_claims)} reward claims"
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error distributing rewards: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error distributing rewards: {str(e)}"
        )
