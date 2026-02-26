import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/analyzer", label: "Анализ" },
  { to: "/xray", label: "Сканер" },
  { to: "/clinics", label: "Клиники" },
];

export default function Header() {
  const { pathname } = useLocation();
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
            maxWidth: 480,
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
            <nav style={{ display: "flex", gap: 24 }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
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
            </nav>
          )}

          {/* Burger button */}
          {isMobile && (
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
          </div>
        </div>
      )}
    </>
  );
}
