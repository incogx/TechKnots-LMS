import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  runTransaction,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDB, COLLECTIONS, SUBCOLLECTIONS } from "../firestore";
import type { UserStats, LeaderboardEntry, DailyChallengeCompletion } from "../types";
import { calculateLevel, checkLevelUp } from "../utils/levelSystem";

/**
 * Get user stats from Firestore
 * @param userId User ID
 * @returns User stats or null if not found
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const db = getFirestoreDB();
    const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
    const statsSnap = await getDoc(statsRef);
    
    if (!statsSnap.exists()) {
      // Initialize default stats
      const defaultStats: UserStats = {
        points: 0,
        xp: 0,
        level: 1,
        streak: 0,
        totalProblemsSolved: 0,
        totalCoursesCompleted: 0,
        problemsSolvedToday: 0,
        pointsEarnedToday: 0,
        pointsEarnedThisWeek: 0,
        pointsEarnedThisMonth: 0,
        lastUpdated: new Date().toISOString(),
      };
      await setDoc(statsRef, defaultStats);
      return defaultStats;
    }
    
    return statsSnap.data() as UserStats;
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
}

/**
 * Update user stats atomically
 * @param userId User ID
 * @param updates Partial stats to update
 */
export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
  try {
    const db = getFirestoreDB();
    const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
    await updateDoc(statsRef, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
    throw error;
  }
}

/**
 * Award points to user
 * @param userId User ID
 * @param points Points to award
 * @param reason Reason for awarding points
 * @returns Updated stats
 */
