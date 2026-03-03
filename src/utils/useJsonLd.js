import { useEffect } from "react";

/**
 * Injects JSON-LD script into <head> for current page and removes it on unmount.
 */
export function useJsonLd(data, id) {
  useEffect(() => {
    if (!data || typeof document === "undefined") return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    if (id) script.setAttribute("data-schema-id", id);
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data, id]);
}
