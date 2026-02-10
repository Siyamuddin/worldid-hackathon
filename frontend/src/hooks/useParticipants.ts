import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface EventParticipant {
  id: number;
  wallet_address: string | null;
  joined_at: string;
}

export interface EventParticipantsResponse {
  event_id: number;
  participants: EventParticipant[];
  count: number;
}

export function useEventParticipants(eventId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: async () => {
      const response = await api.get<EventParticipantsResponse>(`/api/events/${eventId}/participants`);
      return response.data;
    },
    enabled: !!eventId && enabled,
    retry: false,
  });
}

export interface EventClaim {
  id: number;
  participant_id: number;
  wallet_address: string | null;
  reward_id: number | null;
  status: string;
  transaction_hash: string | null;
  created_at: string;
}

export interface EventClaimsResponse {
  event_id: number;
  claims: EventClaim[];
  count: number;
}

export function useEventClaims(eventId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['event-claims', eventId],
    queryFn: async () => {
      const response = await api.get<EventClaimsResponse>(`/api/events/${eventId}/claims`);
      return response.data;
    },
    enabled: !!eventId && enabled,
    retry: false,
  });
}
