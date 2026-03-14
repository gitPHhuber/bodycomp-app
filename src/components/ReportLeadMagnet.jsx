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
  const containerRef = useRef(null);
  const trackedView = useRef(false);

  // Track view: immediately for modal, IntersectionObserver for inline


  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const trackedView = useRef(false);

  // Track view


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





    const observer = new IntersectionObserver(

    const obs = new IntersectionObserver(




      ([entry]) => {
        if (entry.isIntersecting && !trackedView.current) {
          tracker.trackEvent("report_teaser_view", { source });
          trackedView.current = true;

          obs.disconnect();





          observer.disconnect();

          obs.disconnect();




        }
      },
      { threshold: 0.3 }
    );


    obs.observe(el);
    return () => obs.disconnect();


    observer.observe(el);
    return () => observer.disconnect();

  }, [variant, source]);

  // Lock body scroll for modal
  useEffect(() => {
    if (variant !== "modal") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [variant]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");



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

      let submitted = false;

      if (supabase) {
        const { error: dbError } = await supabase.from("bookings").insert(payload);
        if (!dbError) submitted = true;
      }

      if (!submitted && FORMSPREE_URL) {





      if (supabase) {
        const { error: dbErr } = await supabase.from("bookings").insert(payload);
        if (dbErr) throw dbErr;
      } else if (FORMSPREE_URL) {




        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });


        if (res.ok) submitted = true;
      }

      if (!submitted) throw new Error("No backend");





        if (!res.ok) throw new Error("Formspree error");

      }


      tracker.trackEvent("report_email_submit", {
        source,
        email_domain: email.split("@")[1],
      });


      setStep("success");
    } catch {
      setError("Не удалось отправить. Попробуйте ещё раз.");

      setStep(2);
    } catch {
      setError("Ошибка отправки. Попробуйте ещё раз.");




      setStep(2);
    } catch {
      setError("Ошибка отправки. Попробуйте ещё раз.");

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
    if (onClose) onClose();
  };



  const card = (
    <div ref={containerRef} style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      borderRadius: 20,
      padding: 28,
      border: "1px solid #334155",
      maxWidth: variant === "modal" ? 440 : "100%",
      width: "100%",
      position: "relative",
    }}>
      {variant === "modal" && (
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "none", border: "none", color: "#64748b",
            fontSize: 22, cursor: "pointer", lineHeight: 1,
          }}
          aria-label="Закрыть"
        >
          ✕
        </button>
      )}

      {step === 1 ? (
        <>
          <div style={{
            fontSize: 11, color: "#22d3ee",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em", marginBottom: 8,
            textTransform: "uppercase",
          }}>
            Образец протокола
          </div>

          <h3 style={{
            fontSize: 20, fontWeight: 700, color: "#e2e8f0",
            margin: "0 0 8px", fontFamily: "'Outfit', sans-serif",
          }}>
            Посмотрите, что покажет DXA
          </h3>

          <p style={{
            fontSize: 14, color: "#94a3b8", lineHeight: 1.6,
            margin: "0 0 18px", fontFamily: "'Outfit', sans-serif",
          }}>
            Пример реального протокола обследования на европейском денситометре
            Stratos dR: жир, мышцы, кость, висцеральный жир по зонам.
          </p>

          {/* Blur preview placeholder */}
          <div style={{
            borderRadius: 12, padding: 32,
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            border: "1px solid #334155",
            textAlign: "center", marginBottom: 20,
            position: "relative", overflow: "hidden",
          }}>
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
              background: "linear-gradient(180deg, transparent 40%, #0f172a 100%)",
            }} />
          </div>

          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш email"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%", padding: "14px 16px",
              borderRadius: 12,
              background: "#0f172a",
              border: "1.5px solid #334155",
              color: "#fff", fontSize: 16,
              fontFamily: "'Outfit', sans-serif",
              outline: "none",
              marginBottom: 14,
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#22d3ee"; }}
            onBlur={(e) => { e.target.style.borderColor = "#334155"; }}
          />

          {/* Consent checkbox */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 16, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                marginTop: 3, accentColor: "#22d3ee",
                width: 16, height: 16, flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 13, color: "#94a3b8", lineHeight: 1.5,
              fontFamily: "'Outfit', sans-serif",
            }}>
              Согласен на обработку данных и получение информационных материалов
              {" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#22d3ee", textDecoration: "underline" }}
              >
                (Политика конфиденциальности)
              </a>
            </span>
          </label>

          {error && (
            <div style={{
              fontSize: 13, color: "#ef4444", marginBottom: 12,
              fontFamily: "'Outfit', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-lift-glow"
            style={{
              "--hover-shadow": "0 6px 30px #22d3ee30",
              width: "100%", padding: 16,
              border: "none", borderRadius: 14,
              background: loading
                ? "#334155"
                : "linear-gradient(135deg, #0891b2, #22d3ee)",
              color: "#020617", fontSize: 15,
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: "0 0 20px #22d3ee20",
              transition: "all 0.3s",
            }}
          >
            {loading ? "Отправка..." : "Получить протокол бесплатно →"}
          </button>
        </>
      ) : (
        /* Step 2: Success */
        <>
          <div style={{
            textAlign: "center", padding: "12px 0",
          }}>
            <div style={{
              fontSize: 48, marginBottom: 12,
              animation: "bounceIn 0.6s ease",
            }}>
              ✅
            </div>

            <h3 style={{
              fontSize: 20, fontWeight: 700, color: "#e2e8f0",
              margin: "0 0 10px", fontFamily: "'Outfit', sans-serif",
            }}>
              Протокол отправлен!
            </h3>

            <p style={{
              fontSize: 14, color: "#94a3b8", lineHeight: 1.6,
              margin: "0 0 24px", fontFamily: "'Outfit', sans-serif",
            }}>
              Проверьте почту — мы отправили пример протокола DXA body composition.
            </p>

            <p style={{
              fontSize: 15, color: "#e2e8f0", fontWeight: 600,
              margin: "0 0 16px", fontFamily: "'Outfit', sans-serif",
            }}>
              Хотите узнать свои реальные цифры?
            </p>

            <button
              onClick={handleBook}
              className="btn-lift-glow"
              style={{
                "--hover-shadow": "0 6px 30px #10b98130",
                width: "100%", padding: 16,
                border: "none", borderRadius: 14,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                color: "#020617", fontSize: 15,
                fontWeight: 700, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: "0 0 20px #10b98120",
                transition: "all 0.3s",
              }}
            >
              Записаться на обследование →
            </button>
          </div>
        </>
      )}






  // ── Styles ──
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
      <div
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "#000a", backdropFilter: "blur(8px)",
        }} />
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
          {card}
        </div>
      </div>
    );
  }


  return <div ref={containerRef}>{card}</div>;




  return card;

  return <div ref={ref}>{card}</div>;


}
