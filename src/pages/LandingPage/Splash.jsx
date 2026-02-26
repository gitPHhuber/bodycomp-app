import { useState, useEffect } from "react";

export default function Splash({ onDone }) {
  const [p, setP] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 18 + 5;
      if (v >= 100) {
        v = 100;
        clearInterval(iv);
        setTimeout(() => setFade(true), 300);
        setTimeout(onDone, 900);
      }
      setP(Math.min(v, 100));
    }, 120);
    return () => clearInterval(iv);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade ? 0 : 1, transition: "opacity 0.6s" }}>
      <div style={{ fontSize: 48, marginBottom: 24, animation: "spin3d 2s ease-in-out infinite" }}>◎</div>
      <div style={{ width: 180, height: 3, borderRadius: 2, background: "#1e293b", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#0891b2,#22d3ee)", width: `${p}%`, transition: "width 0.15s", boxShadow: "0 0 12px #22d3ee66" }} />
      </div>
      <div style={{ fontSize: 12, color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(p)}%</div>
    </div>
  );
}
