import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import * as tracker from "../lib/tracker";

const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReportLeadMagnet({ variant = "inline", onClose, source = "landing" }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("form"); // 'form' | 'success'
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);
  const trackedView = useRef(false);

  // Track view: immediately for modal, IntersectionObserver for inline
  useEffect(() => {
    if (trackedView.current) return;

    if (variant === "modal") {
      tracker.trackEvent("report_teaser_view", { source });
      trackedView.current = true;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }

    // inline — use IntersectionObserver
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedView.current) {
          tracker.trackEvent("report_teaser_view", { source });
          trackedView.current = true;
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant, source]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!EMAIL_RE.test(email)) {
      setError("Введите корректный email");
      return;
    }
    if (!agreed) {
      setError("Необходимо согласие на обработку данных");
      return;
    }

    setLoading(true);

    const utmParams = tracker.getUtmParams();
    const payload = {
      name: "",
      phone: "",
      email,
      session_id: tracker.getSessionId(),
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      source_page: window.location.pathname,
      lead_type: "report_sample",
      status: "lead",
      scan_type: "primary",
      offer_variant: "report_protocol",
    };

    try {
      if (supabase) {
        const { error: dbErr } = await supabase.from("bookings").insert(payload);
        if (dbErr) throw dbErr;
      } else if (FORMSPREE_URL) {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Formspree error");
      }

      tracker.trackEvent("report_email_submit", {
        source,
        email_domain: email.split("@")[1],
      });
      setStep("success");
    } catch (err) {
      // If Supabase failed, try Formspree as fallback
      if (supabase && FORMSPREE_URL) {
        try {
          const res = await fetch(FORMSPREE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            tracker.trackEvent("report_email_submit", {
              source,
              email_domain: email.split("@")[1],
            });
            setStep("success");
            setLoading(false);
            return;
          }
        } catch (_) { /* fall through */ }
      }
      setError("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    tracker.trackEvent("report_cta_book", { source });
    navigate("/clinics");
    if (variant === "modal" && onClose) onClose();
  };

  // ── Styles ──
  const containerStyle = variant === "modal"
    ? {
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)",
        padding: 16,
      }
    : {};

  const cardStyle = {
    borderRadius: 22,
    padding: variant === "modal" ? 32 : 28,
    background: "linear-gradient(135deg, #0891b210, #22d3ee08)",
    border: "1px solid #22d3ee1a",
    maxWidth: 520,
    width: "100%",
    margin: variant === "modal" ? "0" : "0 auto",
    position: "relative",
    fontFamily: "'Outfit', sans-serif",
    ...(variant === "modal" ? { animation: "slideUp 0.35s ease-out" } : {}),
  };

  const formContent = (
    <>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#e2e8f0" }}>
        Посмотрите, что покажет DXA
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
        Пример реального протокола обследования на европейском денситометре Stratos dR:
        жир, мышцы, кость, висцеральный жир по зонам.
      </p>

      {/* Blur preview placeholder */}
      <div
        style={{
          borderRadius: 14, overflow: "hidden", marginBottom: 18,
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          border: "1px solid #334155",
          height: 160, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src="/images/report-preview-blur.webp"
          alt="Пример протокола DXA"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: "blur(3px)", opacity: 0.7,
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(15,23,42,0.5)",
        }}>
          <span style={{ fontSize: 13, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
            Образец протокола
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0",
            fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: "none",
            boxSizing: "border-box", marginBottom: 12,
          }}
        />

        <label
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            cursor: "pointer", marginBottom: 14, fontSize: 13, color: "#94a3b8", lineHeight: 1.5,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 3, accentColor: "#22d3ee", flexShrink: 0 }}
          />
          <span>
            Согласен на обработку данных и получение информационных материалов
            {" "}
            <a href="/privacy" target="_blank" rel="noopener" style={{ color: "#22d3ee", textDecoration: "underline" }}>
              (Политика конфиденциальности)
            </a>
          </span>
        </label>

        {error && (
          <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-lift-glow"
          style={{
            "--hover-shadow": "0 6px 30px #22d3ee30",
            width: "100%", padding: 14, border: "none", borderRadius: 14,
            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
            color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Отправка..." : "Получить протокол бесплатно →"}
        </button>
      </form>
    </>
  );

  const successContent = (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#e2e8f0" }}>
        Протокол отправлен!
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 8px" }}>
        Проверьте почту — мы отправили пример протокола DXA body composition.
      </p>
      <p style={{ fontSize: 15, color: "#e2e8f0", fontWeight: 600, margin: "0 0 20px" }}>
        Хотите узнать СВОИ реальные цифры?
      </p>
      <button
        onClick={handleBook}
        className="btn-lift-glow"
        style={{
          "--hover-shadow": "0 6px 30px #10b98130",
          width: "100%", padding: 14, border: "none", borderRadius: 14,
          background: "linear-gradient(135deg, #10b981, #34d399)",
          color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Записаться на обследование →
      </button>
    </div>
  );

  const card = (
    <div style={cardStyle}>
      {variant === "modal" && onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "none", border: "none", color: "#64748b",
            fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 4,
          }}
          aria-label="Закрыть"
        >
          ×
        </button>
      )}
      {step === "form" ? formContent : successContent}
    </div>
  );

  if (variant === "modal") {
    return (
      <div style={containerStyle} onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
        {card}
      </div>
    );
  }

  return <div ref={ref}>{card}</div>;
}
