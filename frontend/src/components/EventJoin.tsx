import { useJoinEvent } from '../hooks/useEvents';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { SimpleAuth } from './SimpleAuth';

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
      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg">
          <p className="font-medium mb-2 text-white text-sm sm:text-base">Please sign in first</p>
          <SimpleAuth />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
          Click the button below to join this event. You can only join once per event.
        </p>
        <button
          onClick={handleJoin}
          disabled={joinEvent.isPending}
          className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
        >
          {joinEvent.isPending ? 'Joining Event...' : 'Join Event'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          WorldID verification is only required when claiming rewards.
        </p>
      </div>
    </div>
  );
}
