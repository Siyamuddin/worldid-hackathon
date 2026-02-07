from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from typing import List
from app.config.database import get_db
from app.middleware.rate_limit import rate_limit
from app.models.event import Event
from app.models.participant import Participant
from app.models.event_participant import EventParticipant
from app.models.reward import Reward
from app.models.claim import Claim, ClaimStatus
from app.schemas.participant import ParticipantResponse
from app.schemas.event import EventListResponse
from app.schemas.claim import ClaimRequest, ClaimResponse
from app.middleware.participant_auth import get_current_participant
from app.services.worldid_service import WorldIDService
from app.services.wallet_service import WalletService
from app.services.blockchain_service import BlockchainService
from app.config.logging import logger
from decimal import Decimal

router = APIRouter()


@router.get("/public/events", response_model=List[EventListResponse])
async def browse_events(db: Session = Depends(get_db)):
    """Browse all available published and active events (public, no auth required)"""
    try:
        # First check if participant_id column exists
        try:
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='events' AND column_name='participant_id'
            """)).first()
            
            if not result:
                # Column doesn't exist, use raw SQL to query without participant_id
                logger.warning("participant_id column does not exist. Using raw SQL query.")
                events_data = db.execute(text("""
                    SELECT id, name, description, start_date, end_date, is_active, is_published, created_at
                    FROM events
                    WHERE is_active = true AND is_published = true
                """)).fetchall()
                
                result_list = []
                for row in events_data:
                    reward_count = db.query(Reward).filter(Reward.event_id == row[0]).count()
                    result_list.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "is_active": row[5],
                        "is_published": row[6],
                        "created_at": row[7],
                        "reward_count": reward_count
                    })
                return result_list
        except (OperationalError, ProgrammingError) as schema_error:
            logger.warning(f"Schema check failed: {str(schema_error)}. Attempting raw SQL query.")
            # If schema check fails, try raw SQL query
            try:
                events_data = db.execute(text("""
                    SELECT id, name, description, start_date, end_date, is_active, is_published, created_at
                    FROM events
                    WHERE is_active = true AND is_published = true
                """)).fetchall()
                
                result_list = []
                for row in events_data:
                    reward_count = db.query(Reward).filter(Reward.event_id == row[0]).count()
                    result_list.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "is_active": row[5],
                        "is_published": row[6],
                        "created_at": row[7],
                        "reward_count": reward_count
                    })
                return result_list
            except Exception as raw_sql_error:
                logger.error(f"Raw SQL query also failed: {str(raw_sql_error)}")
                return []
        
        # Normal query path - participant_id column exists
        events = db.query(Event).filter(
            Event.is_active == True,
            Event.is_published == True
        ).all()
        
        result = []
        for event in events:
            # Skip events without participant_id (migration not complete)
            if not hasattr(event, 'participant_id') or event.participant_id is None:
                continue
                
            reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
            result.append({
                "id": event.id,
                "name": event.name,
                "description": event.description,
                "start_date": event.start_date,
                "end_date": event.end_date,
                "is_active": event.is_active,
                "is_published": event.is_published,
                "created_at": event.created_at,
                "reward_count": reward_count
            })
        
        return result
    except (OperationalError, ProgrammingError) as db_error:
        error_msg = str(db_error).lower()
        if "participant_id" in error_msg or "column" in error_msg or "does not exist" in error_msg:
            logger.warning(f"Database schema mismatch detected: {str(db_error)}. Attempting fallback query.")
            try:
                # Fallback to raw SQL
                events_data = db.execute(text("""
                    SELECT id, name, description, start_date, end_date, is_active, is_published, created_at
                    FROM events
                    WHERE is_active = true AND is_published = true
                """)).fetchall()
                
                result_list = []
                for row in events_data:
                    reward_count = db.query(Reward).filter(Reward.event_id == row[0]).count()
                    result_list.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "is_active": row[5],
                        "is_published": row[6],
                        "created_at": row[7],
                        "reward_count": reward_count
                    })
                return result_list
            except Exception as fallback_error:
                logger.error(f"Fallback query failed: {str(fallback_error)}")
                return []
        else:
            logger.error(f"Database error browsing events: {str(db_error)}")
            return []
    except Exception as e:
        logger.error(f"Unexpected error browsing events: {str(e)}", exc_info=True)
        # Return empty list on error to prevent 500
        return []


@router.get("/public/events/{event_id}", response_model=EventListResponse)
async def get_event_details(event_id: int, db: Session = Depends(get_db)):
    """Get event details (only published events, public, no auth required)"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_active == True,
        Event.is_published == True
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found or not published"
        )
    
    reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
    
    return {
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "start_date": event.start_date,
        "end_date": event.end_date,
        "is_active": event.is_active,
        "is_published": event.is_published,
        "created_at": event.created_at,
        "reward_count": reward_count
    }


