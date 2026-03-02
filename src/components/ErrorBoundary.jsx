import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[BodyComp] Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontFamily: "'Outfit', sans-serif",
          textAlign: "center",
          padding: 40,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Что-то пошло не так</div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
            Попробуйте обновить страницу
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
