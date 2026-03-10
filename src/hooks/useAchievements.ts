import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllAchievements, 
  getUserAchievements, 
  checkAndUnlockAchievements,
  unlockAchievement 
} from "@/lib/services/achievementService";
import { getUserStats } from "@/lib/services/gamificationService";
import type { Achievement, UserAchievement } from "@/lib/types";

/**
 * Hook to get all available achievements
 */
export function useAllAchievements() {
  return useQuery({
    queryKey: ["achievements", "all"],
    queryFn: getAllAchievements,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get user's achievements
 * @param userId User ID
 */
export function useUserAchievements(userId: string | null) {
  return useQuery({
    queryKey: ["achievements", "user", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getUserAchievements(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to check and unlock achievements
 */
export function useCheckAchievements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const stats = await getUserStats(userId);
      if (!stats) return [];
      return await checkAndUnlockAchievements(userId, stats);
    },
    onSuccess: (newlyUnlocked, variables) => {
      queryClient.invalidateQueries({ queryKey: ["achievements", "user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["userStats", variables.userId] });
    },
  });
}

/**
 * Hook to unlock a specific achievement
 */
export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, achievementId }: { userId: string; achievementId: string }) => {
      return await unlockAchievement(userId, achievementId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["achievements", "user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["userStats", variables.userId] });
    },
  });
}

