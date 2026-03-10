// src/pages/Dashboard.tsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Code2,
  BookOpen,
  Trophy,
  Video,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Award,
  Medal,
} from "lucide-react";

import DailyChallenge from "@/components/DailyChallenge";
// <-- FIX: named import (was default import which caused runtime error)
import { CourseRecommendations } from "@/components/CourseRecommendations";

import { getUserLearningPattern } from "@/lib/recommendationEngine";
import { generateRecommendations } from "@/lib/recommendationEngine";
import type { Course as UICourse } from "@/lib/types";
// import engine Course type so we can convert ids to numbers for the engine
import type { Course as EngineCourse } from "@/lib/recommendationEngine";

import { useAuth } from "@/context/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useLeaderboard, useUserRank } from "@/hooks/useLeaderboard";
import { useAllAchievements, useUserAchievements, useCheckAchievements } from "@/hooks/useAchievements";
import { getUserCourses } from "@/lib/services/courseService";
import { updateLeaderboard } from "@/lib/services/gamificationService";

// Gamification Components
import LevelBadge from "@/components/gamification/LevelBadge";
import XPProgressBar from "@/components/gamification/XPProgressBar";
import PointsDisplay from "@/components/gamification/PointsDisplay";
import StreakCounter from "@/components/gamification/StreakCounter";
import AchievementCard from "@/components/gamification/AchievementCard";
import LevelUpModal from "@/components/gamification/LevelUpModal";

