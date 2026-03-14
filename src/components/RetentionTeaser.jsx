import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as tracker from "../lib/tracker";

export default function RetentionTeaser({ page = "unknown" }) {
  const ref = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          tracker.trackEvent("retention_teaser_view", { page });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page]);

  return (
    <div
      ref={ref}
      style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
        borderRadius: 20,
        padding: 24,
        border: "1px solid #334155",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#22d3ee",
          fontFamily: "'JetBrains Mono',monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        ДИНАМИКА
      </div>

      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#e2e8f0",
          margin: "0 0 14px",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        Отслеживайте динамику результатов
      </h3>

      {/* Mini chart placeholder */}
      <div
        style={{
          background: "#020617",
          borderRadius: 12,
          padding: "16px 12px 8px",
          marginBottom: 14,
        }}
      >
        <svg
          viewBox="0 0 200 80"
          width="100%"
          height="80"
          style={{ display: "block" }}
        >
          {/* Grid lines */}
          {[20, 40, 60].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="200"
              y2={y}
              stroke="#1e293b"
              strokeWidth="1"
            />
          ))}
          {/* Fat line — going down */}
          <polyline
            points="10,25 50,30 90,38 130,48 170,58 190,62"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Muscle line — going up */}
          <polyline
            points="10,60 50,55 90,48 130,40 170,32 190,28"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Labels */}
          <text x="192" y="66" fill="#22d3ee" fontSize="8" fontFamily="'JetBrains Mono',monospace">
            жир
          </text>
          <text x="192" y="25" fill="#10b981" fontSize="8" fontFamily="'JetBrains Mono',monospace">
            мышцы
          </text>
        </svg>
      </div>

      <p
        style={{
          fontSize: 14,
          color: "#94a3b8",
          lineHeight: 1.6,
          margin: "0 0 16px",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        Загружайте результаты DXA в кабинет и следите за прогрессом
      </p>

      <Link
        to="/profile"
        className="btn-ghost-cyan"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          border: "1px solid #334155",
          borderRadius: 12,
          background: "transparent",
          color: "#94a3b8",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          cursor: "pointer",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        Узнать больше →
      </Link>
    </div>
  );
}
