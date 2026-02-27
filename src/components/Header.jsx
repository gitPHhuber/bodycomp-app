import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as tracker from "../lib/tracker";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/analyzer", label: "Анализ" },
  { to: "/xray", label: "Сканер" },
  { to: "/clinics", label: "Клиники" },
];

export default function Header() {
  const { pathname } = useLocation();
  const { user, profile, setShowAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const mq = window.matchMedia("(max-width: 639px)");

    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const linkColor = (to) => (pathname === to ? "#22d3ee" : "#94a3b8");

  const avatarLetter = (profile?.name?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 50,
          background: "rgba(2,6,23,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            height: "100%",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 18,
              color: "#22d3ee",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            BODYCOMP
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => tracker.trackClick("nav", { to: link.to })}
                  style={{
                    color: linkColor(link.to),
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Profile / Login */}
              {user ? (
                <Link
                  to="/profile"
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: pathname === "/profile"
                      ? "linear-gradient(135deg, #0891b2, #22d3ee)"
                      : "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: pathname === "/profile" ? "#020617" : "#94a3b8",
                    fontSize: 14, fontWeight: 700, textDecoration: "none",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: pathname === "/profile" ? "none" : "1px solid #334155",
                    transition: "all 0.2s",
                  }}
                >
                  {avatarLetter}
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: "none", border: "1px solid #334155",
                    borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
                    color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </nav>
          )}

          {/* Burger button (mobile) */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Profile avatar on mobile */}
              {user ? (
                <Link
                  to="/profile"
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: pathname === "/profile"
                      ? "linear-gradient(135deg, #0891b2, #22d3ee)"
                      : "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: pathname === "/profile" ? "#020617" : "#94a3b8",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: pathname === "/profile" ? "none" : "1px solid #334155",
                  }}
                >
                  {avatarLetter}
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: "none", border: "1px solid #334155",
                    borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
                    color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e2e8f0",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 4,
                  lineHeight: 1,
                }}
                aria-label="Меню"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay + panel */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            pointerEvents: menuOpen ? "auto" : "none",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              opacity: menuOpen ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />

          {/* Slide-up panel */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#0f172a",
              borderTop: "1px solid rgba(148,163,184,0.12)",
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 32px",
              transform: menuOpen ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => tracker.trackClick("nav_mobile", { to: link.to })}
                style={{
                  color: linkColor(link.to),
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background:
                    pathname === link.to
                      ? "rgba(34,211,238,0.08)"
                      : "transparent",
                  transition: "background 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Profile / Login in mobile menu */}
            {user ? (
              <Link
                to="/profile"
                onClick={() => tracker.trackClick("nav_mobile", { to: "/profile" })}
                style={{
                  color: linkColor("/profile"),
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: pathname === "/profile" ? "rgba(34,211,238,0.08)" : "transparent",
                  transition: "background 0.2s",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#020617", fontSize: 13, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {avatarLetter}
                </div>
                Профиль
              </Link>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); setShowAuthModal(true); }}
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "background 0.2s",
                }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Войти
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
