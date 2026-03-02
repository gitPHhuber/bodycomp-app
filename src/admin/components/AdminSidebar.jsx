import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors, fonts } from "../styles";

const NAV_ITEMS = [
  { to: "/admin", label: "Дашборд", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", exact: true },
  { to: "/admin/users", label: "Пользователи", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
  { to: "/admin/analytics", label: "Аналитика", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { to: "/admin/clinics", label: "Клиники", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { to: "/admin/content", label: "Контент", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { to: "/admin/telegram", label: "Каналы (TG)", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  { to: "/admin/settings", label: "Настройки", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAdminAuth();

  const isActive = (item) => {
    if (item.exact) return pathname === item.to;
    return pathname.startsWith(item.to);
  };

  return (
    <aside style={{
      width: 260,
      minHeight: "100vh",
      background: colors.sidebar,
      borderRight: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Link to="/admin" style={{
          fontFamily: fonts.mono,
          fontWeight: 800,
          fontSize: 18,
          color: colors.accent,
          textDecoration: "none",
          letterSpacing: "0.04em",
        }}>
          BODYCOMP
        </Link>
        <div style={{
          fontSize: 10,
          color: colors.textDim,
          fontFamily: fonts.mono,
          letterSpacing: "0.12em",
          marginTop: 4,
        }}>
          ADMIN PANEL
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: active ? colors.accent : colors.textMuted,
                background: active ? `${colors.accent}10` : "transparent",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                fontFamily: fonts.body,
                transition: "all 0.15s",
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div style={{
        padding: "16px 16px",
        borderTop: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: colors.bg, fontSize: 13, fontWeight: 700,
          fontFamily: fonts.mono, flexShrink: 0,
        }}>
          {(user?.email?.[0] || "A").toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, color: colors.text, fontWeight: 600,
            fontFamily: fonts.body,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user?.email || "Admin"}
          </div>
        </div>
        <button
          onClick={signOut}
          title="Выйти"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: colors.textDim, padding: 4, display: "flex",
            transition: "color 0.2s",
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
