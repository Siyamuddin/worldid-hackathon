from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.middleware.rate_limit import rate_limit
from app.models.event import Event
from app.models.participant import Participant
from app.models.event_participant import EventParticipant
from app.models.reward import Reward
from app.models.claim import Claim, ClaimStatus
from app.schemas.participant import ParticipantJoinEvent, ParticipantResponse
from app.schemas.event import EventListResponse
from app.schemas.claim import ClaimRequest, ClaimResponse
from app.services.worldid_service import WorldIDService
from app.services.wallet_service import WalletService
from app.services.blockchain_service import BlockchainService
from app.config.logging import logger
from decimal import Decimal

router = APIRouter()


@router.get("", response_model=List[EventListResponse])
async def browse_events(db: Session = Depends(get_db)):
    """Browse all available active events"""
    events = db.query(Event).filter(Event.is_active == True).all()
    
    result = []
    for event in events:
        reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
        result.append({
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "start_date": event.start_date,
            "end_date": event.end_date,
            "is_active": event.is_active,
            "created_at": event.created_at,
            "reward_count": reward_count
        })
    
    return result


@router.get("/{event_id}", response_model=EventListResponse)
async def get_event_details(event_id: int, db: Session = Depends(get_db)):
    """Get event details"""
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
    
    return {
        "id": event.id,
        "name": event.name,
        "description": event.description,
        "start_date": event.start_date,
        "end_date": event.end_date,
        "is_active": event.is_active,
        "created_at": event.created_at,
        "reward_count": reward_count
    }


@router.post("/{event_id}/join", response_model=dict)
async def join_event(
    event_id: int,
    join_data: ParticipantJoinEvent,
    request: Request,
    db: Session = Depends(get_db),
    _: int = Depends(rate_limit(max_requests=5, window_seconds=60))
):
    """Join an event with WorldID verification"""
    # Verify event exists and is active
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found or inactive"
        )
    
    # Validate wallet address
    wallet_address = WalletService.to_checksum_address(join_data.wallet_address)
    if not wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address"
        )
    
    # Verify WorldID proof
    worldid_service = WorldIDService()
    verification_result = worldid_service.verify_proof(
        join_data.world_id_proof,
        signal=wallet_address
    )
    
    if not verification_result["success"]:
        logger.warning(f"WorldID verification failed for event {event_id}: {verification_result['message']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"WorldID verification failed: {verification_result['message']}"
        )
    
    logger.info(f"WorldID verification successful for event {event_id}")
    
    # Get or create nullifier hash
    nullifier_hash = worldid_service.get_nullifier_hash(join_data.world_id_proof)
    if not nullifier_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid WorldID proof: missing nullifier hash"
        )
    
    world_id_hash = worldid_service.hash_world_id(nullifier_hash)
    
    # Check if participant exists
    participant = db.query(Participant).filter(
        Participant.world_id_hash == world_id_hash
    ).first()
    
    if participant:
        # Participant exists, verify wallet matches
        if participant.wallet_address.lower() != wallet_address.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WorldID already linked to a different wallet address"
            )
    else:
        # Create new participant
        participant = Participant(
            world_id_hash=world_id_hash,
            wallet_address=wallet_address
        )
        db.add(participant)
        db.flush()
    
    # Check if already joined this event
    existing_join = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.participant_id == participant.id
    ).first()
    
    if existing_join:
        return {
            "message": "Already joined this event",
            "event_id": event_id,
            "participant_id": participant.id
        }
    
    # Register participant for event
    event_participant = EventParticipant(
        event_id=event_id,
        participant_id=participant.id
    )
    db.add(event_participant)
    db.commit()
    
    logger.info(f"Participant {participant.id} joined event {event_id}")
    
    return {
        "message": "Successfully joined event",
        "event_id": event_id,
        "participant_id": participant.id
    }


@router.post("/{event_id}/claim", response_model=List[ClaimResponse])
async def claim_rewards(
    event_id: int,
    claim_data: ClaimRequest,
    request: Request,
    db: Session = Depends(get_db),
    _: int = Depends(rate_limit(max_requests=3, window_seconds=60))
):
    """Claim rewards from an event"""
    # Verify event exists and is active
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found or inactive"
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
    
    # Get nullifier hash and find participant
    nullifier_hash = worldid_service.get_nullifier_hash(claim_data.world_id_proof)
    if not nullifier_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid WorldID proof: missing nullifier hash"
        )
    
    world_id_hash = worldid_service.hash_world_id(nullifier_hash)
    participant = db.query(Participant).filter(
        Participant.world_id_hash == world_id_hash
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found. Please join the event first."
        )
    
    # Check if participant joined the event
    event_participant = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.participant_id == participant.id
    ).first()
    
    if not event_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must join the event before claiming rewards"
        )
    
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
        Claim.participant_id == participant.id
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
            Claim.participant_id == participant.id,
            Claim.reward_id == reward.id
        ).first()
        
        if existing_claim:
            created_claims.append(existing_claim)
            continue
        
        # Create claim record
        claim = Claim(
            event_id=event_id,
            participant_id=participant.id,
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
                    participant.wallet_address,
                    amount_wei
                )
            elif reward.reward_type == RewardType.ERC721:
                result = blockchain_service.send_erc721_nft(
                    reward.token_address,
                    participant.wallet_address,
                    reward.token_id
                )
            elif reward.reward_type == RewardType.ERC1155:
                result = blockchain_service.send_erc1155_nft(
                    reward.token_address,
                    participant.wallet_address,
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


@router.get("/profile/{wallet_address}", response_model=ParticipantResponse)
async def get_participant_profile(
    wallet_address: str,
    db: Session = Depends(get_db)
):
    """Get participant profile by wallet address"""
    wallet_address = WalletService.to_checksum_address(wallet_address)
    if not wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wallet address"
        )
    
    participant = db.query(Participant).filter(
        Participant.wallet_address == wallet_address
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )
    
    # Get joined events
    joined_events = []
    for ep in participant.event_participants:
        event = ep.event
        reward_count = db.query(Reward).filter(Reward.event_id == event.id).count()
        joined_events.append({
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "start_date": event.start_date,
            "end_date": event.end_date,
            "is_active": event.is_active,
            "created_at": event.created_at,
            "reward_count": reward_count
        })
    
    return {
        "id": participant.id,
        "wallet_address": participant.wallet_address,
        "created_at": participant.created_at,
        "joined_events": joined_events
    }
