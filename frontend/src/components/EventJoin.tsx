import { useJoinEvent } from '../hooks/useEvents';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { GoogleAuth } from './GoogleAuth';

interface EventJoinProps {
  eventId: number;
}

export function EventJoin({ eventId }: EventJoinProps) {
  const { isAuthenticated } = useGoogleAuth();
  const joinEvent = useJoinEvent();

  const handleJoin = async () => {
    try {
      await joinEvent.mutateAsync({ eventId });
      alert('Successfully joined event!');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          <p className="font-medium mb-2">Please sign in with Google first</p>
          <GoogleAuth />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-700 mb-4">
          Click the button below to join this event. You can only join once per event.
        </p>
        <button
          onClick={handleJoin}
          disabled={joinEvent.isPending}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {joinEvent.isPending ? 'Joining Event...' : 'Join Event'}
        </button>
        <p className="text-xs text-gray-600 text-center mt-2">
          WorldID verification is only required when claiming rewards.
        </p>
      </div>
    </div>
  );
}
