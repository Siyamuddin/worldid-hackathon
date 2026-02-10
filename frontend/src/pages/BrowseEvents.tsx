import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { Header } from '../components/Header';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { SimpleAuth } from '../components/SimpleAuth';
import { useJoinEvent } from '../hooks/useEvents';

export function BrowseEvents() {
  const { data: events, isLoading, error } = useEvents();
  const { isAuthenticated } = useGoogleAuth();
  const [joiningEventId, setJoiningEventId] = useState<number | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState<number | null>(null);
  const joinEvent = useJoinEvent();

  const handleJoinClick = (eventId: number) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(eventId);
      return;
    }
    handleJoinEvent(eventId);
  };

  const handleJoinEvent = async (eventId: number) => {
    setJoiningEventId(eventId);
    setShowLoginPrompt(null);
    try {
      await joinEvent.mutateAsync({ eventId });
      alert('Successfully joined event! You can now claim rewards.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to join event';
      if (errorMessage.includes('already joined') || errorMessage.includes('already exists')) {
        alert('You have already joined this event!');
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleGoogleSuccess = () => {
    // After successful login, if there was a pending join, trigger it
    if (showLoginPrompt) {
      setTimeout(() => {
        handleJoinEvent(showLoginPrompt);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <Header showNav={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pt-24 sm:pt-28 md:pt-32">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">Browse Events</h1>
          <p className="text-gray-300 text-base sm:text-lg">
            Discover and join events. Sign in to register for events and claim rewards.
          </p>
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-[#0f2a24] border border-[#00FFC2]/30 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">Sign In Required</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">
                Please sign in to join this event and claim rewards.
              </p>
              <SimpleAuth onSuccess={handleGoogleSuccess} />
              <button
                onClick={() => setShowLoginPrompt(null)}
                className="mt-4 w-full px-4 py-2.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-300">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <p className="text-red-300">Error loading events. Please try again later.</p>
          </div>
        )}
        
        {!isLoading && !error && events && events.length === 0 && (
          <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-12 text-center">
            <p className="text-gray-300 mb-4 text-lg">No events available at the moment.</p>
            <p className="text-gray-400 text-sm">Check back later for new events!</p>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-[#00FFC2]/40 transition-all"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{event.name}</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                  {event.description || 'No description available'}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm text-[#00FFC2] font-semibold">
                    {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''}
                  </div>
                  {event.start_date && (
                    <div className="text-xs text-gray-400">
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2]/20 border border-[#00FFC2]/40 text-[#00FFC2] rounded-lg hover:bg-[#00FFC2]/30 text-center text-xs sm:text-sm font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleJoinClick(event.id)}
                    disabled={joiningEventId === event.id || joinEvent.isPending}
                    className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors"
                  >
                    {joiningEventId === event.id || joinEvent.isPending
                      ? 'Joining...'
                      : isAuthenticated
                      ? 'Join Event'
                      : 'Join (Sign In)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                1
              </div>
              <div>
                <p className="font-medium text-white mb-1 text-sm sm:text-base">Browse Events</p>
                <p className="text-xs sm:text-sm text-gray-300">View all available events without signing in</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                2
              </div>
              <div>
                <p className="font-medium text-white mb-1 text-sm sm:text-base">Sign In & Join</p>
                <p className="text-xs sm:text-sm text-gray-300">Sign in to join events</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                3
              </div>
              <div>
                <p className="font-medium text-white mb-1 text-sm sm:text-base">Claim Rewards</p>
                <p className="text-xs sm:text-sm text-gray-300">Verify with WorldID to claim your rewards</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
