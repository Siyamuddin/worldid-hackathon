import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticipantProfile } from '../hooks/useParticipant';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { WalletConnect } from '../components/WalletConnect';
import { SimpleAuth } from '../components/SimpleAuth';
import { CreateEvent } from '../components/CreateEvent';
import { useMyEvents, usePublishEvent, useUnpublishEvent } from '../hooks/useEvents';
import { Header } from '../components/Header';

export function ParticipantDashboard() {
  const { data: profile, isLoading, error } = useParticipantProfile();
  const { isAuthenticated, logout } = useGoogleAuth();
  const navigate = useNavigate();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const { data: myEvents } = useMyEvents();
  const publishEvent = usePublishEvent();
  const unpublishEvent = useUnpublishEvent();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a1f1a] flex items-center justify-center px-4 py-8">
        <div className="bg-[#0f2a24] border border-[#00FFC2]/20 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-white">Participant Login</h2>
          <p className="text-xs sm:text-sm text-gray-300 mb-4 text-center">
            Sign in to access your dashboard
          </p>
          <SimpleAuth onSuccess={() => {
            // Refresh the page to load profile
            window.location.reload();
          }} />
          <div className="mt-4 text-center">
            <Link to="/" className="text-[#00FFC2] hover:text-[#00e6b8] text-xs sm:text-sm transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <Header showNav={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pt-24 sm:pt-28 md:pt-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Participant Dashboard</h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-300">Loading your profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <p className="text-red-300">
              Error loading profile. Please try again.
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Summary */}
            <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">My Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Google ID</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-200 break-all">{profile.google_id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Wallet Address</p>
                  {profile.wallet_address ? (
                    <p className="font-mono text-xs sm:text-sm break-all text-gray-200">{profile.wallet_address}</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400">Not connected</p>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Member Since</p>
                  <p className="text-xs sm:text-sm text-gray-200">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Events Joined</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#00FFC2]">{profile.joined_events.length}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Events Created</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#00FFC2]">{profile.created_events?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Create Event Section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Create Event</h2>
                <button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors text-sm sm:text-base"
                >
                  {showCreateEvent ? 'Cancel' : 'Create New Event'}
                </button>
              </div>

              {showCreateEvent && (
                <CreateEvent
                  onSuccess={() => {
                    setShowCreateEvent(false);
                    window.location.reload(); // Refresh to show new event
                  }}
                  onCancel={() => setShowCreateEvent(false)}
                />
              )}
            </div>

            {/* Created Events */}
            {profile.created_events && profile.created_events.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">My Created Events</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {profile.created_events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg hover:border-[#00FFC2]/40 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white flex-1 min-w-0">{event.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                          event.is_published 
                            ? 'bg-[#00FFC2]/20 text-[#00FFC2] border border-[#00FFC2]/40' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {event.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {event.description || 'No description'}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-[#00FFC2] mb-3 sm:mb-4">
                        {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {event.is_published ? (
                          <button
                            onClick={() => unpublishEvent.mutate(event.id)}
                            disabled={unpublishEvent.isPending}
                            className="flex-1 px-4 py-2.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-xs sm:text-sm transition-colors"
                          >
                            {unpublishEvent.isPending ? 'Unpublishing...' : 'Unpublish'}
                          </button>
                        ) : (
                          <button
                            onClick={() => publishEvent.mutate(event.id)}
                            disabled={publishEvent.isPending}
                            className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 text-xs sm:text-sm font-semibold transition-colors"
                          >
                            {publishEvent.isPending ? 'Publishing...' : 'Publish'}
                          </button>
                        )}
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-center text-xs sm:text-sm font-semibold transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participated Events */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Events I Joined</h2>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors text-center text-sm sm:text-base"
                >
                  Browse More Events
                </Link>
              </div>

              {profile.joined_events.length === 0 ? (
                <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-8 sm:p-12 text-center">
                  <p className="text-gray-300 mb-4 text-sm sm:text-base">You haven't joined any events yet.</p>
                  <Link
                    to="/browse"
                    className="inline-block w-full sm:w-auto px-6 py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-colors text-sm sm:text-base"
                  >
                    Browse Available Events
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {profile.joined_events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg hover:border-[#00FFC2]/40 transition-all"
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{event.name}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {event.description || 'No description'}
                      </p>
                      
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        {event.start_date && (
                          <p className="text-xs text-gray-400">
                            Start: {new Date(event.start_date).toLocaleDateString()}
                          </p>
                        )}
                        {event.end_date && (
                          <p className="text-xs text-gray-400">
                            End: {new Date(event.end_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm font-medium text-[#00FFC2]">
                          {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''} available
                        </p>
                      </div>

                      <div className="flex gap-2 mb-3 sm:mb-0">
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-center text-xs sm:text-sm font-semibold transition-colors"
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#00FFC2]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Status</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              event.is_active
                                ? 'bg-[#00FFC2]/20 text-[#00FFC2] border border-[#00FFC2]/40'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {event.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
