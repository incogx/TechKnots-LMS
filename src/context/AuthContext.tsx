// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getRoleForEmail, setRoleForEmail, type Role as LocalRole } from "@/lib/roleStorage";

export type Role = "student" | "admin" | "mentor" | "instructor" | string;

export type AppUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  role?: Role | null;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  error: Error | null;
  role: Role | null;
  signInWithEmail: (email: string, password: string) => Promise<SupabaseUser>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = getSupabaseClient();

  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getPendingOAuthRole = (): Role | null => {
    try {
      const value = localStorage.getItem("tk_pending_role");
      if (!value) return null;
      if (value === "student" || value === "mentor" || value === "admin") {
        return value;
      }
      return null;
    } catch {
      return null;
    }
  };

  const clearPendingOAuthRole = () => {
    try {
      localStorage.removeItem("tk_pending_role");
    } catch {
      // ignore storage errors
    }
  };

  // Build AppUser from Supabase user and users table role.
  const buildAppUser = async (su: SupabaseUser | null): Promise<AppUser | null> => {
    if (!su) return null;

    const base: AppUser = {
      uid: su.id,
      email: su.email ?? null,
      displayName: (su.user_metadata?.display_name as string | undefined) ?? null,
      role: null,
    };

    const { data: row, error: rowError } = await supabase
      .from("users")
      .select("role, display_name, email")
      .eq("id", su.id)
      .maybeSingle();

    if (rowError) {
      console.warn("Failed reading users row:", rowError.message);
    }

    if (row?.role) {
      const resolvedRole = row.role as Role;
      if (base.email) setRoleForEmail(base.email, resolvedRole as LocalRole);
      clearPendingOAuthRole();

      return {
        ...base,
        displayName: row.display_name ?? base.displayName,
        role: resolvedRole,
      };
    }

    // If no profile row exists yet, bootstrap one using pending role or local cache.
    const pendingRole = getPendingOAuthRole();
    const fallbackRole = pendingRole ?? getRoleForEmail(base.email) ?? "student";

    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: su.id,
        email: base.email,
        display_name: base.displayName,
        role: fallbackRole,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.warn("Failed upserting users row:", upsertError.message);
    }

    if (base.email) setRoleForEmail(base.email, fallbackRole as LocalRole);
    clearPendingOAuthRole();
    return { ...base, role: fallbackRole };
  };

  // Listen to auth state
  useEffect(() => {
    setLoading(true);
    const bootstrap = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(new Error(sessionError.message));
      }

      if (!session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const appUser = await buildAppUser(session.user);
        setUser(appUser);
        setRole(appUser?.role ?? null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const appUser = await buildAppUser(session.user);
        setUser(appUser);
        setRole(appUser?.role ?? null);

        // optional: cache a small summary in localStorage for quick checks
        try {
          if (appUser?.email) {
            localStorage.setItem("tk_user", JSON.stringify({ email: appUser.email, role: appUser.role }));
          }
        } catch {
          // ignore storage errors
        }
      } catch (err: any) {
        console.error("Error building app user:", err);
        setError(err);
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName: (session.user.user_metadata?.display_name as string | undefined) ?? null,
          role: "student",
        });
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Sign in helper (exposed)
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(signInError.message);

      if (!data.user) {
        throw new Error("Sign in failed: no user returned from Supabase.");
      }

      // build user immediately
      const appUser = await buildAppUser(data.user);
      setUser(appUser);
      setRole(appUser?.role ?? null);
      setLoading(false);
      return data.user;
    } catch (err: any) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw new Error(signOutError.message);
      setUser(null);
      setRole(null);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => {
    return {
      user,
      loading,
      error,
      role,
      signInWithEmail,
      signOutUser,
    } as AuthContextValue;
  }, [user, loading, error, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
