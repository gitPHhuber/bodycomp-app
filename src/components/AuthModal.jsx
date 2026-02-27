import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TelegramLoginButton from "./TelegramLoginButton";
import { supabase } from "../lib/supabase";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signInWithEmail, user } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("input"); // input | sending | sent
  const [error, setError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (showAuthModal) {
      setEmail("");
      setStep("input");
      setError("");
    }
  }, [showAuthModal]);

  // Auto-close on auth success
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal, setShowAuthModal]);

  // Lock body scroll
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || step === "sending") return;

    setError("");
    setStep("sending");

    const { error: err } = await signInWithEmail(email.trim());
    if (err) {
      setError(err.message || "Ошибка отправки. Попробуйте позже.");
      setStep("input");
    } else {
      setStep("sent");
    }
  }

  async function handleTelegramAuth(tgUser) {
    if (!supabase || !tgUser) return;
    try {
      // Call edge function to verify Telegram auth and get session
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(tgUser),
        }
      );
      const data = await res.json();
      if (data.access_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      } else {
        setError("Ошибка авторизации через Telegram");
      }
    } catch {
      setError("Ошибка авторизации через Telegram");
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    background: "#0f172a",
    border: "1.5px solid #334155",
    borderRadius: 12,
    color: "#fff",
    fontSize: 16,
    outline: "none",
    fontFamily: "'Outfit', sans-serif",
    transition: "border-color 0.2s",
  };

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
      onClick={() => setShowAuthModal(false)}
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
          onClick={() => setShowAuthModal(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#1e293b", border: "none", color: "#94a3b8",
            width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16,
          }}
        >
          ✕
        </button>

        {step === "input" && (
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
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 800, margin: "0 0 6px",
                background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Войти в аккаунт
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Для сохранения результатов и истории расчётов
              </p>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#ef444422", border: "1px solid #ef444444",
                  color: "#fca5a5", fontSize: 13, marginBottom: 14,
                }}>
                  {error}
                </div>
              )}

              <button type="submit" style={{ ...btnPrimary, opacity: email ? 1 : 0.5 }} disabled={!email}>
                Войти через magic link
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              margin: "20px 0", color: "#475569", fontSize: 12,
            }}>
              <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
              или
              <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
            </div>

            {/* Telegram */}
            <TelegramLoginButton onAuth={handleTelegramAuth} />

            <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
              Без пароля. Мы отправим ссылку для входа на вашу почту.
            </p>
          </div>
        )}

        {step === "sending" && (
          <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeSlide 0.4s ease" }}>
            <div style={{
              width: 48, height: 48, border: "3px solid #22d3ee33",
              borderTopColor: "#22d3ee", borderRadius: "50%",
              animation: "spin3d 0.8s linear infinite",
              margin: "0 auto 20px",
            }} />
            <div style={{ fontSize: 15, color: "#94a3b8" }}>Отправляем ссылку...</div>
          </div>
        )}

        {step === "sent" && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeSlide 0.4s ease" }}>
            <div style={{ fontSize: 56, marginBottom: 16, animation: "bounceIn 0.6s ease" }}>✉️</div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, margin: "0 0 8px",
              background: "linear-gradient(135deg, #e2e8f0, #10b981)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Проверьте почту
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
              Мы отправили ссылку для входа на<br />
              <span style={{ color: "#22d3ee", fontWeight: 600 }}>{email}</span>
            </p>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
              Ссылка действует 1 час. Проверьте папку «Спам», если письмо не пришло.
            </p>
            <button
              onClick={() => setStep("input")}
              style={{
                marginTop: 20, background: "none", border: "1px solid #334155",
                color: "#94a3b8", padding: "12px 24px", borderRadius: 12,
                cursor: "pointer", fontSize: 13,
              }}
            >
              Отправить повторно
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
