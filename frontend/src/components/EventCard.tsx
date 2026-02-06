import { Event } from '../hooks/useEvents';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">
        {event.description || 'No description'}
      </p>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {event.reward_count} reward{event.reward_count !== 1 ? 's' : ''}
        </div>
        <Link
          to={`/events/${event.id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
