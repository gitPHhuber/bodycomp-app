import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle } from "../styles";
import StatCard from "../components/StatCard";
import PeriodFilter, { getDateRange } from "../components/PeriodFilter";
import ConversionFunnel from "../components/ConversionFunnel";
import LiveFeed from "../components/LiveFeed";

const PIE_COLORS = ["#22d3ee", "#3b82f6", "#a78bfa", "#f59e0b", "#10b981"];

const tooltipStyle = {
  contentStyle: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    fontSize: 12,
    color: colors.text,
    fontFamily: fonts.body,
  },
  labelStyle: { color: colors.textDim },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState("week");
  const [stats, setStats] = useState({ usersToday: 0, usersWeek: 0, usersTotal: 0, calcsToday: 0, bookings: 0, conversion: 0, bookingsPeriod: 0, completedPeriod: 0 });
  const [funnel, setFunnel] = useState([]);
  const [visitChart, setVisitChart] = useState([]);
  const [cities, setCities] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const dateFrom = getDateRange(period);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();

    try {
      // Stats queries in parallel
      // Build period-filtered booking queries
      let bPeriodQ = supabase.from("bookings").select("*", { count: "exact", head: true });
      if (dateFrom) bPeriodQ = bPeriodQ.gte("created_at", dateFrom);
      let bCompletedQ = supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed");
      if (dateFrom) bCompletedQ = bCompletedQ.gte("created_at", dateFrom);

      const [
        { count: usersTotal },
        { count: usersToday },
        { count: usersWeek },
        { count: calcsToday },
        { count: bookingsCount },
        { count: calcsTotal },
        { count: bookingsPeriod },
        { count: completedPeriod },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("calc_results").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("calc_results").select("*", { count: "exact", head: true }),
        bPeriodQ,
        bCompletedQ,
      ]);

      const conversion = calcsTotal > 0 ? ((bookingsCount / calcsTotal) * 100).toFixed(1) : 0;
      setStats({ usersToday, usersWeek, usersTotal, calcsToday, bookings: bookingsCount, conversion, bookingsPeriod: bookingsPeriod || 0, completedPeriod: completedPeriod || 0 });

      // Funnel
      await loadFunnel(dateFrom);

      // Visit chart
      await loadVisitChart(dateFrom);

      // Cities
      await loadCities(dateFrom);

      // Traffic sources
      await loadSources(dateFrom);

    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFunnel(dateFrom) {
    let query = supabase
      .from("events")
      .select("event_type, session_id, page, element");
    if (dateFrom) query = query.gte("created_at", dateFrom);

    const { data: events } = await query;
    if (!events) return;

    const sessions = {};
    events.forEach((e) => {
      if (!sessions[e.session_id]) {
        sessions[e.session_id] = { types: new Set(), clinicPage: false, formFocus: false, waitlistSubmit: false };
      }
      sessions[e.session_id].types.add(e.event_type);
      if (e.event_type === "page_view" && e.page === "/clinics") sessions[e.session_id].clinicPage = true;
      if (e.event_type === "form_focus") sessions[e.session_id].formFocus = true;
      if (e.event_type === "click" && e.element === "waitlist_submit") sessions[e.session_id].waitlistSubmit = true;
    });

    const sessionList = Object.values(sessions);
    const pageViews = sessionList.filter((s) => s.types.has("page_view")).length;
    const calcStarts = sessionList.filter((s) => s.types.has("calc_start")).length;
    const calcCompletes = sessionList.filter((s) => s.types.has("calc_complete")).length;
    const clinicPageViews = sessionList.filter((s) => s.clinicPage).length;
    const formStarts = sessionList.filter((s) => s.formFocus).length;
    const waitlistSubmits = sessionList.filter((s) => s.waitlistSubmit).length;

    setFunnel([
      { label: "Посещения", value: pageViews },
      { label: "Калькулятор начат", value: calcStarts },
      { label: "Калькулятор завершён", value: calcCompletes },
      { label: "Страница клиник", value: clinicPageViews },
      { label: "Форма заявки", value: formStarts },
      { label: "Заявка отправлена", value: waitlistSubmits },
    ]);
  }

  async function loadVisitChart(dateFrom) {
    let query = supabase
      .from("events")
      .select("created_at")
      .eq("event_type", "page_view");
    if (dateFrom) query = query.gte("created_at", dateFrom);

    const { data } = await query;
    if (!data) return;

    const byDay = {};
    data.forEach((e) => {
      const day = e.created_at.split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const chartData = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
        visits: count,
      }));

    setVisitChart(chartData);
  }

  async function loadCities(dateFrom) {
    let query = supabase.from("users").select("city");
    if (dateFrom) query = query.gte("created_at", dateFrom);

    const { data } = await query;
    if (!data) return;

    const counts = {};
    data.forEach((u) => {
      if (u.city) counts[u.city] = (counts[u.city] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    setCities(sorted);
  }

  async function loadSources(dateFrom) {
    let query = supabase
      .from("events")
      .select("meta")
      .eq("event_type", "page_view");
    if (dateFrom) query = query.gte("created_at", dateFrom);
    query = query.limit(5000);

    const { data } = await query;
    if (!data) return;

    const counts = { "Прямой": 0, "Поиск": 0, "Telegram": 0, "Реферал": 0 };
    data.forEach((e) => {
      const src = e.meta?.utm?.utm_source?.toLowerCase() || "";
      if (!src && !e.meta?.utm?.ref) {
        counts["Прямой"]++;
      } else if (src.includes("google") || src.includes("yandex") || src.includes("bing")) {
        counts["Поиск"]++;
      } else if (src.includes("telegram") || src.includes("tg") || e.meta?.utm?.ref?.includes("tg")) {
        counts["Telegram"]++;
      } else {
        counts["Реферал"]++;
      }
    });

    setSources(
      Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: colors.text,
            fontFamily: fonts.body, margin: 0,
          }}>
            Дашборд
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            Обзор ключевых метрик
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard
          label="Сегодня"
          value={stats.usersToday}
          sub="новых пользователей"
          color={colors.accent}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
        <StatCard
          label="За неделю"
          value={stats.usersWeek}
          sub="новых пользователей"
          color="#3b82f6"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
        <StatCard
          label="Всего"
          value={stats.usersTotal}
          sub="пользователей"
          color="#a78bfa"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
        <StatCard
          label="Калькулятор"
          value={stats.calcsToday}
          sub="расчётов сегодня"
          color="#10b981"
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <StatCard
          label="Записи DXA"
          value={stats.bookings}
          color="#f59e0b"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <StatCard
          label="Конверсия"
          value={`${stats.conversion}%`}
          sub="расчёт → запись"
          color={colors.accent}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard
          label="Заявки"
          value={stats.bookingsPeriod}
          sub="за период"
          color="#8b5cf6"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <StatCard
          label="Completed"
          value={stats.completedPeriod}
          sub="выполненных сканов"
          color="#10b981"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Conversion Funnel */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: colors.text,
            fontFamily: fonts.body, margin: "0 0 16px",
          }}>
            Воронка конверсии
          </h3>
          <ConversionFunnel steps={funnel} />
        </div>

        {/* Visit chart */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: colors.text,
            fontFamily: fonts.body, margin: "0 0 16px",
          }}>
            Посещения по дням
          </h3>
          <div style={{ width: "100%", height: 250 }}>
            {visitChart.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={visitChart} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: colors.textDim, fontSize: 10, fontFamily: fonts.mono }}
                    axisLine={{ stroke: colors.border }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: colors.textDim, fontSize: 10, fontFamily: fonts.mono }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke={colors.accent}
                    strokeWidth={2}
                    dot={{ fill: colors.accent, r: 3 }}
                    name="Визиты"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12 }}>
                Нет данных за период
              </div>
            )}
          </div>
        </div>

        {/* Top cities */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: colors.text,
            fontFamily: fonts.body, margin: "0 0 16px",
          }}>
            Топ-10 городов
          </h3>
          {cities.length > 0 ? (
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={cities} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
                  <XAxis
                    type="number"
                    tick={{ fill: colors.textDim, fontSize: 10, fontFamily: fonts.mono }}
                    axisLine={{ stroke: colors.border }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: fonts.body }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill={colors.accent} radius={[0, 4, 4, 0]} name="Пользователи" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12 }}>
              Нет данных о городах
            </div>
          )}
        </div>

        {/* Traffic sources */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: colors.text,
            fontFamily: fonts.body, margin: "0 0 16px",
          }}>
            Источники трафика
          </h3>
          {sources.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 180, height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sources}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {sources.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sources.map((s, i) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }} />
                    <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 12, color: colors.text, fontFamily: fonts.mono, fontWeight: 600 }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12 }}>
              Нет данных
            </div>
          )}
        </div>
      </div>

      {/* Live feed */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: colors.text,
            fontFamily: fonts.body, margin: 0,
          }}>
            Последние действия
          </h3>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: colors.success,
            boxShadow: `0 0 8px ${colors.success}`,
          }} />
        </div>
        <LiveFeed />
      </div>
    </div>
  );
}
