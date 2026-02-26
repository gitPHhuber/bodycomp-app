import { useState, useEffect, useRef } from "react";

export default function Reveal({ children, from = "bottom", delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setV(true), delay); o.disconnect(); }
    }, { threshold: 0.06 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [delay]);
  const m = {
    bottom: "translateY(60px)", left: "translateX(-80px) rotate(-1.5deg)",
    right: "translateX(80px) rotate(1.5deg)", scale: "scale(0.85)", blur: "translateY(40px)",
  };
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0, transform: v ? "none" : m[from],
      transition: `all 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      filter: from === "blur" && !v ? "blur(6px)" : "none", ...style,
    }}>
      {children}
    </div>
  );
}
