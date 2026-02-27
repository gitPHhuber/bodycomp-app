import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getSessionId, setTrackerUserId } from "../lib/tracker";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const authCallbackRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          const prof = await fetchProfile(s.user.id);
          if (prof) setTrackerUserId(prof.id);

          if (event === "SIGNED_IN") {
            await bindSession();
            // Execute stored callback after auth
            if (authCallbackRef.current) {
              const cb = authCallbackRef.current;
              authCallbackRef.current = null;
              setTimeout(cb, 100);
            }
            setShowAuthModal(false);
          }
        } else {
          setProfile(null);
          setTrackerUserId(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(authUid) {
    if (!supabase) return null;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUid)
      .single();
    if (data) {
      setProfile(data);
      setTrackerUserId(data.id);
    }
    return data;
  }

  async function bindSession() {
    if (!supabase) return;
    const sessionId = getSessionId();
    if (!sessionId) return;
    try {
      await supabase.rpc("bind_session_to_user", { p_session_id: sessionId });
    } catch {
      // Silent — binding is best-effort
    }
  }

  const signInWithEmail = useCallback(async (email) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/profile" },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setTrackerUserId(null);
  }, []);

  const requireAuth = useCallback((callback) => {
    if (user) {
      callback();
    } else {
      authCallbackRef.current = callback;
      setShowAuthModal(true);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      showAuthModal, setShowAuthModal,
      signInWithEmail, signOut,
      requireAuth, fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
