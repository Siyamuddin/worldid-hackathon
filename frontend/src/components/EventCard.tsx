import type { Event } from '../hooks/useEvents';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg hover:border-[#00FFC2]/40 transition-all">
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{event.name}</h3>
      <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {event.description || 'No description'}
      </p>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-[#00FFC2] font-semibold">
          {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''}
        </div>
        <Link
          to={`/events/${event.id}`}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] font-semibold transition-all text-center text-xs sm:text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
