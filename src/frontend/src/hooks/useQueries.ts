import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Holding, UserProfile, UserRole } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetHoldings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHoldings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddHolding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ asset, quantity, costBasis }: { asset: string; quantity: number; costBasis: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHolding(asset, quantity, costBasis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      toast.success('Holding added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add holding');
    },
  });
}

export function useUpdateHolding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ asset, quantity, costBasis }: { asset: string; quantity: number; costBasis: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHolding(asset, quantity, costBasis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      toast.success('Holding updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update holding');
    },
  });
}

export function useDeleteHolding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHolding(asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      toast.success('Holding deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete holding');
    },
  });
}
