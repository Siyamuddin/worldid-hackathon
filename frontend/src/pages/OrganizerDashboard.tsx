import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { RewardType } from '../lib/types';

interface Event {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  rewards: any[];
}

export function OrganizerDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/api/organizers/login', credentials);
      localStorage.setItem('organizer_token', response.data.access_token);
      return response.data;
    },
    onSuccess: () => {
      setIsLoggedIn(true);
    },
  });

  const { data: events } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: async () => {
      const response = await api.get<Event[]>('/api/organizers/events');
      return response.data;
    },
    enabled: isLoggedIn,
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await api.post('/api/organizers/events', eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      setShowCreateEvent(false);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login.mutateAsync({ email, password });
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
      name: formData.get('name'),
      description: formData.get('description'),
      rewards: [],
    };
    await createEvent.mutateAsync(eventData);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6">Organizer Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {login.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem('organizer_token');
                setIsLoggedIn(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">My Events</h2>
          <button
            onClick={() => setShowCreateEvent(!showCreateEvent)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {showCreateEvent ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {showCreateEvent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={createEvent.isPending}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

        {events && events.length === 0 && (
          <p className="text-gray-500">No events created yet</p>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-4">{event.description || 'No description'}</p>
                <p className="text-sm text-gray-500">
                  {event.rewards.length} reward{event.rewards.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
