import { useEffect } from "react";

const DEFAULT_TITLE = "Состав тела — узнайте реальные цифры | DXA-анализ";
const DEFAULT_DESCRIPTION =
  "Бесплатный расчёт состава тела за 3 минуты. Процент жира, мышечная масса, метаболизм. Запись на точный DXA-анализ.";

/**
 * Sets document title and meta description.
 * Cleanup on unmount restores the defaults.
 */
export function useMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? "";

    document.title = title;
    if (meta) meta.setAttribute("content", description);

    return () => {
      document.title = DEFAULT_TITLE;
      if (meta) meta.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