/**
 * Gamified Dashboard page
 */

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || null;

  // Data fetching
  const { data: userStats, isLoading: statsLoading } = useUserStats(userId, !!userId);
  const { data: leaderboard } = useLeaderboard(3, "global");
  const { data: userRank } = useUserRank(userId, "global");
  const { data: allAchievements } = useAllAchievements();
  const { data: userAchievements } = useUserAchievements(userId);
  const checkAchievements = useCheckAchievements();

  // State
  const [levelUpModal, setLevelUpModal] = useState<{ open: boolean; oldLevel: number; newLevel: number; }>({ open: false, oldLevel: 1, newLevel: 1 });
  const [userCourses, setUserCourses] = useState<UICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Load user courses
  useEffect(() => {
    if (userId) {
      getUserCourses(userId)
        .then(() => {
          // Example placeholder courses (your service may return real courses)
          setUserCourses([
            {
              id: "1",
              title: "Complete JavaScript Masterclass",
              category: "Web Development",
              level: "Beginner",
              tags: ["JavaScript", "Frontend", "ES6"],
              rating: 4.8,
              students: 15420,
              isEnrolled: true,
              progress: 100,
              slug: "js-masterclass",
            },
            {
              id: "2",
              title: "Python Data Structures & Algorithms",
              category: "Programming",
              level: "Intermediate",
              tags: ["Python", "Algorithms", "Data Structures"],
              rating: 4.9,
              students: 12350,
              isEnrolled: true,
              progress: 40,
              slug: "py-dsa",
            },
          ]);
          setLoadingCourses(false);
        })
        .catch(() => setLoadingCourses(false));
    }
  }, [userId]);

  const [previousLevel, setPreviousLevel] = useState<number>(1);

  useEffect(() => {
    if (userStats && userId) {
      if (userStats.level > previousLevel && previousLevel > 0) {
        setLevelUpModal({
          open: true,
          oldLevel: previousLevel,
          newLevel: userStats.level,
        });
      }
      setPreviousLevel(userStats.level);

      checkAchievements.mutate({ userId });

      if (user?.displayName || user?.email) {
        updateLeaderboard(
          userId,
          user.displayName || user.email?.split("@")[0] || "User",
          userStats.points
        ).catch(console.error);
      }
    }
  }, [userStats, userId, user, previousLevel, checkAchievements]);

  const pointsBreakdown = useMemo(() => {
    if (!userStats) return undefined;

    return {
      today: userStats.pointsEarnedToday,
      thisWeek: userStats.pointsEarnedThisWeek,
      thisMonth: userStats.pointsEarnedThisMonth,
      total: userStats.points,
      byCategory: {
        problems: Math.floor(userStats.points * 0.4),
        courses: Math.floor(userStats.points * 0.3),
        challenges: Math.floor(userStats.points * 0.2),
        achievements: Math.floor(userStats.points * 0.1),
      },
    };
  }, [userStats]);

  const recentAchievements = useMemo(() => {
    if (!allAchievements || !userAchievements) return [];

    const unlockedIds = new Set(userAchievements.map((a) => a.achievementId));
    const unlocked = allAchievements.filter((a) => unlockedIds.has(a.id));

    return unlocked
      .map((a) => {
        const userAch = userAchievements.find((ua) => ua.achievementId === a.id);
        return {
          achievement: a,
          unlockedAt: userAch?.unlockedAt || "",
        };
      })
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 3)
      .map((item) => item.achievement);
  }, [allAchievements, userAchievements]);

  // Mock data for courses (in production, fetch from Firestore)
  const allAvailableCourses: UICourse[] = useMemo(() => [
    ...userCourses,
    {
      id: "3",
      title: "Advanced React Patterns",
      category: "Web Development",
      level: "Advanced",
      tags: ["React", "JavaScript", "Frontend"],
      rating: 4.7,
      students: 8920,
      slug: "react-patterns",
    },
    {
      id: "4",
      title: "Node.js Backend Development",
      category: "Web Development",
      level: "Intermediate",
      tags: ["Node.js", "Backend", "JavaScript"],
      rating: 4.8,
      students: 11230,
      slug: "node-backend",
    },
  ], [userCourses]);

  // compute user learning pattern using UI course types
  const userPattern = useMemo(() => getUserLearningPattern(userCourses as any), [userCourses]);

  // --- IMPORTANT: convert UI Course ids (string) to EngineCourse ids (number)
  const engineCourses: EngineCourse[] = useMemo(() => {
    return allAvailableCourses.map((c) => {
      const numericId = typeof (c.id) === "string" ? Number(c.id) : c.id;
      return {
        // keep other fields as-is; cast to EngineCourse to satisfy engine signature
        ...(c as unknown as Omit<EngineCourse, "id">),
        id: numericId,
      } as EngineCourse;
    });
  }, [allAvailableCourses]);

  const recommendations = useMemo(
    () => generateRecommendations(engineCourses, userPattern, 6),
    [engineCourses, userPattern]
  );

  const liveSessions = useMemo(() => [
    {
      id: "ls1",
      title: "System Design Fundamentals",
      instructor: "Alex Kumar",
      timeISO: new Date().toISOString().slice(0, 10) + "T15:00:00",
      duration: "2 hours",
    },
    {
      id: "ls2",
      title: "React Advanced Patterns",
      instructor: "Emma Watson",
      timeISO: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) + "T10:00:00",
      duration: "1.5 hours",
    },
  ], []);

  const kolkataFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }),
    []
  );

  const formatISOToKolkata = useCallback((iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return kolkataFormatter.format(d);
    } catch {
      return iso;
    }
  }, [kolkataFormatter]);

  const handleContinue = useCallback((c: UICourse) => {
    if (c.slug) navigate(`/courses/${c.slug}`);
    else navigate(`/courses/${c.id}`);
  }, [navigate]);

  const handleEnroll = useCallback((c: UICourse) => {
    console.log("Enroll clicked for", c.id);
  }, []);

  const handleSetReminder = useCallback((sessionId: string) => {
    console.log("Set reminder for session", sessionId);
  }, []);

  const recommendedChallenges = [
    { id: "c1", title: "Two Sum Problem", difficulty: "Easy", acceptance: "45%", tags: ["Array", "Hash Table"] },
    { id: "c2", title: "Binary Tree Traversal", difficulty: "Medium", acceptance: "62%", tags: ["Tree", "DFS"] },
    { id: "c3", title: "Dynamic Programming Classic", difficulty: "Hard", acceptance: "28%", tags: ["DP", "Algorithm"] },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = userStats || {
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Go to homepage">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">TechKnots</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/courses">
              <Button variant="ghost" aria-label="Courses">Courses</Button>
            </Link>
            <Link to="/problems">
              <Button variant="ghost" aria-label="Practice">Practice</Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="ghost" aria-label="Leaderboard">Leaderboard</Button>
            </Link>
            <Link to="/achievements">
              <Button variant="ghost" aria-label="Achievements">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </Button>
            </Link>
            <Button variant="outline" aria-label="Profile">Profile</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.displayName || user?.email?.split("@")[0] || "Student"}!
            </h1>
            <p className="text-muted-foreground">Continue your learning journey where you left off</p>
          </div>
          <LevelBadge level={stats.level} size="lg" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <XPProgressBar currentXP={stats.xp} animated={true} />
          <PointsDisplay totalPoints={stats.points} breakdown={pointsBreakdown} />
          <StreakCounter streak={stats.streak} lastStreakDate={stats.lastStreakDate} />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" aria-label="User stats">
          <StatCard 
            icon={<BookOpen className="h-6 w-6" />} 
            label="Courses Enrolled" 
            value={String(userCourses.length)} 
            color="text-primary"
            subtitle={`${stats.totalCoursesCompleted} completed`}
          />
          <StatCard 
            icon={<CheckCircle2 className="h-6 w-6" />} 
            label="Problems Solved" 
            value={String(stats.totalProblemsSolved)} 
            color="text-success"
            subtitle={`${stats.problemsSolvedToday} today`}
          />
          <StatCard 
            icon={<Trophy className="h-6 w-6" />} 
            label="Global Rank" 
            value={userRank ? `#${userRank}` : "Unranked"} 
            color="text-warning"
            subtitle={leaderboard && leaderboard.length > 0 ? `Top ${Math.ceil((userRank || 0) / 100)}%` : ""}
          />
          <StatCard 
            icon={<Clock className="h-6 w-6" />} 
            label="Learning Hours" 
            value="48h" 
            color="text-info"
            subtitle="This month"
          />
        </section>

        <section className="mb-8">
          <DailyChallenge currentStreak={stats.streak} completed={false} />
        </section>

        {recentAchievements.length > 0 && (
          <section className="mb-8" aria-label="Recent achievements">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Recent Achievements
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recentAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={true}
                />
              ))}
            </div>
          </section>
        )}

        {leaderboard && leaderboard.length > 0 && (
          <section className="mb-8" aria-label="Leaderboard preview">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Top Performers
              </h2>
              <Link to="/leaderboard">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {leaderboard.slice(0, 3).map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-12">
                          {getRankIcon(entry.rank) || <span className="text-muted-foreground">#{entry.rank}</span>}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {entry.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{entry.name}</div>
                          <div className="text-sm text-muted-foreground">Level {entry.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.score.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{entry.problemsSolved} solved</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-8" aria-label="Continue learning">
          <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {userCourses.map((c) => (
              <CourseCard
                key={c.id}
                title={c.title}
                instructor={"Instructor"}
                progress={c.progress ?? 0}
                nextLesson={"Next lesson placeholder"}
                thumbnail={c.tags?.[0] ?? "course"}
                onContinue={() => handleContinue(c)}
                onEnroll={() => handleEnroll(c)}
                xpReward={c.progress === 100 ? 150 : undefined}
              />
            ))}
          </div>
        </section>

        <section className="mb-8" aria-label="Upcoming live sessions">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Live Sessions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {liveSessions.map((s) => (
              <LiveSessionCard
                key={s.id}
                title={s.title}
                instructor={s.instructor}
                time={formatISOToKolkata(s.timeISO)}
                duration={s.duration}
                onSetReminder={() => handleSetReminder(s.id)}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Challenges</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedChallenges.map((ch) => (
              <ChallengeCard 
                key={ch.id} 
                title={ch.title} 
                difficulty={ch.difficulty} 
                acceptance={ch.acceptance} 
                tags={ch.tags} 
              />
            ))}
          </div>
        </section>

        <section className="mb-8" aria-label="Course recommendations">
          <CourseRecommendations 
            recommendations={recommendations} 
            reason="Based on your completed JavaScript course and current Python progress" 
          />
        </section>
      </main>

      <LevelUpModal
        open={levelUpModal.open}
        onClose={() => setLevelUpModal({ ...levelUpModal, open: false })}
        oldLevel={levelUpModal.oldLevel}
        newLevel={levelUpModal.newLevel}
      />
    </div>
  );
};

/* ---------------- Subcomponents ---------------- */

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}> = ({ icon, label, value, color, subtitle }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={color} aria-hidden>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const CourseCard: React.FC<{
  title: string;
  instructor: string;
  progress: number;
  nextLesson: string;
  thumbnail: string;
  onContinue?: () => void;
  onEnroll?: () => void;
  xpReward?: number;
}> = ({ title, instructor, progress, nextLesson, onContinue, onEnroll, xpReward }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription>by {instructor}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
      {xpReward && progress === 100 && (
        <div className="mb-4 p-2 bg-primary/10 rounded-lg flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">+{xpReward} XP earned!</span>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">Next: {nextLesson}</p>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onContinue} aria-label={`Continue ${title}`}>
          Continue
        </Button>
        <Button variant="outline" onClick={onEnroll} aria-label={`Enroll ${title}`}>
          Enroll
        </Button>
      </div>
    </CardContent>
  </Card>
);

const LiveSessionCard: React.FC<{
  title: string;
  instructor: string;
  time: string;
  duration: string;
  onSetReminder?: () => void;
}> = ({ title, instructor, time, duration, onSetReminder }) => (
  <Card className="hover:shadow-lg transition-shadow" role="article" aria-label={`${title} live session`}>
    <CardHeader>
      <div className="flex items-start justify-between mb-2">
        <Video className="h-6 w-6 text-primary" />
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Live</span>
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>with {instructor}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-1">{time}</p>
      <p className="text-sm text-muted-foreground mb-4">Duration: {duration}</p>
      <Button variant="outline" className="w-full" onClick={onSetReminder} aria-label={`Set reminder for ${title}`}>
        Set Reminder
      </Button>
    </CardContent>
  </Card>
);

const ChallengeCard: React.FC<{
  title: string;
  difficulty: string;
  acceptance: string;
  tags: string[];
}> = ({ title, difficulty, acceptance, tags }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "text-success bg-success/10";
      case "Medium":
        return "text-warning bg-warning/10";
      case "Hard":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted bg-muted";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Acceptance: {acceptance}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Button className="w-full" onClick={() => console.log("Solve", title)} aria-label={`Solve ${title}`}>
          Solve Challenge
        </Button>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
