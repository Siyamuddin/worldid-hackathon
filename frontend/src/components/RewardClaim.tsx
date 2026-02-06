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
      });
      alert(`Successfully claimed rewards! Transaction: ${result[0]?.transaction_hash || 'Pending'}`);
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
      <div>
        <p className="mb-2">Wallet: {address}</p>
        <WorldIDVerification
          onSuccess={handleWorldIdSuccess}
          signal={address}
          disabled={!isConnected}
        />
      </div>
      {worldIdProof && (
        <button
          onClick={handleClaim}
          disabled={claimRewards.isPending}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {claimRewards.isPending ? 'Claiming...' : 'Claim Rewards'}
        </button>
      )}
    </div>
  );
}
