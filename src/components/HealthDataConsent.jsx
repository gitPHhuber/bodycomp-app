import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function HealthDataConsent({ open, onClose, onConsent }) {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, fetchProfile } = useAuth();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAgreed(false);
      setSaving(false);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    if (!agreed || !user || !supabase || saving) return;
    setSaving(true);
    try {
      await supabase
        .from("users")
        .update({
          consent_health_data: true,
          consent_health_data_at: new Date().toISOString(),
        })
        .eq("auth_id", user.id);
      await fetchProfile(user.id);
      onConsent?.();
    } catch {
      setSaving(false);
    }
  }

  const btnPrimary = {
    width: "100%",
    padding: 16,
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    color: "#020617",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: "0 0 30px #22d3ee22",
    transition: "all 0.3s",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={() => onClose?.()}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "#000a", backdropFilter: "blur(8px)" }} />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflow: "auto",
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#334155", margin: "0 auto 20px" }} />

        {/* Close button */}
        <button
          onClick={() => onClose?.()}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#1e293b", border: "none", color: "#94a3b8",
            width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16,
          }}
        >
          ✕
        </button>

        <div style={{ animation: "fadeSlide 0.4s ease" }}>
          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
              background: "linear-gradient(135deg, #0891b222, #22d3ee22)",
              border: "1px solid #22d3ee33",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 style={{
              fontSize: 20, fontWeight: 800, margin: "0 0 8px",
              background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Согласие на обработку данных о здоровье
            </h2>
          </div>

          <p style={{
            fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Для хранения результатов обследований (DXA-сканирование, состав тела)
            мы обрабатываем данные о здоровье, которые относятся к специальной
            категории персональных данных (ст. 10 ФЗ-152).
          </p>

          {/* Consent checkbox */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 8, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3, accentColor: "#22d3ee", width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.5, fontFamily: "'Outfit', sans-serif" }}>
              Даю согласие на обработку данных о здоровье
            </span>
          </label>

          <p style={{ fontSize: 12, color: "#475569", marginBottom: 20, lineHeight: 1.5 }}>
            <a href="/privacy#health-data" target="_blank" rel="noopener noreferrer"
              style={{ color: "#22d3ee", textDecoration: "underline" }}>
              Подробнее в Политике конфиденциальности
            </a>
          </p>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!agreed || saving}
            style={{ ...btnPrimary, opacity: agreed ? 1 : 0.5 }}
          >
            {saving ? "Сохраняем..." : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
