from web3 import Web3
from typing import Optional


class WalletService:
    """Service for wallet address validation"""
    
    @staticmethod
    def is_valid_address(address: str) -> bool:
        """Check if an Ethereum address is valid"""
        try:
            return Web3.is_address(address) and Web3.is_checksum_address(
                Web3.to_checksum_address(address)
            )
        except:
            return False
    
    @staticmethod
    def to_checksum_address(address: str) -> Optional[str]:
        """Convert address to checksum format"""
        try:
            return Web3.to_checksum_address(address)
        except:
            return None
