import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreDB, COLLECTIONS, SUBCOLLECTIONS } from "../firestore";
import type { Achievement, UserAchievement, UserStats } from "../types";
import { awardPoints } from "./gamificationService";

/**
 * Get all available achievements
 * @returns Array of all achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const db = getFirestoreDB();
    const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
    const snapshot = await getDocs(achievementsRef);
    
    if (snapshot.empty) {
      // Return default achievements if none exist
      return getDefaultAchievements();
    }
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Achievement[];
  } catch (error) {
    console.error("Error getting achievements:", error);
    // Return default achievements on error
    return getDefaultAchievements();
  }
}

/**
 * Get default achievements (fallback)
 * @returns Array of default achievements
 */
function getDefaultAchievements(): Achievement[] {
  return [
    // Challenge Achievements
    {
      id: "challenge-1",
      name: "First Challenge",
      description: "Complete your first daily challenge",
      category: "challenges",
      points: 50,
      requirement: 1,
      tier: "bronze",
    },
    {
      id: "challenge-7",
      name: "Week Warrior",
      description: "Complete 7 daily challenges",
      category: "challenges",
      points: 200,
      requirement: 7,
      tier: "silver",
    },
    {
      id: "challenge-30",
      name: "Challenge Master",
      description: "Complete 30 daily challenges",
      category: "challenges",
      points: 500,
      requirement: 30,
      tier: "gold",
    },
    // Problem Achievements
    {
      id: "problem-10",
      name: "Problem Solver",
      description: "Solve 10 problems",
      category: "problems",
      points: 100,
      requirement: 10,
      tier: "bronze",
    },
    {
      id: "problem-50",
      name: "Code Warrior",
      description: "Solve 50 problems",
      category: "problems",
      points: 300,
      requirement: 50,
      tier: "silver",
    },
    {
      id: "problem-100",
      name: "Problem Master",
      description: "Solve 100 problems",
      category: "problems",
      points: 750,
      requirement: 100,
      tier: "gold",
    },
    // Streak Achievements
    {
      id: "streak-7",
      name: "Week Streak",
      description: "Maintain a 7-day streak",
      category: "streaks",
      points: 150,
      requirement: 7,
      tier: "bronze",
    },
    {
      id: "streak-30",
      name: "Month Streak",
      description: "Maintain a 30-day streak",
      category: "streaks",
      points: 500,
      requirement: 30,
      tier: "gold",
    },
    // Course Achievements
    {
      id: "course-1",
      name: "First Course",
      description: "Complete your first course",
      category: "courses",
      points: 200,
      requirement: 1,
      tier: "bronze",
    },
    {
      id: "course-5",
      name: "Course Collector",
      description: "Complete 5 courses",
      category: "courses",
      points: 600,
      requirement: 5,
      tier: "silver",
    },
    // Points Achievements
    {
      id: "points-500",
      name: "Point Collector",
      description: "Earn 500 total points",
      category: "points",
      points: 100,
      requirement: 500,
      tier: "bronze",
    },
    {
      id: "points-2000",
      name: "Point Hoarder",
      description: "Earn 2,000 total points",
      category: "points",
      points: 250,
      requirement: 2000,
      tier: "silver",
    },
    {
      id: "points-10000",
      name: "Point Millionaire",
      description: "Earn 10,000 total points",
      category: "points",
      points: 1000,
      requirement: 10000,
      tier: "gold",
    },
  ];
}

/**
 * Get user's achievements
 * @param userId User ID
 * @returns Array of user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
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
      achievementId: doc.id,
      ...doc.data(),
    })) as UserAchievement[];
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return [];
  }
}

/**
 * Check if user has unlocked an achievement
 * @param userId User ID
 * @param achievementId Achievement ID
 * @returns True if unlocked
 */
export async function isAchievementUnlocked(
  userId: string,
  achievementId: string
): Promise<boolean> {
  try {
    const db = getFirestoreDB();
    const achievementRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      SUBCOLLECTIONS.ACHIEVEMENTS,
      achievementId
    );
    const achievementSnap = await getDoc(achievementRef);
    return achievementSnap.exists();
  } catch (error) {
    console.error("Error checking achievement unlock:", error);
    return false;
  }
}

/**
 * Calculate progress toward an achievement
 * @param userId User ID
 * @param achievementId Achievement ID
 * @param userStats User stats
 * @returns Progress value (0 to requirement)
 */
export async function calculateAchievementProgress(
  userId: string,
  achievementId: string,
  userStats: UserStats
): Promise<number> {
  try {
    const allAchievements = await getAllAchievements();
    const achievement = allAchievements.find((a) => a.id === achievementId);
    
    if (!achievement) return 0;
    
    switch (achievement.category) {
      case "challenges":
        // Count completed challenges (simplified - in production, count from dailyChallenges collection)
        return 0; // Placeholder
      case "problems":
        return userStats.totalProblemsSolved;
      case "streaks":
        return userStats.streak;
      case "courses":
        return userStats.totalCoursesCompleted;
      case "points":
        return userStats.points;
      default:
        return 0;
    }
  } catch (error) {
    console.error("Error calculating achievement progress:", error);
    return 0;
  }
}

/**
 * Unlock an achievement for a user
 * @param userId User ID
 * @param achievementId Achievement ID
 * @returns Unlocked achievement
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<UserAchievement> {
  try {
    // Check if already unlocked
    const alreadyUnlocked = await isAchievementUnlocked(userId, achievementId);
    if (alreadyUnlocked) {
      const achievementRef = doc(
        db,
        COLLECTIONS.USERS,
        userId,
        SUBCOLLECTIONS.ACHIEVEMENTS,
        achievementId
      );
      const achievementSnap = await getDoc(achievementRef);
      return achievementSnap.data() as UserAchievement;
    }
    
    // Get achievement details
    const allAchievements = await getAllAchievements();
    const achievement = allAchievements.find((a) => a.id === achievementId);
    
    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }
    
    // Create user achievement record
    const userAchievement: UserAchievement = {
      achievementId,
      unlockedAt: new Date().toISOString(),
    };
    
    // Save to Firestore
    const db = getFirestoreDB();
    const achievementRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      SUBCOLLECTIONS.ACHIEVEMENTS,
      achievementId
    );
    await setDoc(achievementRef, userAchievement);
    
    // Award points for unlocking achievement
    await awardPoints(userId, achievement.points, `Unlocked achievement: ${achievement.name}`);
    
    return userAchievement;
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    throw error;
  }
}

/**
 * Check and unlock achievements based on user stats
 * @param userId User ID
 * @param userStats User stats
 * @returns Array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  userId: string,
  userStats: UserStats
): Promise<Achievement[]> {
  try {
    const allAchievements = await getAllAchievements();
    const userAchievements = await getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));
    
    const newlyUnlocked: Achievement[] = [];
    
    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;
      
      let progress = 0;
      
      switch (achievement.category) {
        case "challenges":
          // In production, count from dailyChallenges collection
          progress = 0;
          break;
        case "problems":
          progress = userStats.totalProblemsSolved;
          break;
        case "streaks":
          progress = userStats.streak;
          break;
        case "courses":
          progress = userStats.totalCoursesCompleted;
          break;
        case "points":
          progress = userStats.points;
          break;
        default:
          continue;
      }
      
      if (progress >= achievement.requirement) {
        await unlockAchievement(userId, achievement.id);
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

