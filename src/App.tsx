// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import { CourseNotes } from "./components/CourseNotes";
import Certificate from "./pages/Certificate";
import CodeEditor from "./pages/CodeEditor";
import Problems from "./pages/Problems";
import Leaderboard from "./pages/Leaderboard";
import RewardsShop from "./pages/RewardsShop";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

function CourseNotesRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/courses" replace />;
  return <CourseNotes courseId={id} />;
}

/**
 * RequireAuth - wrapper that ensures the user is signed in.
 * If not, redirect to /login and remember the attempted location.
 */
function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a loading spinner

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}

/**
 * RequireRole - wrapper that ensures the user has one of the allowed roles.
 * `allowed` can be a single role or array of roles.
 */
function RequireRole({ allowed, children }: { allowed: string | string[]; children?: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // if not logged in, redirect to login (RequireAuth should normally wrap this)
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  // If we have explicit role from AuthContext, check it; fallback: try to infer "student"
  const currentRole = role ?? (user ? "student" : null);

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    // If user has some other role, redirect them to their dashboard, otherwise to /dashboard
    if (currentRole) {
      return <Navigate to={`/${currentRole}-dashboard`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Generic dashboard route - Dashboard page can redirect to role-specific */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

              {/* Role-specific dashboards (protected) */}
              <Route
                path="/student-dashboard"
                element={
                  <RequireAuth>
                    <RequireRole allowed="student">
                      <StudentDashboard />
                    </RequireRole>
                  </RequireAuth>
                }
              />
              <Route
                path="/mentor-dashboard"
                element={
                  <RequireAuth>
                    <RequireRole allowed="mentor">
                      <MentorDashboard />
                    </RequireRole>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <RequireAuth>
                    <RequireRole allowed="admin">
                      <AdminDashboard />
                    </RequireRole>
                  </RequireAuth>
                }
              />

              {/* Courses (public browse), Course detail requires auth to view lessons/enroll */}
              <Route path="/courses" element={<Courses />} />
              <Route
                path="/courses/:id"
                element={
                  <RequireAuth>
                    <CourseDetail />
                  </RequireAuth>
                }
              />

              {/* Course subpages */}
              <Route
                path="/courses/:id/notes"
                element={
                  <RequireAuth>
                    <CourseNotesRoute />
                  </RequireAuth>
                }
              />
              <Route
                path="/courses/:id/certificate"
                element={
                  <RequireAuth>
                    <Certificate />
                  </RequireAuth>
                }
              />

              {/* Problems / Code editor */}
              <Route path="/problems" element={<RequireAuth><Problems /></RequireAuth>} />
              <Route path="/code-editor/:id?" element={<RequireAuth><CodeEditor /></RequireAuth>} />

              {/* Other protected pages */}
              <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
              <Route path="/rewards" element={<RequireAuth><RewardsShop /></RequireAuth>} />
              <Route path="/achievements" element={<RequireAuth><Achievements /></RequireAuth>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
