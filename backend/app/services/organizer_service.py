from typing import Dict, Optional
from app.services.worldid_service import WorldIDService
from app.models.organizer import Organizer
from sqlalchemy.orm import Session


class OrganizerService:
    """Service for organizer WorldID authentication"""
    
    @staticmethod
    def verify_and_extract_world_id(proof: Dict) -> Optional[str]:
        """
        Verify WorldID proof and extract nullifier hash
        
        Args:
            proof: WorldID proof object
            
        Returns:
            Hashed nullifier hash if verification successful, None otherwise
        """
        worldid_service = WorldIDService()
        
        # Verify proof
        verification_result = worldid_service.verify_proof(proof)
        
        if not verification_result["success"]:
            return None
        
        # Extract nullifier hash
        nullifier_hash = worldid_service.get_nullifier_hash(proof)
        if not nullifier_hash:
            return None
        
        # Hash the nullifier hash for storage
        world_id_hash = worldid_service.hash_world_id(nullifier_hash)
        return world_id_hash
    
    @staticmethod
    def find_or_create_organizer(
        world_id_hash: str,
        name: Optional[str],
        db: Session
    ) -> Organizer:
        """
        Find existing organizer by world_id_hash or create new one
        
        Args:
            world_id_hash: Hashed WorldID nullifier
            name: Optional organizer name
            db: Database session
            
        Returns:
            Organizer instance
        """
        organizer = db.query(Organizer).filter(
            Organizer.world_id_hash == world_id_hash
        ).first()
        
        if not organizer:
            # Create new organizer
            organizer = Organizer(
                world_id_hash=world_id_hash,
                name=name
            )
            db.add(organizer)
            db.commit()
            db.refresh(organizer)
        elif name and not organizer.name:
            # Update name if provided and not set
            organizer.name = name
            db.commit()
            db.refresh(organizer)
        
        return organizer
