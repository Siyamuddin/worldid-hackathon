import { useState } from 'react';
import { useCreateEvent } from '../hooks/useEvents';

interface CreateEventProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateEvent({ onSuccess, onCancel }: CreateEventProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const createEvent = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Event name is required');
      return;
    }

    try {
      await createEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        rewards: [], // Can be extended later to add rewards during creation
      });
      
      // Reset form
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      
      alert('Event created successfully!');
      onSuccess?.();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message || 'Failed to create event'}`);
    }
  };

  return (
    <div className="bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Create New Event</h3>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
            Event Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 bg-[#0a1f1a] border border-[#00FFC2]/30 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFC2] focus:border-[#00FFC2]"
            placeholder="Enter event name"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 bg-[#0a1f1a] border border-[#00FFC2]/30 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFC2] focus:border-[#00FFC2]"
            rows={3}
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 bg-[#0a1f1a] border border-[#00FFC2]/30 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2] focus:border-[#00FFC2]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 bg-[#0a1f1a] border border-[#00FFC2]/30 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFC2] focus:border-[#00FFC2]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
          <button
            type="submit"
            disabled={createEvent.isPending}
            className="flex-1 px-6 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Note: You can add rewards and publish the event after creation.
        </p>
      </form>
    </div>
  );
}
