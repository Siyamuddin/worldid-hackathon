import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface ParticipantProfile {
  id: number;
  google_id: string;
  wallet_address: string | null;
  created_at: string;
  joined_events: Array<{
    id: number;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    is_published: boolean;
    created_at: string;
    reward_count: number;
  }>;
  created_events?: Array<{
    id: number;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    is_published: boolean;
    created_at: string;
    reward_count: number;
  }>;
}

export function useParticipantProfile() {
  return useQuery({
    queryKey: ['participant-profile'],
    queryFn: async () => {
      try {
        const response = await api.get<ParticipantProfile>('/api/profile/me');
        return response.data;
      } catch (error: any) {
        // If 401 or 403, user is not authenticated - clear token and return null
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('participant_token');
          throw error; // Re-throw to let React Query handle it
        }
        // For other errors, log and re-throw
        console.error('Error fetching participant profile:', error);
        throw error;
      }
    },
    enabled: !!localStorage.getItem('participant_token'),
    retry: false,
  });
}
