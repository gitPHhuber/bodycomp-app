import { useEffect, useRef } from "react";

const DEFAULT_TITLE = "Состав тела — узнайте реальные цифры | DXA-анализ";
const DEFAULT_DESCRIPTION =
  "Бесплатный расчёт состава тела за 3 минуты. Процент жира, мышечная масса, метаболизм. Запись на точный DXA-анализ.";

/**
 * Sets document title and meta description.
 * Tags are applied synchronously during render so that prerender bots
 * (which may not wait for useEffect) pick them up immediately.
 * Cleanup on unmount restores the defaults.
 */
export function useMeta(title, description) {
  const prev = useRef(null);

  // Apply synchronously during render for prerender / partial-JS bots
  if (typeof document !== "undefined") {
    if (!prev.current) {
      prev.current = {
        title: document.title,
        description:
          document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      };
    }
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }

  useEffect(() => {
    // Re-apply in effect in case React hydration reverted synchronous changes
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);

    return () => {
      document.title = DEFAULT_TITLE;
      if (meta) meta.setAttribute("content", DEFAULT_DESCRIPTION);
      prev.current = null;
    };
  }, [title, description]);
}