@router.post("/events/{event_id}/join", response_model=dict)
async def join_event(
    event_id: int,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db),
    _: int = Depends(rate_limit(max_requests=5, window_seconds=60))
):
    """Join an event (Google auth required, no WorldID needed)"""
    # Verify event exists, is active, and is published
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_active == True,
        Event.is_published == True
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found, inactive, or not published"
        )
    
    # Check if already joined this event
    existing_join = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.participant_id == current_participant.id
    ).first()
    
    if existing_join:
        return {
            "message": "Already joined this event",
            "event_id": event_id,
            "participant_id": current_participant.id
        }
    
    # Register participant for event
    event_participant = EventParticipant(
        event_id=event_id,
        participant_id=current_participant.id
    )
    db.add(event_participant)
    db.commit()
    
    logger.info(f"Participant {current_participant.id} (Email: {current_participant.email or 'N/A'}, Google ID: {current_participant.google_id or 'N/A'}) joined event {event_id}")
    
    return {
        "message": "Successfully joined event",
        "event_id": event_id,
        "participant_id": current_participant.id
    }


@router.post("/events/{event_id}/claim", response_model=List[ClaimResponse])
async def claim_rewards(
    event_id: int,
    claim_data: ClaimRequest,
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db),
    _: int = Depends(rate_limit(max_requests=3, window_seconds=60))
):
    """Claim rewards from an event (Google auth + WorldID + wallet required)"""
    # Verify event exists, is active, and is published
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_active == True,
        Event.is_published == True
    ).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found, inactive, or not published"
        )
    
    # Validate wallet address
    wallet_address = WalletService.to_checksum_address(claim_data.wallet_address)
    if not wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address"
        )
    
    # Verify WorldID proof
    worldid_service = WorldIDService()
    verification_result = worldid_service.verify_proof(claim_data.world_id_proof)
    
    if not verification_result["success"]:
        logger.warning(f"WorldID verification failed for claim on event {event_id}: {verification_result['message']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"WorldID verification failed: {verification_result['message']}"
        )
    
    logger.info(f"WorldID verification successful for claim on event {event_id}")
    
    # Verify WorldID matches participant's WorldID
    nullifier_hash = worldid_service.get_nullifier_hash(claim_data.world_id_proof)
    if not nullifier_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid WorldID proof: missing nullifier hash"
        )
    
    world_id_hash = worldid_service.hash_world_id(nullifier_hash)
    
    # Update participant's world_id_hash if not set, or verify it matches
    if not current_participant.world_id_hash:
        # First time setting WorldID - link it to this participant
        current_participant.world_id_hash = world_id_hash
        db.commit()
        db.refresh(current_participant)
    elif current_participant.world_id_hash != world_id_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WorldID mismatch. This proof does not match your account."
        )
    
    # Check if participant joined the event
    event_participant = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.participant_id == current_participant.id
    ).first()
    
    if not event_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must join the event before claiming rewards"
        )
    
    # Update or verify wallet address
    if current_participant.wallet_address:
        if current_participant.wallet_address.lower() != wallet_address.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet address mismatch. This account is already linked to a different wallet."
            )
    else:
        # Set wallet address for first time
        current_participant.wallet_address = wallet_address
        db.commit()
        db.refresh(current_participant)
    
    # Get all rewards for this event
    rewards = db.query(Reward).filter(Reward.event_id == event_id).all()
    
    if not rewards:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No rewards available for this event"
        )
    
    # Check if already claimed
    existing_claims = db.query(Claim).filter(
        Claim.event_id == event_id,
        Claim.participant_id == current_participant.id
    ).all()
    
    if existing_claims:
        # Check if any claim is completed
        completed_claims = [c for c in existing_claims if c.status == ClaimStatus.COMPLETED]
        if completed_claims:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rewards for this event have already been claimed"
            )
    
    # Create claims and process blockchain transactions
    blockchain_service = BlockchainService()
    created_claims = []
    
    for reward in rewards:
        # Check if claim already exists for this reward
        existing_claim = db.query(Claim).filter(
            Claim.event_id == event_id,
            Claim.participant_id == current_participant.id,
            Claim.reward_id == reward.id
        ).first()
        
        if existing_claim:
            created_claims.append(existing_claim)
            continue
        
        # Create claim record
        claim = Claim(
            event_id=event_id,
            participant_id=current_participant.id,
            reward_id=reward.id,
            status=ClaimStatus.PENDING
        )
        db.add(claim)
        db.flush()
        
        # Process blockchain transaction
        try:
            claim.status = ClaimStatus.PROCESSING
            db.commit()
            
            if reward.reward_type == RewardType.ERC20:
                # Convert amount to wei (assuming 18 decimals)
                amount_wei = int(Decimal(str(reward.amount)) * Decimal(10**18))
                result = blockchain_service.send_erc20_token(
                    reward.token_address,
                    wallet_address,  # Use validated wallet address
                    amount_wei
                )
            elif reward.reward_type == RewardType.ERC721:
                result = blockchain_service.send_erc721_nft(
                    reward.token_address,
                    wallet_address,  # Use validated wallet address
                    reward.token_id
                )
            elif reward.reward_type == RewardType.ERC1155:
                result = blockchain_service.send_erc1155_nft(
                    reward.token_address,
                    wallet_address,  # Use validated wallet address
                    reward.token_id
                )
            else:
                result = {"success": False, "error": "Unknown reward type"}
            
            if result.get("success"):
                claim.status = ClaimStatus.COMPLETED
                claim.transaction_hash = result.get("transaction_hash")
                logger.info(f"Reward claim {claim.id} completed: {result.get('transaction_hash')}")
            else:
                claim.status = ClaimStatus.FAILED
                claim.error_message = result.get("error", "Unknown error")
                logger.error(f"Reward claim {claim.id} failed: {result.get('error')}")
            
            db.commit()
            created_claims.append(claim)
            
        except Exception as e:
            claim.status = ClaimStatus.FAILED
            claim.error_message = str(e)
            logger.error(f"Exception processing claim {claim.id}: {str(e)}")
            db.commit()
            created_claims.append(claim)
    
    return created_claims


