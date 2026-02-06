import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { WorldIDVerification } from './WorldIDVerification';
import { useClaimRewards } from '../hooks/useEvents';

interface RewardClaimProps {
  eventId: number;
}

export function RewardClaim({ eventId }: RewardClaimProps) {
  const { address, isConnected } = useWallet();
  const [worldIdProof, setWorldIdProof] = useState<any>(null);
  const claimRewards = useClaimRewards();

  const handleWorldIdSuccess = (proof: any) => {
    setWorldIdProof(proof);
  };

  const handleClaim = async () => {
    if (!isConnected || !address || !worldIdProof) {
      return;
    }

    try {
      const result = await claimRewards.mutateAsync({
        eventId,
        worldIdProof,
        walletAddress: address,
      });
      alert(`Successfully claimed rewards! Transaction: ${result[0]?.transaction_hash || 'Pending'}`);
      setWorldIdProof(null); // Reset to allow re-verification if needed
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
        Please connect your wallet first
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium mb-1">Your Wallet:</p>
        <p className="text-xs text-gray-600 font-mono break-all">{address}</p>
      </div>
      
      <div>
        <p className="text-sm text-gray-700 mb-2">
          Verify with WorldID to claim your rewards. A fresh proof is required for each claim:
        </p>
        <WorldIDVerification
          onSuccess={handleWorldIdSuccess}
          signal={address}
          disabled={!isConnected}
          showPrivacyInfo={true}
        />
      </div>
      
      {worldIdProof && (
        <div className="space-y-2">
          <button
            onClick={handleClaim}
            disabled={claimRewards.isPending}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {claimRewards.isPending ? 'Processing Claim...' : 'Claim Rewards'}
          </button>
          <p className="text-xs text-gray-600 text-center">
            You can only claim once per event. Duplicate claims are prevented automatically.
          </p>
        </div>
      )}
    </div>
  );
}
