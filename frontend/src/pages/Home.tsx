import { Link, useNavigate } from 'react-router-dom';
import { WalletConnect } from '../components/WalletConnect';
import { GoogleAuth } from '../components/GoogleAuth';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';

export function Home() {
  const { isAuthenticated, login } = useGoogleAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const navigate = useNavigate();

  const handleGoogleSuccess = (token: string) => {
    login(token);
    // Redirect to participant dashboard after login
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">WorldID Rewards</h1>
            <div className="flex gap-4">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/events"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Browse Events
                  </Link>
                  <WalletConnect />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Fair Reward Distribution
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            One person = one reward. Prevent multi-account abuse with WorldID.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Join events and claim rewards securely with proof of personhood
          </p>
          
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Get Started</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Sign in with Google to participate in events
                </p>
                <GoogleAuth onSuccess={handleGoogleSuccess} />
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center mb-8">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                My Dashboard
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Browse All Events
              </Link>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">How It Works</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium">Sign in with Google</p>
                  <p className="text-sm text-gray-600">Authenticate with your Google account</p>
                </div>
              </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Join Events</p>
                      <p className="text-sm text-gray-600">Participate in events or create your own</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Connect Wallet & Claim Rewards</p>
                      <p className="text-sm text-gray-600">Verify with WorldID to claim rewards (one person = one claim per event)</p>
                    </div>
                  </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🔒 Privacy Protected</h3>
            <p className="text-sm text-green-800">
              We use Zero-Knowledge Proofs to verify your uniqueness without revealing your identity. 
              We only store an anonymous hash - no personal information collected.
            </p>
          </div>
        </div>

        {/* Public Events List */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Available Events</h2>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                View My Events →
              </Link>
            )}
          </div>

          {eventsLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading events...</p>
            </div>
          )}

          {!eventsLoading && events && Array.isArray(events) && events.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No events available at the moment.</p>
              {isAuthenticated && (
                <Link
                  to="/organizer"
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Create an Event
                </Link>
              )}
            </div>
          )}

          {events && Array.isArray(events) && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
