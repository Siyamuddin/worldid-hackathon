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
      try {
        const response = await api.get<Event[]>('/api/public/events');
        // Ensure we always return an array
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching events:', error);
        // Return empty array on error
        return [];
      }
    },
  });
}

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get<Event>(`/api/public/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId }: {
      eventId: number;
    }) => {
      const response = await api.post(`/api/events/${eventId}/join`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['participantProfile'] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      rewards?: any[];
    }) => {
      const response = await api.post('/api/events', eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['participantProfile'] });
    },
  });
}

export function useMyEvents() {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const response = await api.get<Event[]>('/api/events');
      return Array.isArray(response.data) ? response.data : [];
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await api.post(`/api/events/${eventId}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['participantProfile'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUnpublishEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await api.post(`/api/events/${eventId}/unpublish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['participantProfile'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useClaimRewards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, worldIdProof, walletAddress }: {
      eventId: number;
      worldIdProof: any;
      walletAddress: string;
    }) => {
      const response = await api.post(`/api/events/${eventId}/claim`, {
        world_id_proof: worldIdProof,
        wallet_address: walletAddress,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}
