import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, inputStyle } from "../styles";
import DataTable from "../components/DataTable";
import PeriodFilter, { getDateRange } from "../components/PeriodFilter";

const STATUS_OPTIONS = [
  { value: "all", label: "Все статусы" },
  { value: "lead", label: "Lead" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No show" },
  { value: "cancelled", label: "Cancelled" },
];

const SCAN_OPTIONS = [
  { value: "all", label: "Все типы" },
  { value: "primary", label: "Primary" },
  { value: "repeat", label: "Repeat" },
];

const STATUS_COLORS = {
  lead: "#f59e0b",
  confirmed: "#3b82f6",
  completed: "#10b981",
  no_show: "#f97316",
  cancelled: "#ef4444",
};

const SCAN_COLORS = {
  primary: "#3b82f6",
  repeat: "#a78bfa",
};

// Allowed transitions per status
const STATUS_TRANSITIONS = {
  lead: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
};

function Badge({ text, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: fonts.mono,
      color: color,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingsPage() {
  const [period, setPeriod] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scanFilter, setScanFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBookings();
  }, [period]);

  async function loadBookings() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    try {
      const dateFrom = getDateRange(period);
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (dateFrom) query = query.gte("created_at", dateFrom);

      const { data, error } = await query;
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Bookings load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(bookingId, newStatus) {
    if (!supabase) return;

    const updatePayload = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === "confirmed") updatePayload.confirmed_at = new Date().toISOString();
    if (newStatus === "completed") updatePayload.completed_at = new Date().toISOString();

    const { error } = await supabase.from("bookings").update(updatePayload).eq("id", bookingId);
    if (error) {
      console.error("Status update error:", error);
      return;
    }

    // Update local state
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updatePayload } : b))
    );
  }

  // Filter data
  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (scanFilter !== "all" && b.scan_type !== scanFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = (b.name || "").toLowerCase();
      const phone = (b.phone || "").toLowerCase();
      if (!name.includes(s) && !phone.includes(s)) return false;
    }
    return true;
  });

  const selectStyle = {
    ...inputStyle,
    width: "auto",
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    appearance: "auto",
  };

  const columns = [
    {
      key: "created_at",
      label: "Дата",
      render: (val) => (
        <span style={{ fontFamily: fonts.mono, fontSize: 12 }}>{formatDate(val)}</span>
      ),
    },
    { key: "name", label: "Имя" },
    {
      key: "phone",
      label: "Телефон",
      render: (val) => (
        <span style={{ fontFamily: fonts.mono, fontSize: 12 }}>{val || "—"}</span>
      ),
    },
    { key: "clinic", label: "Клиника" },
    {
      key: "scan_type",
      label: "Тип скана",
      render: (val) => val ? <Badge text={val} color={SCAN_COLORS[val] || colors.textDim} /> : "—",
    },
    {
      key: "offer_variant",
      label: "Оффер",
      render: (val) => val && val !== "none" ? (
        <span style={{ fontSize: 12, fontFamily: fonts.mono }}>{val}</span>
      ) : "—",
    },
    {
      key: "coupon_code",
      label: "Купон",
      render: (val) => val ? (
        <span style={{ fontSize: 12, fontFamily: fonts.mono, color: colors.accent }}>{val}</span>
      ) : "—",
    },
    {
      key: "utm_source",
      label: "UTM",
      render: (_, row) => {
        const src = row.utm_source;
        const med = row.utm_medium;
        if (!src && !med) return "—";
        return (
          <span style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.textMuted }}>
            {[src, med].filter(Boolean).join(" / ")}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Статус",
      render: (val) => <Badge text={val || "—"} color={STATUS_COLORS[val] || colors.textDim} />,
    },
    {
      key: "actions",
      label: "Действия",
      sortable: false,
      render: (_, row) => {
        const transitions = STATUS_TRANSITIONS[row.status] || [];
        if (transitions.length === 0) return null;
        return (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handleStatusChange(row.id, e.target.value);
            }}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              background: colors.bg,
              border: `1px solid ${colors.borderLight}`,
              color: colors.textMuted,
              fontSize: 11,
              fontFamily: fonts.mono,
              cursor: "pointer",
            }}
          >
            <option value="">Сменить...</option>
            {transitions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            Заявки
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            Управление записями на DXA-сканирование
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Filters */}
      <div style={{
        ...cardStyle,
        padding: 16,
        marginBottom: 20,
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={scanFilter}
          onChange={(e) => setScanFilter(e.target.value)}
          style={selectStyle}
        >
          {SCAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Поиск по имени / телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 260, padding: "8px 12px", fontSize: 12 }}
        />

        <span style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.mono, marginLeft: "auto" }}>
          {filtered.length} из {bookings.length}
        </span>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12 }}>
            Загрузка...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={30}
            emptyText="Нет заявок за выбранный период"
          />
        )}
      </div>
    </div>
  );
}
