import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserStats, updateUserStats, awardPoints, awardXP } from "@/lib/services/gamificationService";
import type { UserStats } from "@/lib/types";

/**
 * Hook to get user stats
 * @param userId User ID
 * @param enabled Whether the query is enabled
 */
export function useUserStats(userId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return await getUserStats(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30000, // Refetch every 30 seconds for near real-time updates
  });
}

/**
 * Hook to update user stats
 */
export function useUpdateUserStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserStats> }) => {
      await updateUserStats(userId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userStats", variables.userId] });
    },
  });
}

/**
 * Hook to award points
 */
export function useAwardPoints() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, points, reason }: { userId: string; points: number; reason: string }) => {
      return await awardPoints(userId, points, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userStats", variables.userId] });
    },
  });
}

/**
 * Hook to award XP
 */
export function useAwardXP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, xp, reason }: { userId: string; xp: number; reason: string }) => {
      return await awardXP(userId, xp, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userStats", variables.userId] });
    },
  });
}

