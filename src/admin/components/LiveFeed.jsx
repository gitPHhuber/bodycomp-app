import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { colors, fonts } from "../styles";

const EVENT_LABELS = {
  page_view: "Просмотр",
  click: "Клик",
  calc_start: "Калькулятор начат",
  calc_complete: "Калькулятор завершён",
  quiz_start: "Квиз начат",
  quiz_complete: "Квиз завершён",
  booking_click: "Запись",
  share: "Шеринг",
  scroll_depth: "Скролл",
  time_on_page: "Время на стр.",
  model_interact: "3D модель",
  form_focus: "Фокус на поле",
  form_abandon: "Брошенная форма",
  cta_view: "CTA в viewport",
};

const EVENT_COLORS = {
  page_view: "#64748b",
  click: "#94a3b8",
  calc_start: "#3b82f6",
  calc_complete: "#22d3ee",
  quiz_start: "#a78bfa",
  quiz_complete: "#8b5cf6",
  booking_click: "#10b981",
  share: "#f59e0b",
  form_focus: "#06b6d4",
  form_abandon: "#ef4444",
  cta_view: "#eab308",
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LiveFeed() {
  const [events, setEvents] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;

    // Load initial events
    supabase
      .from("events")
      .select("id, event_type, page, element, created_at, session_id")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setEvents(data.reverse());
      });

    // Realtime subscription
    const channel = supabase
      .channel("admin-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (payload) => {
        setEvents((prev) => {
          const next = [...prev, payload.new];
          return next.slice(-20);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight: 400,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {events.length === 0 ? (
        <div style={{
          padding: 32,
          textAlign: "center",
          color: colors.textDim,
          fontFamily: fonts.mono,
          fontSize: 12,
        }}>
          Ожидание событий...
        </div>
      ) : (
        events.map((ev) => {
          const color = EVENT_COLORS[ev.event_type] || colors.textDim;
          return (
            <div
              key={ev.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: `${color}08`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <span style={{
                fontSize: 10,
                color: colors.textDim,
                fontFamily: fonts.mono,
                flexShrink: 0,
                width: 60,
              }}>
                {formatTime(ev.created_at)}
              </span>
              <span style={{
                fontSize: 11,
                color,
                fontFamily: fonts.mono,
                fontWeight: 600,
                flexShrink: 0,
                width: 130,
              }}>
                {EVENT_LABELS[ev.event_type] || ev.event_type}
              </span>
              <span style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: fonts.body,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {ev.page || ev.element || ""}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
