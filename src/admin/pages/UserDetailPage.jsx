import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, btnSecondary } from "../styles";
import DataTable from "../components/DataTable";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [calcs, setCalcs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, [id]);

  async function loadUser() {
    if (!supabase || !id) return;
    setLoading(true);

    try {
      const [
        { data: userData },
        { data: eventsData },
        { data: calcsData },
        { data: quizzesData },
        { data: bookingsData },
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", id).single(),
        supabase.from("events").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(200),
        supabase.from("calc_results").select("*").eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("quiz_results").select("*").eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      ]);

      setUser(userData);
      setEvents(eventsData || []);
      setCalcs(calcsData || []);
      setQuizzes(quizzesData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Load user error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
        Пользователь не найден
      </div>
    );
  }

  const tabs = [
    { key: "events", label: "События", count: events.length },
    { key: "calcs", label: "Расчёты", count: calcs.length },
    { key: "quizzes", label: "Квизы", count: quizzes.length },
    { key: "bookings", label: "Записи", count: bookings.length },
  ];

  const eventColumns = [
    { key: "event_type", label: "Тип", maxWidth: 140 },
    { key: "page", label: "Страница", maxWidth: 200 },
    { key: "element", label: "Элемент", maxWidth: 160 },
    { key: "created_at", label: "Время", render: (v) => formatDate(v) },
  ];

  const calcColumns = [
    { key: "bmi", label: "ИМТ", render: (v) => v?.toFixed(1) },
    { key: "fat_pct", label: "Жир %", render: (v) => v?.toFixed(1) },
    { key: "muscle_kg", label: "Мышцы кг", render: (v) => v?.toFixed(1) },
    { key: "weight_kg", label: "Вес кг" },
    { key: "height_cm", label: "Рост см" },
    { key: "created_at", label: "Дата", render: (v) => formatDate(v) },
  ];

  const quizColumns = [
    { key: "quiz_slug", label: "Квиз" },
    { key: "score", label: "Балл" },
    { key: "share_count", label: "Шеры" },
    { key: "created_at", label: "Дата", render: (v) => formatDate(v) },
  ];

  const bookingColumns = [
    { key: "clinic_id", label: "Клиника", maxWidth: 200 },
    { key: "desired_date", label: "Дата записи" },
    { key: "status", label: "Статус", render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v === "completed" ? "#10b98120" : v === "confirmed" ? "#3b82f620" : "#f59e0b20",
        color: v === "completed" ? "#10b981" : v === "confirmed" ? "#3b82f6" : "#f59e0b",
      }}>
        {v}
      </span>
    )},
    { key: "created_at", label: "Создана", render: (v) => formatDate(v) },
  ];

  const infoItem = (label, value) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
        {value || "—"}
      </div>
    </div>
  );

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/admin/users")}
        style={{ ...btnSecondary, marginBottom: 20, padding: "8px 16px", fontSize: 13 }}
      >
        ← Назад к списку
      </button>

      {/* User profile card */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: colors.bg, fontSize: 22, fontWeight: 800, fontFamily: fonts.mono,
            }}>
              {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: fonts.body }}>
                {user.name || "Без имени"}
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.mono }}>
                {user.email}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, flex: 1 }}>
            {infoItem("Telegram ID", user.tg_id)}
            {infoItem("Город", user.city)}
            {infoItem("Источник", user.source)}
            {infoItem("Регистрация", formatDate(user.created_at))}
            {infoItem("Последний визит", formatDate(user.last_seen_at))}
            {infoItem("Расчёты", calcs.length)}
            {infoItem("Квизы", quizzes.length)}
            {infoItem("Записи", bookings.length)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: activeTab === tab.key ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
              background: activeTab === tab.key ? `${colors.accent}15` : "transparent",
              color: activeTab === tab.key ? colors.accent : colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={cardStyle}>
        {activeTab === "events" && <DataTable columns={eventColumns} data={events} />}
        {activeTab === "calcs" && <DataTable columns={calcColumns} data={calcs} />}
        {activeTab === "quizzes" && <DataTable columns={quizColumns} data={quizzes} />}
        {activeTab === "bookings" && <DataTable columns={bookingColumns} data={bookings} />}
      </div>
    </div>
  );
}
