import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useAdminStatus() {
  const { user } = useAuth();
  const [adminRole, setAdminRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setAdminRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function checkRole() {
      try {
        const { data, error } = await supabase.rpc("get_admin_role");
        if (cancelled) return;
        if (error) throw error;
        setAdminRole(data);
      } catch {
        if (!cancelled) setAdminRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkRole();

    return () => { cancelled = true; };
  }, [user]);

  return {
    adminRole,
    isAdmin: adminRole === "admin" || adminRole === "superadmin",
    isSuperAdmin: adminRole === "superadmin",
    loading,
  };
}
