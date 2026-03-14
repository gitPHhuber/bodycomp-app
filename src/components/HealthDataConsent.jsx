
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

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { trackEvent } from "../lib/tracker";

export default function HealthDataConsent({ onConsent, onClose }) {
  const { user, fetchProfile } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAccept() {
    if (!agreed || !supabase || !user || saving) return;

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

      trackEvent("consent_health_data_granted");
      onConsent?.();
    } catch {
      // silent
    } finally {

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

        <button onClick={handleAccept} disabled={!agreed || saving} style={btnPrimary}>
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
