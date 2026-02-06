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
}

export function useParticipantProfile() {
  return useQuery({
    queryKey: ['participant-profile'],
    queryFn: async () => {
      const response = await api.get<ParticipantProfile>('/api/profile/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('participant_token'),
    retry: false,
  });
}
