import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, getUserRank } from "@/lib/services/gamificationService";
import type { LeaderboardEntry } from "@/lib/types";

/**
 * Hook to get leaderboard
 * @param limitCount Number of entries to return
 * @param timeframe "global" | "weekly"
 */
export function useLeaderboard(limitCount: number = 100, timeframe: "global" | "weekly" = "global") {
  return useQuery({
    queryKey: ["leaderboard", timeframe, limitCount],
    queryFn: () => getLeaderboard(limitCount, timeframe),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get user's rank
 * @param userId User ID
 * @param timeframe "global" | "weekly"
 */
export function useUserRank(userId: string | null, timeframe: "global" | "weekly" = "global") {
  return useQuery({
    queryKey: ["userRank", userId, timeframe],
    queryFn: async () => {
      if (!userId) return null;
      return await getUserRank(userId, timeframe);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}

