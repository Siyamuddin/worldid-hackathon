import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { Header } from '../components/Header';

export function Events() {
  const { data: events, isLoading, error } = useEvents();

  return (
    <div className="min-h-screen bg-[#0a1f1a] relative overflow-hidden">
      <Header showNav={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pt-24 sm:pt-28 md:pt-32">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-white">Available Events</h2>

        {isLoading && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-300">Loading events...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 sm:p-6 mb-6">
            <p className="text-red-400 text-sm sm:text-base">Error loading events</p>
          </div>
        )}
        
        {events && events.length === 0 && (
          <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-400 text-sm sm:text-base">No events available</p>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
