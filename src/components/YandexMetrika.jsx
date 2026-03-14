import { useEffect } from "react";

const METRIKA_ID = import.meta.env.VITE_METRIKA_ID;

export default function YandexMetrika() {
  useEffect(() => {
    if (!METRIKA_ID) return;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = Date.now();

    const script = document.createElement("script");
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    script.async = true;

    script.onload = () => {
      try {
        window.ym(Number(METRIKA_ID), "init", {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        });
      } catch {
        // Metrika init failed — silently degrade
      }
    };

    script.onerror = () => {
      // Script blocked by ad blocker — silently degrade
    };

    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  return null;
}
