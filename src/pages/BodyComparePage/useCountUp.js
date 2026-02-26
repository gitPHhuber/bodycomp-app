import { useState, useEffect, useRef } from "react";

export function useCountUp(target, duration, active, delay = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const timer = useRef(null);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    timer.current = setTimeout(() => {
      const s = performance.now();
      const tick = (now) => {
        const p = Math.min((now - s) / duration, 1);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setVal(Math.round(e * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, active, delay]);
  return val;
}
