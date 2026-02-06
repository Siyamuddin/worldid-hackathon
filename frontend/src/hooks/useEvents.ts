import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Event {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  reward_count: number;
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get<Event[]>('/api/events');
      return response.data;
    },
  });
}

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get<Event>(`/api/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, walletAddress, worldIdProof }: {
      eventId: number;
      walletAddress: string;
      worldIdProof: any;
    }) => {
      const response = await api.post(`/api/events/${eventId}/join`, {
        wallet_address: walletAddress,
        world_id_proof: worldIdProof,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useClaimRewards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, worldIdProof }: {
      eventId: number;
      worldIdProof: any;
    }) => {
      const response = await api.post(`/api/events/${eventId}/claim`, {
        world_id_proof: worldIdProof,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
