import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { WalletConnect } from '../components/WalletConnect';

export function Events() {
  const { data: events, isLoading, error } = useEvents();

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Available Events</h2>

        {isLoading && <p>Loading events...</p>}
        {error && <p className="text-red-500">Error loading events</p>}
        
        {events && events.length === 0 && (
          <p className="text-gray-500">No events available</p>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
