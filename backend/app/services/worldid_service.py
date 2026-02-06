import requests
import hashlib
from typing import Dict, Optional
from app.config.worldid import worldid_settings


class WorldIDService:
    """Service for verifying WorldID proofs"""
    
    @staticmethod
    def hash_world_id(nullifier_hash: str) -> str:
        """Hash the WorldID nullifier for storage"""
        return hashlib.sha256(nullifier_hash.encode()).hexdigest()
    
    @staticmethod
    def verify_proof(proof: Dict, signal: Optional[str] = None) -> Dict:
        """
        Verify a WorldID proof
        
        Args:
            proof: WorldID proof object containing merkle_root, nullifier_hash, proof, etc.
            signal: Optional signal string (usually the wallet address)
        
        Returns:
            Dict with 'success' and 'message' keys
        """
        try:
            verify_payload = {
                "merkle_root": proof.get("merkle_root"),
                "nullifier_hash": proof.get("nullifier_hash"),
                "proof": proof.get("proof"),
                "verification_level": proof.get("verification_level", "orb"),
                "signal": signal or "",
                "app_id": worldid_settings.WORLDID_APP_ID,
                "action": worldid_settings.WORLDID_ACTION,
            }
            
            response = requests.post(
                worldid_settings.WORLDID_VERIFY_URL,
                json=verify_payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    return {
                        "success": True,
                        "nullifier_hash": proof.get("nullifier_hash"),
                        "message": "Proof verified successfully"
                    }
                else:
                    return {
                        "success": False,
                        "message": result.get("detail", "Proof verification failed")
                    }
            else:
                return {
                    "success": False,
                    "message": f"Verification request failed: {response.status_code}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "message": f"Error verifying proof: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}"
            }
    
    @staticmethod
    def get_nullifier_hash(proof: Dict) -> Optional[str]:
        """Extract nullifier hash from proof"""
        return proof.get("nullifier_hash")
