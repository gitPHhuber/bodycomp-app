import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as tracker from "../../lib/tracker";

const COUPON_CODE = "BODY500";
const BONUS_AMOUNT = 500;
const TIMER_DURATION_MS = 48 * 60 * 60 * 1000;
const LS_KEY_SHOWN = "bc_offer_shown_at";
const SOCIAL_PROOF_COUNT = 127;

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function easeOutQuad(t) {
  return t * (2 - t);
}

export default function OfferBanner({ archetype, visible }) {
  const navigate = useNavigate();
  const bannerRef = useRef(null);
  const hasTrackedView = useRef(false);
  const hasAnimated = useRef(false);
  const timerExpiredTracked = useRef(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [countValue, setCountValue] = useState(0);
  const [copied, setCopied] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!visible) return;

    let savedAt = localStorage.getItem(LS_KEY_SHOWN);
    if (!savedAt) {
      savedAt = String(Date.now());
      localStorage.setItem(LS_KEY_SHOWN, savedAt);
    }

    const computeRemaining = () => TIMER_DURATION_MS - (Date.now() - Number(savedAt));
    setTimeLeft(computeRemaining());

    const interval = setInterval(() => {
      const remaining = computeRemaining();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (!timerExpiredTracked.current) {
          timerExpiredTracked.current = true;
          tracker.trackEvent("offer_timer_expire", { variant: "bonus_500" });
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  // IntersectionObserver for tracking + counter animation
  useEffect(() => {
    if (!visible || !bannerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        // Track view once
        if (!hasTrackedView.current) {
          hasTrackedView.current = true;
          tracker.trackOfferView("bonus_500", "/analyzer");
        }

        // Animate counter once
        if (!hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const startTime = performance.now();

          function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            setCountValue(Math.round(easedProgress * BONUS_AMOUNT));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          requestAnimationFrame(animate);
        }

        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(bannerRef.current);
    return () => observer.disconnect();
  }, [visible]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(COUPON_CODE).catch(() => {});
    setCopied(true);
    tracker.trackClick("coupon_copy", { code: COUPON_CODE });
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCTA = useCallback(() => {
    localStorage.setItem("bc_offer_claimed", "true");
    localStorage.setItem("bc_coupon_code", COUPON_CODE);
    tracker.trackClick("offer_cta_click", {
      variant: "bonus_500",
      coupon_code: COUPON_CODE,
      archetype: archetype?.id,
    });
    navigate("/clinics?coupon=BODY500&scan_type=primary");
  }, [archetype, navigate]);

  if (!visible) return null;

  const expired = timeLeft !== null && timeLeft <= 0;
  const urgent = timeLeft !== null && timeLeft > 0 && timeLeft < 2 * 60 * 60 * 1000;

  return (
    <div
      ref={bannerRef}
      style={{
        background: expired
          ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
          : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        border: expired ? "1px solid #47556966" : "1px solid #f59e0b44",
        boxShadow: expired ? "none" : "0 0 30px #f59e0b10",
        textAlign: "center",
      }}
    >
      {/* Header */}
      <div style={{ fontSize: 20, fontWeight: 700, color: expired ? "#64748b" : "#e2e8f0", marginBottom: 16 }}>
        {expired ? "Бонус истёк" : "🎁 Вы заслужили бонус!"}
      </div>

      {/* Animated counter */}
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          background: expired ? "#33415522" : "#f59e0b11",
          borderRadius: 16,
          padding: "16px 32px",
          marginBottom: 16,
          border: expired ? "1px solid #47556944" : "1px solid #f59e0b33",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: expired ? "#64748b" : "#f59e0b",
            lineHeight: 1.1,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {countValue}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: expired ? "#475569" : "#fbbf24", marginTop: 4 }}>
          бонусных ₽
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 15, color: expired ? "#64748b" : "#cbd5e1", marginBottom: 16, lineHeight: 1.5 }}>
        {expired
          ? "Срок действия бонуса истёк"
          : "500 бонусных ₽ на первое DXA-обследование"}
      </div>

      {/* Coupon code */}
      {!expired && (
        <div
          onClick={handleCopy}
          style={{
            display: "inline-block",
            background: "#f59e0b22",
            border: "1px dashed #f59e0b",
            borderRadius: 10,
            padding: "10px 24px",
            marginBottom: 16,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Нажмите, чтобы скопировать"
        >
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Ваш промокод
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
            {COUPON_CODE}
          </div>
          {copied && (
            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
              Промокод скопирован ✓
            </div>
          )}
        </div>
      )}

      {/* Timer */}
      {!expired && timeLeft !== null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>⏰ Бонус действует:</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: urgent ? "#ef4444" : "#22d3ee",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* CTA button */}
      {!expired && (
        <button
          className="btn-lift"
          onClick={handleCTA}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: 14,
            background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
            color: "#020617",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.02em",
            boxShadow: "0 0 30px #f59e0b33",
            marginBottom: 16,
          }}
        >
          Записаться со скидкой →
        </button>
      )}

      {/* Social proof */}
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
        Уже воспользовались: {SOCIAL_PROOF_COUNT} человек
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, fontStyle: "italic" }}>
        Имеются противопоказания. Необходима консультация специалиста.
      </div>
    </div>
  );
}