export async function awardPoints(
  userId: string,
  points: number,
  reason: string
): Promise<UserStats> {
  try {
    const db = getFirestoreDB();
    return await runTransaction(db, async (transaction) => {
      const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
      const statsSnap = await transaction.get(statsRef);
      
      let currentStats: UserStats;
      if (!statsSnap.exists()) {
        currentStats = {
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          totalProblemsSolved: 0,
          totalCoursesCompleted: 0,
          problemsSolvedToday: 0,
          pointsEarnedToday: 0,
          pointsEarnedThisWeek: 0,
          pointsEarnedThisMonth: 0,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        currentStats = statsSnap.data() as UserStats;
      }
      
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const lastUpdateDate = currentStats.lastUpdated?.split("T")[0] || today;
      
      // Reset daily stats if it's a new day
      const pointsEarnedToday = lastUpdateDate === today 
        ? currentStats.pointsEarnedToday + points 
        : points;
      
      // Update weekly/monthly stats (simplified - in production, use proper date calculations)
      const pointsEarnedThisWeek = currentStats.pointsEarnedThisWeek + points;
      const pointsEarnedThisMonth = currentStats.pointsEarnedThisMonth + points;
      
      const updatedStats: UserStats = {
        ...currentStats,
        points: currentStats.points + points,
        pointsEarnedToday,
        pointsEarnedThisWeek,
        pointsEarnedThisMonth,
        lastUpdated: now.toISOString(),
      };
      
      transaction.set(statsRef, updatedStats);
      return updatedStats;
    });
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  }
}

/**
 * Award XP to user and check for level up
 * @param userId User ID
 * @param xp XP to award
 * @param reason Reason for awarding XP
 * @returns Object with updated stats and level up info
 */
export async function awardXP(
  userId: string,
  xp: number,
  reason: string
): Promise<{ stats: UserStats; levelUp: boolean; oldLevel: number; newLevel: number }> {
  try {
    const db = getFirestoreDB();
    return await runTransaction(db, async (transaction) => {
      const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
      const statsSnap = await transaction.get(statsRef);
      
      let currentStats: UserStats;
      if (!statsSnap.exists()) {
        currentStats = {
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          totalProblemsSolved: 0,
          totalCoursesCompleted: 0,
          problemsSolvedToday: 0,
          pointsEarnedToday: 0,
          pointsEarnedThisWeek: 0,
          pointsEarnedThisMonth: 0,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        currentStats = statsSnap.data() as UserStats;
      }
      
      const oldXP = currentStats.xp;
      const newXP = oldXP + xp;
      const levelUpInfo = checkLevelUp(oldXP, newXP);
      
      const updatedStats: UserStats = {
        ...currentStats,
        xp: newXP,
        level: levelUpInfo.newLevel,
        lastUpdated: new Date().toISOString(),
      };
      
      transaction.set(statsRef, updatedStats);
      
      return {
        stats: updatedStats,
        levelUp: levelUpInfo.levelUp,
        oldLevel: levelUpInfo.oldLevel,
        newLevel: levelUpInfo.newLevel,
      };
    });
  } catch (error) {
    console.error("Error awarding XP:", error);
    throw error;
  }
}

/**
 * Update daily streak
 * @param userId User ID
 * @returns Updated stats with new streak
 */
export async function updateStreak(userId: string): Promise<UserStats> {
  try {
    const db = getFirestoreDB();
    return await runTransaction(db, async (transaction) => {
      const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
      const statsSnap = await transaction.get(statsRef);
      
      let currentStats: UserStats;
      if (!statsSnap.exists()) {
        currentStats = {
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          totalProblemsSolved: 0,
          totalCoursesCompleted: 0,
          problemsSolvedToday: 0,
          pointsEarnedToday: 0,
          pointsEarnedThisWeek: 0,
          pointsEarnedThisMonth: 0,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        currentStats = statsSnap.data() as UserStats;
      }
      
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const lastStreakDate = currentStats.lastStreakDate?.split("T")[0];
      
      let newStreak = currentStats.streak;
      
      if (!lastStreakDate || lastStreakDate !== today) {
        // Check if yesterday was the last streak date (consecutive)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        if (lastStreakDate === yesterdayStr) {
          // Consecutive day - increment streak
          newStreak = currentStats.streak + 1;
        } else if (!lastStreakDate) {
          // First time - start streak
          newStreak = 1;
        } else {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      }
      
      const updatedStats: UserStats = {
        ...currentStats,
        streak: newStreak,
        lastStreakDate: today,
        lastUpdated: now.toISOString(),
      };
      
      transaction.set(statsRef, updatedStats);
      return updatedStats;
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

/**
 * Complete daily challenge and award rewards
 * @param userId User ID
 * @param challengeId Challenge ID
 * @param points Points to award
 * @param xp XP to award
 * @returns Completion record
 */
export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  points: number,
  xp: number
): Promise<DailyChallengeCompletion> {
  try {
    const db = getFirestoreDB();
    return await runTransaction(db, async (transaction) => {
      // Update stats
      const statsRef = doc(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.STATS, "current");
      const statsSnap = await transaction.get(statsRef);
      
      let currentStats: UserStats;
      if (!statsSnap.exists()) {
        currentStats = {
          points: 0,
          xp: 0,
          level: 1,
          streak: 0,
          totalProblemsSolved: 0,
          totalCoursesCompleted: 0,
          problemsSolvedToday: 0,
          pointsEarnedToday: 0,
          pointsEarnedThisWeek: 0,
          pointsEarnedThisMonth: 0,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        currentStats = statsSnap.data() as UserStats;
      }
      
      // Award points and XP
      const oldXP = currentStats.xp;
      const newXP = oldXP + xp;
      const levelUpInfo = checkLevelUp(oldXP, newXP);
      
      const updatedStats: UserStats = {
        ...currentStats,
        points: currentStats.points + points,
        xp: newXP,
        level: levelUpInfo.newLevel,
        lastUpdated: new Date().toISOString(),
      };
      
      transaction.set(statsRef, updatedStats);
      
      // Update streak
      const today = new Date().toISOString().split("T")[0];
      const lastStreakDate = currentStats.lastStreakDate?.split("T")[0];
      
      if (!lastStreakDate || lastStreakDate !== today) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        
        if (lastStreakDate === yesterdayStr) {
          updatedStats.streak = currentStats.streak + 1;
        } else if (!lastStreakDate) {
          updatedStats.streak = 1;
        } else {
          updatedStats.streak = 1;
        }
        updatedStats.lastStreakDate = today;
      }
      
      // Record completion
      const completion: DailyChallengeCompletion = {
        challengeId,
        completedAt: new Date().toISOString(),
        pointsEarned: points,
        xpEarned: xp,
      };
      
      const completionRef = doc(
        db,
        COLLECTIONS.USERS,
        userId,
        SUBCOLLECTIONS.DAILY_CHALLENGES,
        challengeId
      );
      transaction.set(completionRef, completion);
      
      return completion;
    });
  } catch (error) {
    console.error("Error completing daily challenge:", error);
    throw error;
  }
}

/**
 * Get user's achievements
 * @param userId User ID
 * @returns Array of user achievements
 */
export async function getUserAchievements(userId: string) {
  try {
    const db = getFirestoreDB();
    const achievementsRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      SUBCOLLECTIONS.ACHIEVEMENTS
    );
    const snapshot = await getDocs(achievementsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user achievements:", error);
    throw error;
  }
}

/**
 * Get leaderboard entries
 * @param limitCount Number of entries to return
 * @param timeframe "global" | "weekly"
 * @returns Array of leaderboard entries
 */
export async function getLeaderboard(
  limitCount: number = 100,
  timeframe: "global" | "weekly" = "global"
): Promise<LeaderboardEntry[]> {
  try {
    const db = getFirestoreDB();
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD, timeframe, "entries");
    const q = query(leaderboardRef, orderBy("score", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc, index) => ({
      ...doc.data(),
      rank: index + 1,
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    // Return empty array if leaderboard doesn't exist yet
    return [];
  }
}

/**
 * Get user's current rank
 * @param userId User ID
 * @param timeframe "global" | "weekly"
 * @returns User's rank or null if not found
 */
export async function getUserRank(
  userId: string,
  timeframe: "global" | "weekly" = "global"
): Promise<number | null> {
  try {
    const db = getFirestoreDB();
    const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD, timeframe, "entries");
    const q = query(leaderboardRef, where("userId", "==", userId), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const userEntry = snapshot.docs[0].data() as LeaderboardEntry;
    return userEntry.rank || null;
  } catch (error) {
    console.error("Error getting user rank:", error);
    return null;
  }
}

/**
 * Update leaderboard (should be called after stats update)
 * Note: In production, this should be done via Cloud Functions for better performance
 * @param userId User ID
 * @param userName User's display name
 * @param score Total score (points)
 */
export async function updateLeaderboard(
  userId: string,
  userName: string,
  score: number
): Promise<void> {
  try {
    const db = getFirestoreDB();
    const batch = writeBatch(db);
    
    // Update global leaderboard
    const globalRef = doc(db, COLLECTIONS.LEADERBOARD, "global", "entries", userId);
    batch.set(globalRef, {
      userId,
      name: userName,
      score,
      updatedAt: serverTimestamp(),
    });
    
    // Update weekly leaderboard
    const weeklyRef = doc(db, COLLECTIONS.LEADERBOARD, "weekly", "entries", userId);
    batch.set(weeklyRef, {
      userId,
      name: userName,
      score,
      updatedAt: serverTimestamp(),
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    // Don't throw - leaderboard update is not critical
  }
}

