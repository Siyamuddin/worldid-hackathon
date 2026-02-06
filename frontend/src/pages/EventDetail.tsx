import { useParams } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import { EventJoin } from '../components/EventJoin';
import { RewardClaim } from '../components/RewardClaim';
import { WalletConnect } from '../components/WalletConnect';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : 0;
  const { data: event, isLoading, error } = useEvent(eventId);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">WorldID Rewards</h1>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && <p>Loading event...</p>}
        {error && <p className="text-red-500">Error loading event</p>}

        {event && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
            <p className="text-gray-600 mb-6">{event.description || 'No description'}</p>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Join Event</h3>
                <EventJoin eventId={eventId} />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Claim Rewards</h3>
                <RewardClaim eventId={eventId} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
