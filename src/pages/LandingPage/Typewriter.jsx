import { useState, useEffect } from "react";

export default function Typewriter({ text, speed = 55, delay = 0, style = {} }) {
  const [d, setD] = useState("");
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!go) return;
    let i = 0;
    const iv = setInterval(() => { i++; setD(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, speed);
    return () => clearInterval(iv);
  }, [go, text, speed]);
  return (
    <span style={style}>
      {d}
      <span style={{ opacity: d.length < text.length ? 1 : 0, animation: "blink .8s step-end infinite" }}>|</span>
    </span>
  );
}
