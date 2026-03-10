// src/pages/StudentDashboard.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Code2, BookOpen, Trophy, CheckCircle2, Award } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getUserCourses, getAllCourses } from "@/lib/services/courseService";
import type { Course } from "@/lib/types";
import type { CourseProgress } from "@/lib/types";
import { getUserLearningPattern, generateRecommendations } from "@/lib/recommendationEngine";

import CourseNotes from "@/components/CourseNotes";
import { CourseRecommendations } from "@/components/CourseRecommendations";
import LevelBadge from "@/components/gamification/LevelBadge";
import XPProgressBar from "@/components/gamification/XPProgressBar";
import PointsDisplay from "@/components/gamification/PointsDisplay";

type EnrolledRecord = {
  course: Course;
  progress: CourseProgress;
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  // state
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both datasets and merge them
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courses, progresses] = await Promise.all([
        getAllCourses(), // returns Course[]
        userId ? getUserCourses(userId) : Promise.resolve([] as CourseProgress[]), // returns CourseProgress[]
      ]);

      setAllCourses(Array.isArray(courses) ? courses : []);
      setUserProgress(Array.isArray(progresses) ? progresses : []);
    } catch (err: any) {
      console.error("StudentDashboard fetchData error:", err);
      setError(err?.message ?? "Failed to load dashboard data");
      setAllCourses([]);
      setUserProgress([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // initial load
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // allow other components (EnrollButton, lesson-complete flow) to trigger a refresh:
  // dispatch: window.dispatchEvent(new CustomEvent('tk:refresh-dashboard'))
  useEffect(() => {
    const handler = () => {
      void fetchData();
    };
    window.addEventListener("tk:refresh-dashboard", handler);
    // also expose function for dev convenience (optional)
    // @ts-ignore
    window.refreshStudentDashboard = handler;

    return () => {
      window.removeEventListener("tk:refresh-dashboard", handler);
      // @ts-ignore
      delete window.refreshStudentDashboard;
    };
  }, [fetchData]);

  // Role based redirect — if user has role that isn't student, send to main dashboard
  useEffect(() => {
    if (!user) return;
    // your AuthContext stores role in user object? earlier code used separate role.
    // If you keep role separately, adapt this check accordingly.
    // If you use a role in AuthContext, use that instead.
    // e.g. const { role } = useAuth(); if (role && role !== "student") navigate(`/${role}-dashboard`);
  }, [user, navigate]);

  // Merge userProgress -> course metadata
  const enrolledRecords: EnrolledRecord[] = useMemo(() => {
    if (!userProgress || !Array.isArray(userProgress) || !allCourses) return [];

    const courseMap = new Map<string, Course>();
    for (const c of allCourses) {
      courseMap.set(String(c.id), c);
    }

    // each progress item may have courseId (string/number)
    return userProgress.map((p) => {
      const cid = String(p.courseId);
      const course = courseMap.get(cid) ?? {
        id: cid,
        title: "Unknown course",
        slug: undefined,
        category: undefined,
        level: undefined,
        tags: [],
        rating: undefined,
        students: undefined,
        instructor: undefined,
      } as Course;

      return { course, progress: p };
    });
  }, [allCourses, userProgress]);

  // derived stats
  const stats = useMemo(() => {
    const totalPoints = enrolledRecords.reduce((acc, r) => acc + Math.round((r.progress.progress ?? 0) * 10), 0);
    const xp = Math.round(totalPoints * 0.7);
    const level = Math.max(1, Math.floor(xp / 500) + 1);
    const streak = 0; // put real streak logic from your backend if available
    const totalCoursesCompleted = enrolledRecords.filter((r) => (r.progress.progress ?? 0) >= 100).length;
    return { points: totalPoints, xp, level, streak, totalCoursesCompleted };
  }, [enrolledRecords]);

  // recommendations (simple engine)
  const pattern = useMemo(() => getUserLearningPattern(enrolledRecords.map((r) => r.course)), [enrolledRecords]);
  const recommendations = useMemo(() => generateRecommendations(allCourses, pattern, 6), [allCourses, pattern]);

  const handleContinue = (c: Course) => {
    if (c.slug) navigate(`/courses/${c.slug}`);
    else navigate(`/courses/${c.id}`);
  };

  const handleOpenNotes = (c: Course) => {
    navigate(`/courses/${c.slug ?? c.id}/notes`);
  };

  // UI
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">My Learning Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview of your progress, courses and recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LevelBadge level={stats.level} size="sm" />
            <div className="text-sm text-muted-foreground">{user?.displayName ?? user?.email ?? "Student"}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Top stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                  <h2 className="text-3xl font-bold">{enrolledRecords.length}</h2>
                  <p className="text-xs text-muted-foreground mt-2">{stats.totalCoursesCompleted} completed</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <h2 className="text-3xl font-bold">{stats.points.toLocaleString()}</h2>
                  <p className="text-xs text-muted-foreground mt-2">Based on recent activity</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Streak</p>
                  <h2 className="text-3xl font-bold">{stats.streak} days</h2>
                  <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Progress + Recommendations */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Courses In Progress</CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loading && (
                    <div className="py-6 text-center text-sm text-muted-foreground">Loading your courses…</div>
                  )}

                  {!loading && enrolledRecords.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-lg font-medium">You haven't enrolled in any courses yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Browse courses and enroll to start learning.</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
                      </div>
                    </div>
                  )}

                  {!loading && enrolledRecords.map(({ course, progress }) => (
                    <div key={String(course.id)} className="py-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{course.title}</h3>
                            {course.level && <Badge className="px-2 py-0.5">{course.level}</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{course.instructor ?? ""}</div>
                        </div>
                        <div className="text-sm text-right">
                          <div className="text-sm font-medium">{Math.round(progress.progress ?? 0)}%</div>
                          <div className="text-xs text-muted-foreground">Progress</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress value={Math.round(progress.progress ?? 0)} />
                        <div className="mt-3 flex gap-2">
                          <Button onClick={() => handleContinue(course)} className="flex-1">Continue Learning</Button>
                          <Button variant="outline" onClick={() => handleOpenNotes(course)}>Notes</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Sessions</CardTitle>
                <CardDescription>Join upcoming sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">System Design Fundamentals</div>
                      <div className="text-sm text-muted-foreground">with Alex Kumar • Tomorrow 3:00 PM</div>
                    </div>
                    <Button variant="outline">Set Reminder</Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">React Advanced Patterns</div>
                      <div className="text-sm text-muted-foreground">with Emma Watson • In 2 days</div>
                    </div>
                    <Button variant="outline">Set Reminder</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile & XP</CardTitle>
                <CardDescription>Quick glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">XP</div>
                      <div className="text-xl font-bold">{stats.xp}</div>
                    </div>
                    <div>
                      <LevelBadge level={stats.level} />
                    </div>
                  </div>

                  <XPProgressBar currentXP={stats.xp} animated />
                  <PointsDisplay totalPoints={stats.points} breakdown={undefined} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Badges & milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">First Steps</div>
                      <div className="text-sm text-muted-foreground">Completed your first course</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Speed Demon</div>
                      <div className="text-sm text-muted-foreground">Solved 5 challenges in a day</div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended for you</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseRecommendations recommendations={recommendations} reason="Based on courses you are taking" />
              </CardContent>
            </Card>
          </aside>
        </section>

        {/* Browse more courses */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Explore more courses</h2>
            <Link to="/courses">
              <Button variant="outline">Browse all</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {allCourses.slice(0, 6).map((c) => (
              <Card key={c.id}>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-muted-foreground">{c.instructor ?? ""}</div>
                      <div className="flex gap-2 mt-3">
                        {c.tags?.slice(0, 2).map((t) => <Badge key={t}>{t}</Badge>)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{c.rating ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">rating</div>
                      <div className="mt-3">
                        <Button onClick={() => handleContinue(c)}>View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
