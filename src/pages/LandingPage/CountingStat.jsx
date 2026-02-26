import { useState, useEffect, useRef } from "react";

export default function CountingStat({ value, suffix, label, duration = 2000 }) {
  const [cur, setCur] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.4 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const s = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - s) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 5);
      setCur(eased * num);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration]);

  const p = parseFloat(value) > 0 ? cur / parseFloat(value) : 0;
  let r, g, b;
  if (p < 0.33) {
    const t = p / 0.33;
    r = Math.round(16 + t * (250 - 16));
    g = Math.round(185 + t * (204 - 185));
    b = Math.round(129 + t * (21 - 129));
  } else if (p < 0.66) {
    const t = (p - 0.33) / 0.33;
    r = Math.round(250 + t * (249 - 250));
    g = Math.round(204 + t * (115 - 204));
    b = Math.round(21 + t * (22 - 21));
  } else {
    const t = (p - 0.66) / 0.34;
    r = Math.round(249 + t * (239 - 249));
    g = Math.round(115 + t * (68 - 115));
    b = Math.round(22 + t * (68 - 22));
  }
  const color = `rgb(${r},${g},${b})`;
  const glowOpacity = 0.05 + p * 0.45;
  const glowSize = 12 + p * 35;
  const glow = `0 0 ${glowSize}px rgba(${r},${g},${b},${glowOpacity})`;

  return (
    <div ref={ref} style={{ flex: "0 0 auto", textAlign: "center", padding: "16px 20px", minWidth: 120 }}>
      <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color, textShadow: glow, lineHeight: 1.1 }}>
        {suffix === "%" ? Math.round(cur) : cur.toFixed(cur < 10 ? 1 : 0).replace(/\.0$/, "")}{suffix}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.3, maxWidth: 110, margin: "6px auto 0" }}>{label}</div>
    </div>
  );
}
