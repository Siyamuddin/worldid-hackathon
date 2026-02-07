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
      alert('Please connect your wallet and verify with WorldID first');
      return;
    }

    if (!confirm('Are you sure you want to claim rewards? This action requires WorldID verification and can only be done once per event.')) {
      return;
    }

    try {
      const result = await claimRewards.mutateAsync({
        eventId,
        worldIdProof,
        walletAddress: address,
      });
      
      const transactionHash = result[0]?.transaction_hash || result?.transaction_hash;
      alert(
        `✅ Successfully claimed rewards!\n\n` +
        (transactionHash 
          ? `Transaction: ${transactionHash}\n` 
          : 'Transaction is being processed.\n') +
        `\nYou can only claim once per event. WorldID prevents duplicate claims.`
      );
      setWorldIdProof(null); // Reset to allow re-verification if needed
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to claim rewards';
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-3 sm:p-4 bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg">
        <p className="text-[#00FFC2] font-medium mb-2 text-sm sm:text-base">⚠️ Wallet Required</p>
        <p className="text-gray-300 text-xs sm:text-sm">
          Please connect your wallet first to claim rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="p-3 sm:p-4 bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg">
        <p className="text-xs sm:text-sm font-medium mb-1 text-gray-300">Your Wallet Address:</p>
        <p className="text-xs text-[#00FFC2] font-mono break-all">{address}</p>
      </div>
      
      <div className="p-3 sm:p-4 bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-[#00FFC2] text-base sm:text-lg flex-shrink-0">🔒</span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white mb-1">
              WorldID Verification Required
            </p>
            <p className="text-xs text-gray-300">
              Verify with WorldID to claim your rewards. This prevents duplicate claims and ensures one person = one reward.
            </p>
          </div>
        </div>
        <WorldIDVerification
          onSuccess={handleWorldIdSuccess}
          signal={address}
          disabled={!isConnected}
          showPrivacyInfo={true}
        />
      </div>
      
      {worldIdProof && (
        <div className="space-y-2">
          <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
            <p className="text-xs sm:text-sm text-green-400 font-medium flex items-center gap-2">
              <span>✓</span>
              WorldID verified successfully
            </p>
          </div>
          <button
            onClick={handleClaim}
            disabled={claimRewards.isPending}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
          >
            {claimRewards.isPending ? 'Processing Claim...' : 'Claim Rewards'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            ⚠️ You can only claim once per event. WorldID prevents duplicate claims automatically.
          </p>
        </div>
      )}
      
      {!worldIdProof && (
        <div className="p-3 bg-[#0a1f1a] border border-[#00FFC2]/20 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            Complete WorldID verification above to enable the claim button
          </p>
        </div>
      )}
    </div>
  );
}
