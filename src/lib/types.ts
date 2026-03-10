// src/lib/types.ts
export interface Course {
  id: string;
  title: string;
  category?: string;
  level?: string;
  tags?: string[];
  rating?: number;
  students?: number;
  isEnrolled?: boolean;
  progress?: number;
  slug?: string;
  thumbnailUrl?: string; // optional field
  instructorId?: string; // optional
}

// Gamification Types
export interface UserStats {
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastStreakDate?: string; // ISO date string
  totalProblemsSolved: number;
  totalCoursesCompleted: number;
  problemsSolvedToday: number;
  pointsEarnedToday: number;
  pointsEarnedThisWeek: number;
  pointsEarnedThisMonth: number;
  lastUpdated: string; // ISO date string
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "challenges" | "problems" | "streaks" | "milestones" | "points" | "courses";
  points: number;
  requirement: number;
  icon?: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date string
  progress?: number; // Current progress toward requirement
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
  problemsSolved: number;
  level: number;
  avatar?: string;
}

export interface DailyChallengeCompletion {
  challengeId: string;
  completedAt: string; // ISO date string
  pointsEarned: number;
  xpEarned: number;
}

export interface CourseProgress {
  courseId: string;
  progress: number; // 0-100
  completedLessons: string[]; // Array of lesson IDs
  lastAccessed: string; // ISO date string
  completedAt?: string; // ISO date string if course is completed
  xpEarned?: number;
  pointsEarned?: number;
}

export interface PointsBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  byCategory: {
    problems: number;
    courses: number;
    challenges: number;
    achievements: number;
  };
}
 