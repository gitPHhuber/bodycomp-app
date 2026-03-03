import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, inputStyle, btnPrimary, btnSecondary } from "../styles";
import DataTable from "../components/DataTable";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABELS = {
  dxa_done: { label: "Прошёл DXA", color: "#10b981" },
  dxa_booked: { label: "Записался", color: "#f59e0b" },
  active: { label: "Активный", color: "#3b82f6" },
};

const SOURCES = ["website", "telegram", "referral"];

function normalizeUtm(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUtmSource, setFilterUtmSource] = useState("");
  const [filterUtmCampaign, setFilterUtmCampaign] = useState("");
  const [cities, setCities] = useState([]);
  const [utmSources, setUtmSources] = useState([]);
  const [utmCampaigns, setUtmCampaigns] = useState([]);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    try {
      // Load users
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!usersData) { setLoading(false); return; }

      // Load calc counts per user
      const { data: calcs } = await supabase
        .from("calc_results")
        .select("user_id");

      const calcCounts = {};
      (calcs || []).forEach((c) => {
        if (c.user_id) calcCounts[c.user_id] = (calcCounts[c.user_id] || 0) + 1;
      });

      // Load bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("user_id, status");

      // Load latest tracked page_view/click events meta per user
      const userIds = usersData.map((u) => u.id).filter(Boolean);
      let latestEventByUser = {};
      if (userIds.length > 0) {
        const { data: events } = await supabase
          .from("events")
          .select("user_id, session_id, event_type, created_at, meta")
          .in("event_type", ["page_view", "click"])
          .in("user_id", userIds)
          .order("created_at", { ascending: false });

        (events || []).forEach((e) => {
          if (!e.user_id || latestEventByUser[e.user_id]) return;
          latestEventByUser[e.user_id] = e;
        });
      }

      const bookingMap = {};
      (bookings || []).forEach((b) => {
        if (!bookingMap[b.user_id] || b.status === "completed") {
          bookingMap[b.user_id] = b.status;
        }
      });

      // Combine
      const enriched = usersData.map((u) => ({
        ...u,
        last_event_type: latestEventByUser[u.id]?.event_type || null,
        last_session_id: latestEventByUser[u.id]?.session_id || null,
        last_event_meta: latestEventByUser[u.id]?.meta || null,
        utm_source: normalizeUtm(latestEventByUser[u.id]?.meta?.utm?.utm_source),
        utm_medium: normalizeUtm(latestEventByUser[u.id]?.meta?.utm?.utm_medium),
        utm_campaign: normalizeUtm(latestEventByUser[u.id]?.meta?.utm?.utm_campaign),
        utm_ref: normalizeUtm(latestEventByUser[u.id]?.meta?.utm?.ref),
        last_source: normalizeUtm(latestEventByUser[u.id]?.meta?.utm?.utm_source) || u.source || "—",
        calc_count: calcCounts[u.id] || 0,
        status: bookingMap[u.id] === "completed" ? "dxa_done"
          : bookingMap[u.id] ? "dxa_booked"
          : "active",
      }));

      setUsers(enriched);

      // Extract unique cities
      const uniqueCities = [...new Set(usersData.map((u) => u.city).filter(Boolean))].sort();
      setCities(uniqueCities);

      const uniqueUtmSources = [...new Set(enriched.map((u) => u.utm_source).filter(Boolean))].sort();
      const uniqueUtmCampaigns = [...new Set(enriched.map((u) => u.utm_campaign).filter(Boolean))].sort();
      setUtmSources(uniqueUtmSources);
      setUtmCampaigns(uniqueUtmCampaigns);
    } catch (err) {
      console.error("Load users error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (u.name || "").toLowerCase().includes(q)
        || (u.email || "").toLowerCase().includes(q)
        || (u.city || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterSource && u.source !== filterSource) return false;
    if (filterUtmSource && u.utm_source !== filterUtmSource) return false;
    if (filterUtmCampaign && u.utm_campaign !== filterUtmCampaign) return false;
    if (filterCity && u.city !== filterCity) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  });

  const exportCsv = useCallback(() => {
    const headers = ["name", "email", "tg_id", "city", "source", "created_at", "last_seen_at", "calc_count", "status"];
    const rows = filtered.map((u) =>
      headers.map((h) => {
        const val = u[h];
        if (val == null) return "";
        if (typeof val === "string" && val.includes(",")) return `"${val}"`;
        return String(val);
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const columns = [
    { key: "name", label: "Имя", maxWidth: 160 },
    { key: "email", label: "Email", maxWidth: 200 },
    { key: "tg_id", label: "TG ID", maxWidth: 100, render: (v) => v ? String(v) : "—" },
    { key: "city", label: "Город", maxWidth: 120 },
    { key: "source", label: "Источник", maxWidth: 100, render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v === "telegram" ? "#a78bfa20" : v === "referral" ? "#f59e0b20" : `${colors.accent}15`,
        color: v === "telegram" ? "#a78bfa" : v === "referral" ? "#f59e0b" : colors.accent,
      }}>
        {v}
      </span>
    )},
    { key: "last_source", label: "Последний источник", maxWidth: 160, render: (v) => v || "—" },
    { key: "utm_campaign", label: "Кампания", maxWidth: 180, render: (v) => v || "—" },
    { key: "created_at", label: "Регистрация", render: (v) => formatDate(v) },
    { key: "last_seen_at", label: "Последний визит", render: (v) => formatDate(v) },
    { key: "calc_count", label: "Расчёты", maxWidth: 80 },
    { key: "status", label: "Статус", render: (v) => {
      const s = STATUS_LABELS[v] || STATUS_LABELS.active;
      return (
        <span style={{
          padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
          background: `${s.color}20`, color: s.color,
        }}>
          {s.label}
        </span>
      );
    }},
  ];

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.body,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            Пользователи
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            {filtered.length} из {users.length} пользователей
          </p>
        </div>
        <button onClick={exportCsv} style={btnSecondary}>
          Экспорт CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: 16, marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Поиск по имени, email, городу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 280, padding: "8px 12px" }}
          onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
          onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
        />
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} style={selectStyle}>
          <option value="">Все источники</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} style={selectStyle}>
          <option value="">Все города</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterUtmSource} onChange={(e) => setFilterUtmSource(e.target.value)} style={selectStyle}>
          <option value="">UTM source: все</option>
          {utmSources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterUtmCampaign} onChange={(e) => setFilterUtmCampaign(e.target.value)} style={selectStyle}>
          <option value="">UTM campaign: все</option>
          {utmCampaigns.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Все статусы</option>
          <option value="active">Активный</option>
          <option value="dxa_booked">Записался на DXA</option>
          <option value="dxa_done">Прошёл DXA</option>
        </select>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
            Загрузка...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
}
