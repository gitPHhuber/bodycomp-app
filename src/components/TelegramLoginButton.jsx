import { useEffect, useRef, useState } from "react";

const BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME;

export default function TelegramLoginButton({ onAuth }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!BOT_NAME || !containerRef.current) {
      setError(true);
      return;
    }

    // Expose callback globally for Telegram widget
    window.__tg_auth_callback = (tgUser) => {
      if (onAuth) onAuth(tgUser);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", BOT_NAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "__tg_auth_callback(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    script.onload = () => setLoaded(true);
    script.onerror = () => setError(true);

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    const timeout = setTimeout(() => {
      if (!loaded) setError(true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      delete window.__tg_auth_callback;
    };
  }, [onAuth]);

  if (error || !BOT_NAME) return null;

  return (
    <div ref={containerRef} style={{ display: "flex", justifyContent: "center", minHeight: 40 }} />
  );
}
