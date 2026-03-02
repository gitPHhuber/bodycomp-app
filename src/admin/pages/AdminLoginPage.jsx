import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors, fonts, inputStyle, btnPrimary } from "../styles";

export default function AdminLoginPage() {
  const { user, isAdmin, loading, otpSent, setOtpSent, signInWithEmail, verifyOtp } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        color: colors.textDim,
        fontFamily: fonts.mono,
        fontSize: 14,
      }}>
        Загрузка...
      </div>
    );
  }

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error: err } = await signInWithEmail(email);
    setSending(false);
    if (err) setError(err.message);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    const { error: err } = await verifyOtp(email, code);
    setSending(false);
    if (err) setError(err.message);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: colors.bg,
    }}>
      <div style={{
        width: 400,
        padding: 40,
        borderRadius: 20,
        background: colors.card,
        border: `1px solid ${colors.border}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: fonts.mono,
            fontWeight: 800,
            fontSize: 24,
            color: colors.accent,
            letterSpacing: "0.04em",
          }}>
            BODYCOMP
          </div>
          <div style={{
            fontSize: 12,
            color: colors.textDim,
            fontFamily: fonts.mono,
            letterSpacing: "0.12em",
            marginTop: 4,
          }}>
            ADMIN PANEL
          </div>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: colors.textMuted, marginBottom: 6, fontFamily: fonts.mono,
              }}>
                Email администратора
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
              />
            </div>

            <button
              type="submit"
              disabled={sending || !email.trim()}
              style={{
                ...btnPrimary,
                width: "100%",
                opacity: sending || !email.trim() ? 0.5 : 1,
                cursor: sending || !email.trim() ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "Отправляем..." : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{
              fontSize: 13, color: colors.textMuted, marginBottom: 20,
              fontFamily: fonts.body, textAlign: "center",
            }}>
              Код отправлен на <strong style={{ color: colors.text }}>{email}</strong>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: colors.textMuted, marginBottom: 6, fontFamily: fonts.mono,
              }}>
                Код из письма
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                style={{ ...inputStyle, textAlign: "center", fontSize: 20, letterSpacing: "0.2em", fontFamily: fonts.mono }}
                onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={sending || !code.trim()}
              style={{
                ...btnPrimary,
                width: "100%",
                opacity: sending || !code.trim() ? 0.5 : 1,
                cursor: sending || !code.trim() ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "Проверяем..." : "Войти"}
            </button>

            <button
              type="button"
              onClick={() => { setOtpSent(false); setCode(""); setError(null); }}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "10px 20px",
                border: "none",
                background: "transparent",
                color: colors.textDim,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              ← Другой email
            </button>
          </form>
        )}

        {error && (
          <div style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 10,
            background: `${colors.error}15`,
            border: `1px solid ${colors.error}30`,
            color: colors.error,
            fontSize: 13,
            fontFamily: fonts.body,
            textAlign: "center",
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
