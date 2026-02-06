import { useParams } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import { EventJoin } from '../components/EventJoin';
import { RewardClaim } from '../components/RewardClaim';
import { WalletConnect } from '../components/WalletConnect';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { GoogleAuth } from '../components/GoogleAuth';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? parseInt(id) : 0;
  const { data: event, isLoading, error } = useEvent(eventId);
  const { isAuthenticated } = useGoogleAuth();

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
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{event.reward_count}</strong> reward{event.reward_count !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs text-blue-600 mt-1">
                One person = one claim per event (enforced by WorldID)
              </p>
            </div>

            <PrivacyNotice />

            {!isAuthenticated ? (
              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please sign in with Google to participate in this event.
                </p>
                <GoogleAuth />
              </div>
            ) : (
              <div className="space-y-8 mt-8">
              <div>
                  <h3 className="text-xl font-semibold mb-2">Step 1: Join Event</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to join this event. No WorldID required for joining.
                  </p>
                  <EventJoin eventId={eventId} />
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold mb-2">Step 2: Connect Wallet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your wallet to receive rewards. This is only needed when claiming.
                  </p>
                  <WalletConnect />
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold mb-2">Step 3: Claim Rewards</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    After joining and connecting your wallet, verify with WorldID again to claim your rewards. 
                    Each claim requires a fresh proof to prevent abuse.
                  </p>
                <RewardClaim eventId={eventId} />
              </div>
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
