import { useEffect } from "react";

const DEFAULT_TITLE = "Состав тела — узнайте реальные цифры | DXA-анализ";
const DEFAULT_DESCRIPTION =
  "Бесплатный расчёт состава тела за 3 минуты. Процент жира, мышечная масса, метаболизм. Запись на точный DXA-анализ.";

/**
 * Sets document title and meta description.
 * Cleanup on unmount restores the defaults.
 */
export function useMeta(title, description, structuredData) {
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? "";
    const scriptId = "page-jsonld";
    let script = document.getElementById(scriptId);

    document.title = title;
    if (meta) meta.setAttribute("content", description);

    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else if (script) {
      script.remove();
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (meta) meta.setAttribute("content", DEFAULT_DESCRIPTION);
      const current = document.getElementById(scriptId);
      if (current) current.remove();
    };
  }, [title, description, structuredData]);
}
