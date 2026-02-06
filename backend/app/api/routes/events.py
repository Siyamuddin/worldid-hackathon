from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from typing import List
from app.config.database import get_db
from app.models.event import Event
from app.models.reward import Reward, RewardType
from app.models.participant import Participant
from app.models.claim import Claim
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventListResponse
from app.schemas.reward import RewardResponse
from app.middleware.participant_auth import get_current_participant
from app.config.logging import logger
from decimal import Decimal

router = APIRouter()


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
