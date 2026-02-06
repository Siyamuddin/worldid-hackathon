from web3 import Web3
from eth_account import Account
from typing import Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class BlockchainService:
    """Service for blockchain interactions"""
    
    def __init__(self):
        rpc_url = os.getenv("ETHEREUM_RPC_URL", "https://eth-mainnet.g.alchemy.com/v2/demo")
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.private_key = os.getenv("PRIVATE_KEY", "")
        
        if self.private_key:
            self.account = Account.from_key(self.private_key)
            self.sender_address = self.account.address
        else:
            self.account = None
            self.sender_address = None
    
    def send_erc20_token(
        self,
        token_address: str,
        to_address: str,
        amount: int,
        gas_price: Optional[int] = None
    ) -> Dict:
        """
        Send ERC-20 tokens
        
        Args:
            token_address: ERC-20 token contract address
            to_address: Recipient address
            amount: Amount in token's smallest unit (wei-like)
            gas_price: Optional gas price in wei
        
        Returns:
            Dict with transaction hash or error
        """
        try:
            # ERC-20 transfer function signature
            transfer_function = "0xa9059cbb"  # transfer(address,uint256)
            
            # Encode parameters
            to_address_encoded = to_address[2:].zfill(64)  # Remove 0x and pad
            amount_encoded = hex(amount)[2:].zfill(64)
            
            data = transfer_function + to_address_encoded + amount_encoded
            
            return self._send_transaction(token_address, to_address, data, gas_price)
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending ERC-20 token: {str(e)}"
            }
    
    def send_erc721_nft(
        self,
        nft_address: str,
        to_address: str,
        token_id: int,
        gas_price: Optional[int] = None
    ) -> Dict:
        """
        Send ERC-721 NFT
        
        Args:
            nft_address: ERC-721 contract address
            to_address: Recipient address
            token_id: NFT token ID
            gas_price: Optional gas price in wei
        
        Returns:
            Dict with transaction hash or error
        """
        try:
            # ERC-721 safeTransferFrom function signature
            # safeTransferFrom(address,address,uint256)
            function_signature = "0x42842e0e"
            
            # Encode parameters: from, to, tokenId
            from_address_encoded = self.sender_address[2:].zfill(64)
            to_address_encoded = to_address[2:].zfill(64)
            token_id_encoded = hex(token_id)[2:].zfill(64)
            
            data = function_signature + from_address_encoded + to_address_encoded + token_id_encoded
            
            return self._send_transaction(nft_address, to_address, data, gas_price)
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending ERC-721 NFT: {str(e)}"
            }
    
    def send_erc1155_nft(
        self,
        nft_address: str,
        to_address: str,
        token_id: int,
        amount: int = 1,
        gas_price: Optional[int] = None
    ) -> Dict:
        """
        Send ERC-1155 NFT
        
        Args:
            nft_address: ERC-1155 contract address
            to_address: Recipient address
            token_id: NFT token ID
            amount: Amount of tokens (usually 1 for NFTs)
            gas_price: Optional gas price in wei
        
        Returns:
            Dict with transaction hash or error
        """
        try:
            # ERC-1155 safeTransferFrom function signature
            # safeTransferFrom(address,address,uint256,uint256,bytes)
            function_signature = "0xf242432a"
            
            # Encode parameters: from, to, id, amount, data (empty bytes)
            from_address_encoded = self.sender_address[2:].zfill(64)
            to_address_encoded = to_address[2:].zfill(64)
            token_id_encoded = hex(token_id)[2:].zfill(64)
            amount_encoded = hex(amount)[2:].zfill(64)
            data_encoded = "80"  # Empty bytes (0x80 = 0 length)
            
            data = function_signature + from_address_encoded + to_address_encoded + token_id_encoded + amount_encoded + data_encoded
            
            return self._send_transaction(nft_address, to_address, data, gas_price)
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending ERC-1155 NFT: {str(e)}"
            }
    
    def _send_transaction(
        self,
        contract_address: str,
        to_address: str,
        data: str,
        gas_price: Optional[int] = None
    ) -> Dict:
        """Internal method to send a transaction"""
        if not self.account:
            return {
                "success": False,
                "error": "Private key not configured"
            }
        
        try:
            # Get nonce
            nonce = self.w3.eth.get_transaction_count(self.sender_address)
            
            # Build transaction
            transaction = {
                "to": contract_address,
                "data": data,
                "gas": 100000,  # Default gas limit
                "gasPrice": gas_price or self.w3.eth.gas_price,
                "nonce": nonce,
                "chainId": self.w3.eth.chain_id
            }
            
            # Estimate gas
            try:
                estimated_gas = self.w3.eth.estimate_gas(transaction)
                transaction["gas"] = estimated_gas
            except:
                pass  # Use default if estimation fails
            
            # Sign transaction
            signed_txn = self.account.sign_transaction(transaction)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Transaction failed: {str(e)}"
            }
    
    def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict]:
        """Get transaction receipt"""
        try:
            return self.w3.eth.get_transaction_receipt(tx_hash)
        except:
            return None
