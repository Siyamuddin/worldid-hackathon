import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticipantProfile } from '../hooks/useParticipant';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { WalletConnect } from '../components/WalletConnect';
import { GoogleAuth } from '../components/GoogleAuth';
import { CreateEvent } from '../components/CreateEvent';
import { useMyEvents, usePublishEvent, useUnpublishEvent } from '../hooks/useEvents';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Participant Login</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Sign in with Google to access your dashboard
          </p>
          <GoogleAuth onSuccess={() => {
            // Refresh the page to load profile
            window.location.reload();
          }} />
          <div className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">Participant Dashboard</h1>
            <div className="flex gap-4 items-center">
              <Link
                to="/events"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Browse Events
              </Link>
              <Link
                to="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Home
              </Link>
              <WalletConnect />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">
              Error loading profile. Please try again.
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">My Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Google ID</p>
                  <p className="font-mono text-sm">{profile.google_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wallet Address</p>
                  {profile.wallet_address ? (
                    <p className="font-mono text-sm break-all">{profile.wallet_address}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Events Joined</p>
                  <p className="text-2xl font-bold">{profile.joined_events.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Events Created</p>
                  <p className="text-2xl font-bold">{profile.created_events?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Create Event Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create Event</h2>
                <button
                  onClick={() => setShowCreateEvent(!showCreateEvent)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                  <h2 className="text-2xl font-bold">My Created Events</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.created_events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description || 'No description'}
                      </p>
                      <p className="text-sm font-medium text-blue-600 mb-4">
                        {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''}
                      </p>
                      <div className="flex gap-2">
                        {event.is_published ? (
                          <button
                            onClick={() => unpublishEvent.mutate(event.id)}
                            disabled={unpublishEvent.isPending}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 text-sm"
                          >
                            {unpublishEvent.isPending ? 'Unpublishing...' : 'Unpublish'}
                          </button>
                        ) : (
                          <button
                            onClick={() => publishEvent.mutate(event.id)}
                            disabled={publishEvent.isPending}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                          >
                            {publishEvent.isPending ? 'Publishing...' : 'Publish'}
                          </button>
                        )}
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center text-sm"
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Events I Joined</h2>
                <Link
                  to="/events"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Browse More Events
                </Link>
              </div>

              {profile.joined_events.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600 mb-4">You haven't joined any events yet.</p>
                  <Link
                    to="/events"
                    className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Browse Available Events
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.joined_events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description || 'No description'}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {event.start_date && (
                          <p className="text-xs text-gray-500">
                            Start: {new Date(event.start_date).toLocaleDateString()}
                          </p>
                        )}
                        {event.end_date && (
                          <p className="text-xs text-gray-500">
                            End: {new Date(event.end_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm font-medium text-blue-600">
                          {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''} available
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              event.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
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
