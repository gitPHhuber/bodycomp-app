import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../lib/tracker";

export default function HealthDataConsent({ open, onClose, onConsent }) {
  const { user, fetchProfile } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

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

      trackEvent("consent_health_data_granted");
      onConsent?.();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  };

  const modal = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    border: "1px solid #334155", borderRadius: 20,
    padding: 28, maxWidth: 480, width: "100%",
    color: "#e2e8f0", fontFamily: "'Outfit', 'Manrope', sans-serif",
  };

  const btnPrimary = {
    width: "100%", padding: 16, border: "none", borderRadius: 14,
    background: agreed
      ? "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)"
      : "#334155",
    color: agreed ? "#020617" : "#64748b",
    fontSize: 16, fontWeight: 700, cursor: agreed ? "pointer" : "default",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: agreed ? "0 0 30px #22d3ee33" : "none",
    transition: "all 0.3s",
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}>🔒</div>
        <h2 style={{
          fontSize: 20, fontWeight: 800, textAlign: "center", margin: "0 0 8px",
          background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Согласие на обработку медицинских данных
        </h2>
        <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16, textAlign: "center" }}>
          Для хранения результатов DXA-исследований нам необходимо ваше согласие.
        </p>

        <div style={{
          background: "#020617", borderRadius: 14, padding: 16,
          border: "1px solid #1e293b", marginBottom: 20,
          fontSize: 13, color: "#94a3b8", lineHeight: 1.7,
        }}>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: "#e2e8f0" }}>Какие данные:</strong> результаты DXA-денситометрии (процент жира, мышечная и костная масса, T-score, висцеральный жир), PDF-отчёты.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: "#e2e8f0" }}>Цель:</strong> хранение, отображение динамики, персональные рекомендации.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: "#e2e8f0" }}>Основание:</strong> ваше добровольное информированное согласие (ФЗ-152 «О персональных данных»).
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#e2e8f0" }}>Отзыв:</strong> вы можете отозвать согласие в любой момент в настройках профиля.
          </p>
        </div>

        <label style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          cursor: "pointer", marginBottom: 20, fontSize: 14, color: "#e2e8f0",
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 2, accentColor: "#22d3ee", width: 18, height: 18 }}
          />
          <span>
            Я даю согласие на обработку моих медицинских данных в соответствии с{" "}
            <a href="/privacy" target="_blank" rel="noopener" style={{ color: "#22d3ee", textDecoration: "underline" }}>
              политикой конфиденциальности
            </a>.
          </span>
        </label>

        <button onClick={handleConfirm} disabled={!agreed || saving} style={btnPrimary}>
          {saving ? "Сохраняем..." : "Дать согласие"}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 10, padding: 12, background: "none",
            border: "none", color: "#64748b", fontSize: 13, cursor: "pointer",
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
