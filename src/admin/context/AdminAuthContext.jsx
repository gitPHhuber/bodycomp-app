import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminRole();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await checkAdminRole();
        } else {
          setUser(null);
          setAdminRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  async function checkAdminRole() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.rpc("get_admin_role");
      if (error) throw error;
      setAdminRole(data);
    } catch {
      setAdminRole(null);
    } finally {
      setLoading(false);
    }
  }

  const signInWithEmail = useCallback(async (email) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    if (!error) setOtpSent(true);
    return { error };
  }, []);

  const verifyOtp = useCallback(async (email, token) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setAdminRole(null);
    setOtpSent(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{
      user,
      adminRole,
      loading,
      otpSent,
      setOtpSent,
      signInWithEmail,
      verifyOtp,
      signOut,
      isAdmin: adminRole === "admin" || adminRole === "superadmin",
      isSuperAdmin: adminRole === "superadmin",
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
}
