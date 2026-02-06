import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { WorldIDVerification } from './WorldIDVerification';
import { useJoinEvent } from '../hooks/useEvents';

interface EventJoinProps {
  eventId: number;
}

export function EventJoin({ eventId }: EventJoinProps) {
  const { address, isConnected } = useWallet();
  const [worldIdProof, setWorldIdProof] = useState<any>(null);
  const joinEvent = useJoinEvent();

  const handleWorldIdSuccess = (proof: any) => {
    setWorldIdProof(proof);
  };

  const handleJoin = async () => {
    if (!isConnected || !address || !worldIdProof) {
      return;
    }

    try {
      await joinEvent.mutateAsync({
        eventId,
        walletAddress: address,
        worldIdProof,
      });
      alert('Successfully joined event!');
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
          onClick={handleJoin}
          disabled={joinEvent.isPending}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {joinEvent.isPending ? 'Joining...' : 'Join Event'}
        </button>
      )}
    </div>
  );
}