@router.get("/profile/me", response_model=ParticipantResponse)
async def get_current_participant_profile(
    current_participant: Participant = Depends(get_current_participant),
    db: Session = Depends(get_db)
):
    """Get current participant profile (requires Google authentication)"""
    try:
        # Check if participant_id column exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='events' AND column_name='participant_id'
        """)).first()
        
        if not result:
            # Column doesn't exist, return profile without events
            logger.warning("participant_id column does not exist. Returning profile without events.")
            return {
                "id": current_participant.id,
                "email": current_participant.email,
                "google_id": current_participant.google_id,
                "wallet_address": current_participant.wallet_address,
                "created_at": current_participant.created_at,
                "joined_events": [],
                "created_events": []
            }
        
        # Get joined events
        joined_events = []
        try:
            for ep in current_participant.event_participants:
                event = ep.event
                reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
                joined_events.append({
                    "id": event.id,
                    "name": event.name,
                    "description": event.description,
                    "start_date": event.start_date,
                    "end_date": event.end_date,
                    "is_active": event.is_active,
                    "is_published": event.is_published,
                    "created_at": event.created_at,
                    "reward_count": reward_count
                })
        except (OperationalError, ProgrammingError) as e:
            logger.warning(f"Error loading joined events: {str(e)}")
            joined_events = []
        
        # Get created events
        created_events = []
        try:
            for event in current_participant.created_events:
                reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
                created_events.append({
                    "id": event.id,
                    "name": event.name,
                    "description": event.description,
                    "start_date": event.start_date,
                    "end_date": event.end_date,
                    "is_active": event.is_active,
                    "is_published": event.is_published,
                    "created_at": event.created_at,
                    "reward_count": reward_count
                })
        except (OperationalError, ProgrammingError) as e:
            logger.warning(f"Error loading created events: {str(e)}")
            created_events = []
        
        return {
            "id": current_participant.id,
            "email": current_participant.email,
            "google_id": current_participant.google_id,
            "wallet_address": current_participant.wallet_address,
            "created_at": current_participant.created_at,
            "joined_events": joined_events,
            "created_events": created_events
        }
    except (OperationalError, ProgrammingError) as e:
        error_msg = str(e).lower()
        if "participant_id" in error_msg or "column" in error_msg or "does not exist" in error_msg:
            logger.warning(f"Schema mismatch: {str(e)}. Returning profile without events.")
            return {
                "id": current_participant.id,
                "email": current_participant.email,
                "google_id": current_participant.google_id,
                "wallet_address": current_participant.wallet_address,
                "created_at": current_participant.created_at,
                "joined_events": [],
                "created_events": []
            }
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting participant profile: {str(e)}", exc_info=True)
        # Return basic profile info even on error
        return {
            "id": current_participant.id,
            "email": current_participant.email,
            "google_id": current_participant.google_id,
            "wallet_address": current_participant.wallet_address,
            "created_at": current_participant.created_at,
            "joined_events": [],
            "created_events": []
        }
