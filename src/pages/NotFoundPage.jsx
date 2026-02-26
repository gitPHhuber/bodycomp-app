import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import { useMeta } from "../utils/useMeta";

export default function NotFoundPage() {
  useMeta(
    "404 — Страница не найдена | BodyComp",
    "Запрашиваемая страница не существует. Вернитесь на главную и узнайте реальный состав тела."
  );

  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#020617",
      color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
        <Reveal from="scale">
          <div style={{
            fontSize: 120,
            fontWeight: 900,
            fontFamily: "'JetBrains Mono', monospace",
            background: "linear-gradient(135deg, #22d3ee, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: 16,
          }}>
            404
          </div>
        </Reveal>

        <Reveal from="bottom" delay={200}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 12px",
            color: "#e2e8f0",
          }}>
            Страница не найдена
          </h1>
        </Reveal>

        <Reveal from="bottom" delay={400}>
          <p style={{
            fontSize: 15,
            color: "#94a3b8",
            lineHeight: 1.6,
            margin: "0 0 32px",
            maxWidth: 360,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            Такой страницы не существует, но вы можете узнать реальный состав своего тела
          </p>
        </Reveal>

        <Reveal from="bottom" delay={600}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 320,
            margin: "0 auto",
          }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: 14,
                border: "none",
                borderRadius: 14,
                background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                color: "#020617",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: "0 0 20px #22d3ee20",
                transition: "transform 0.2s",
              }}
              onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.target.style.transform = "none"}
            >
              На главную →
            </button>
            <button
              onClick={() => navigate("/analyzer")}
              style={{
                padding: 12,
                border: "1px solid #334155",
                borderRadius: 14,
                background: "transparent",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={e => {
                e.target.style.borderColor = "#22d3ee";
                e.target.style.color = "#22d3ee";
              }}
              onMouseOut={e => {
                e.target.style.borderColor = "#334155";
                e.target.style.color = "#94a3b8";
              }}
            >
              Рассчитать состав тела
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
