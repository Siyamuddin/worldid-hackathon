import { useState } from 'react';
import api from '../lib/api';

interface AddRewardProps {
  eventId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type RewardType = 'ERC20' | 'ERC721' | 'ERC1155';

export function AddReward({ eventId, onSuccess, onCancel }: AddRewardProps) {
  const [rewardType, setRewardType] = useState<RewardType>('ERC20');
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!tokenAddress.trim()) {
      setError('Token address is required');
      return;
    }

    if (rewardType === 'ERC20' && !amount) {
      setError('Amount is required for ERC20 tokens');
      return;
    }

    if ((rewardType === 'ERC721' || rewardType === 'ERC1155') && !tokenId) {
      setError('Token ID is required for NFTs');
      return;
    }

    setIsLoading(true);

    try {
      // Parse amount and token_id, ensuring we don't send NaN
      const parsedAmount = rewardType === 'ERC20' && amount ? parseFloat(amount) : undefined;
      const parsedTokenId = (rewardType === 'ERC721' || rewardType === 'ERC1155') && tokenId ? parseInt(tokenId) : undefined;
      
      // Validate parsed values are not NaN
      if (rewardType === 'ERC20' && (parsedAmount === undefined || isNaN(parsedAmount))) {
        setError('Invalid amount. Please enter a valid number.');
        setIsLoading(false);
        return;
      }
      
      if ((rewardType === 'ERC721' || rewardType === 'ERC1155') && (parsedTokenId === undefined || isNaN(parsedTokenId))) {
        setError('Invalid token ID. Please enter a valid number.');
        setIsLoading(false);
        return;
      }

      await api.post(`/api/events/${eventId}/rewards`, {
        reward_type: rewardType,
        token_address: tokenAddress.trim(),
        amount: parsedAmount,
        token_id: parsedTokenId,
        name: name.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Reset form
      setTokenAddress('');
      setAmount('');
      setTokenId('');
      setName('');
      setDescription('');
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add reward';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">Add Reward</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Reward Type */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Reward Type
          </label>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value as RewardType)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
          >
            <option value="ERC20">ERC20 Token</option>
            <option value="ERC721">ERC721 NFT</option>
            <option value="ERC1155">ERC1155 NFT</option>
          </select>
        </div>

        {/* Token Address */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Token Address <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            required
            placeholder="0x..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
          />
        </div>

        {/* Amount (ERC20 only) */}
        {rewardType === 'ERC20' && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.000000000000000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="100.0"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
            />
          </div>
        )}

        {/* Token ID (ERC721/ERC1155 only) */}
        {(rewardType === 'ERC721' || rewardType === 'ERC1155') && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Token ID <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              required
              placeholder="1"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
            />
          </div>
        )}

        {/* Name (Optional) */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Name (Optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Reward Name"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
          />
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reward description"
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'Adding...' : 'Add Reward'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
