from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.organizer import Organizer
from app.models.event import Event
from app.models.reward import Reward, RewardType
from app.models.participant import Participant
from app.models.claim import Claim
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventListResponse
from app.schemas.reward import RewardResponse
from app.middleware.auth import get_current_organizer
from decimal import Decimal

router = APIRouter()


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Create a new event with rewards"""
    # Create event
    event = Event(
        organizer_id=current_organizer.id,
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


@router.get("", response_model=List[EventResponse])
async def get_organizer_events(
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Get all events for the current organizer"""
    events = db.query(Event).filter(Event.organizer_id == current_organizer.id).all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Get a specific event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.organizer_id == current_organizer.id
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
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Update an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.organizer_id == current_organizer.id
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
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.organizer_id == current_organizer.id
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
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Get all participants for an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.organizer_id == current_organizer.id
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
    current_organizer: Organizer = Depends(get_current_organizer),
    db: Session = Depends(get_db)
):
    """Get all claims for an event"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.organizer_id == current_organizer.id
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
