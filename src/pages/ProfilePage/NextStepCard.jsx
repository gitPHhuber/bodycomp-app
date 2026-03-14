import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import * as tracker from "../../lib/tracker";

const INTERVAL_DAYS = 90;

export default function NextStepCard({ lastScanDate, scanType }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [reminderSet, setReminderSet] = useState(false);
  const [showConsentHint, setShowConsentHint] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!lastScanDate) return null;

  const daysSince = Math.floor((Date.now() - new Date(lastScanDate).getTime()) / 86400000);
  const daysUntil = INTERVAL_DAYS - daysSince;
  const isOverdue = daysUntil <= 0;

  const targetDate = new Date(lastScanDate);
  targetDate.setDate(targetDate.getDate() + INTERVAL_DAYS);
  const targetStr = targetDate.toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  function handleBookClick() {
    tracker.trackClick("next_step_cta_repeat", { days_until: daysUntil });
    navigate("/clinics?scan_type=repeat");
  }

  async function handleReminder() {
    if (!profile) return;

    if (!profile.consent_marketing) {
      setShowConsentHint(true);
      return;
    }

    if (!supabase || saving) return;
    setSaving(true);

    try {
      await supabase.from("reminders").insert({
        user_id: profile.id,
        remind_at: targetDate.toISOString(),
        type: "repeat_scan",
        channel: "email",
      });
      tracker.trackEvent("reminder_set", {
        remind_at: targetDate.toISOString(),
        channel: "email",
      });
      setReminderSet(true);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    border: "1px solid #334155",
  };

  return (
    <div style={cardStyle}>
      <div style={{
        fontSize: 11, color: "#22d3ee", textTransform: "uppercase",
        letterSpacing: "0.1em", marginBottom: 12,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        Следующий контроль
      </div>

      {isOverdue ? (
        <div style={{
          fontSize: 18, fontWeight: 700, color: "#22d3ee",
          marginBottom: 16, fontFamily: "'Outfit', sans-serif",
        }}>
          Пора на повторное обследование!
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 16, fontWeight: 600, color: "#e2e8f0",
            marginBottom: 4, fontFamily: "'Outfit', sans-serif",
          }}>
            Рекомендуемый повторный DXA:
          </div>
          <div style={{
            fontSize: 15, color: "#94a3b8",
            fontFamily: "'Outfit', sans-serif",
          }}>
            через {daysUntil} дней ({targetStr})
          </div>
        </div>
      )}

      <button
        onClick={handleBookClick}
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: 14,
          background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
          color: "#020617",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: "0 0 30px #22d3ee33",
          marginBottom: 10,
        }}
      >
        Записаться на повторный DXA →
      </button>

      {reminderSet ? (
        <div style={{
          textAlign: "center", padding: "10px 0",
          color: "#10b981", fontSize: 13, fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Напоминание установлено
        </div>
      ) : (
        <>
          <button
            onClick={handleReminder}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #334155",
              borderRadius: 12,
              background: "transparent",
              color: "#94a3b8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {saving ? "Сохраняем..." : "Напомнить мне"}
          </button>
          {showConsentHint && (
            <div style={{
              marginTop: 8, fontSize: 12, color: "#f59e0b",
              textAlign: "center", fontFamily: "'Outfit', sans-serif",
            }}>
              Включите уведомления в профиле
            </div>
          )}
        </>
      )}
    </div>
  );
}
