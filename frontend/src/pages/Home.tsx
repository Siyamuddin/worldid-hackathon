import { Link, useNavigate } from 'react-router-dom';
import { SimpleAuth } from '../components/SimpleAuth';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { Header } from '../components/Header';

export function Home() {
  const { isAuthenticated, login, isLoading: authLoading } = useGoogleAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const navigate = useNavigate();

  const handleGoogleSuccess = (token: string) => {
    login(token);
    // Small delay to ensure state is updated before navigation
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <Header showWallet={false} />

      <main className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Landing Page Content - Only show when not authenticated */}
        {!authLoading && !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center w-full max-w-sm">
            {/* Fingerprint Icon */}
            <div className="relative mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#00FFC2] flex items-center justify-center relative shadow-[0_0_30px_rgba(0,255,194,0.6)]">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[#00FFC2]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.654-1.923 1.006-3.968 1.006-6.531 0-1.45-.19-2.85-.54-4.16m5.281 0c.35 1.31.54 2.71.54 4.16 0 2.563-.352 4.608-1.006 6.531M12 11a9 9 0 01-9-9m9 9a9 9 0 009-9m-9 9v10m0-10a9 9 0 00-9 9m9-9a9 9 0 019 9"
                  />
                </svg>
              </div>
            </div>

            {/* INHUMAN Title */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-2 sm:mb-3 text-white text-center"
              style={{ textShadow: '0 0 20px rgba(0, 255, 194, 0.8), 0 0 40px rgba(0, 255, 194, 0.4)' }}
            >
              INHUMAN
            </h1>

            {/* Sign in to continue */}
            <p className="text-gray-300 text-xs sm:text-sm mb-6 sm:mb-10 text-center">Sign in to continue</p>

            {/* Sign In Button */}
            <div className="w-full mb-6 sm:mb-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center">
                  Sign in to participate in events
                </p>
                <SimpleAuth onSuccess={handleGoogleSuccess} />
              </div>
            </div>

            {/* World ID Card */}
            <div className="w-full bg-[#0f2a24] rounded-2xl p-4 sm:p-6 border border-[#00FFC2]/20">
              {/* Powered by World ID Badge */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#00FFC2] rounded-lg flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide">POWERED BY WORLD ID</span>
                </div>
              </div>

              {/* Description Text */}
              <p className="text-gray-300 text-xs sm:text-sm text-center mb-4 sm:mb-6 leading-relaxed">
                Some actions require <strong className="text-white">human</strong> verification to protect the community.
              </p>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FFC2]/30"></div>
                <div className="w-2 h-2 rounded-full bg-[#00FFC2]"></div>
                <div className="w-2 h-2 rounded-full bg-[#00FFC2]/30"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated View - Show dashboard links */
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-20 sm:pt-24">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
                Fair Reward Distribution
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-3 sm:mb-4 px-2">
                One person = one reward. Prevent multi-account abuse with WorldID.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-6 sm:mb-8 px-2">
                Join events and claim rewards securely with proof of personhood
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-all text-center"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto px-6 py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-all text-center"
                >
                  Browse All Events
                </Link>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">How It Works</h3>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm sm:text-base">Sign in with Google</p>
                      <p className="text-xs sm:text-sm text-gray-300">Authenticate with your Google account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm sm:text-base">Join Events</p>
                      <p className="text-xs sm:text-sm text-gray-300">Participate in events or create your own</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#00FFC2]/20 border border-[#00FFC2] rounded-full flex items-center justify-center font-bold text-[#00FFC2] text-sm sm:text-base">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm sm:text-base">Connect Wallet & Claim Rewards</p>
                      <p className="text-xs sm:text-sm text-gray-300">Verify with WorldID to claim rewards (one person = one claim per event)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#00FFC2] mb-2">🔒 Privacy Protected</h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  We use Zero-Knowledge Proofs to verify your uniqueness without revealing your identity. 
                  We only store an anonymous hash - no personal information collected.
                </p>
              </div>
            </div>

            {/* Public Events List */}
            <div className="mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Available Events</h2>
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="text-sm sm:text-base px-4 py-2 text-[#00FFC2] hover:text-[#00e6b8] transition-colors"
                  >
                    View My Events →
                  </Link>
                )}
              </div>

              {eventsLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-300">Loading events...</p>
                </div>
              )}

              {!eventsLoading && events && Array.isArray(events) && events.length === 0 && (
                <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-300 mb-4">No events available at the moment.</p>
                  <Link
                    to="/browse"
                    className="inline-block px-6 py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors"
                  >
                    Browse Events
                  </Link>
                </div>
              )}

              {events && Array.isArray(events) && events.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {events.slice(0, 6).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  <div className="text-center">
                    <Link
                      to="/browse"
                      className="inline-block w-full sm:w-auto px-6 py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors"
                    >
                      View All Events →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
