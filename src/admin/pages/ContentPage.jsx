import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, btnPrimary } from "../styles";
import DataTable from "../components/DataTable";

const TYPES = ["lesson", "quiz", "article"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export default function ContentPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from("content")
      .select("*")
      .order("sort_order", { ascending: true });

    setItems(data || []);
    setLoading(false);
  }

  async function handleReorder(id, direction) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= items.length) return;

    const newItems = [...items];
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];

    // Update sort_order for both
    const updates = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    for (const u of updates) {
      await supabase.from("content").update({ sort_order: u.sort_order }).eq("id", u.id);
    }

    setItems(newItems.map((item, i) => ({ ...item, sort_order: i })));
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Удалить "${title}"?`)) return;
    await supabase.from("content").delete().eq("id", id);
    loadContent();
  }

  const filtered = items.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterStatus === "published" && !i.active) return false;
    if (filterStatus === "draft" && i.active) return false;
    return true;
  });

  const typeLabel = (t) => {
    switch (t) {
      case "lesson": return "Урок";
      case "quiz": return "Квиз";
      case "article": return "Статья";
      default: return t;
    }
  };

  const columns = [
    { key: "sort_order", label: "#", maxWidth: 60, render: (v, row) => (
      <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleReorder(row.id, -1)}
          style={reorderBtn}
          title="Вверх"
        >
          ↑
        </button>
        <button
          onClick={() => handleReorder(row.id, 1)}
          style={reorderBtn}
          title="Вниз"
        >
          ↓
        </button>
      </div>
    )},
    { key: "type", label: "Тип", maxWidth: 100, render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v === "quiz" ? "#a78bfa20" : v === "article" ? "#f59e0b20" : `${colors.accent}15`,
        color: v === "quiz" ? "#a78bfa" : v === "article" ? "#f59e0b" : colors.accent,
      }}>
        {typeLabel(v)}
      </span>
    )},
    { key: "title", label: "Заголовок" },
    { key: "slug", label: "Slug", maxWidth: 160, render: (v) => (
      <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim }}>{v}</span>
    )},
    { key: "active", label: "Статус", render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v ? "#10b98120" : "#64748b20",
        color: v ? "#10b981" : "#64748b",
      }}>
        {v ? "Опубликован" : "Черновик"}
      </span>
    )},
    { key: "updated_at", label: "Обновлён", render: (v) => formatDate(v) },
    { key: "_actions", label: "", sortable: false, render: (_, row) => (
      <button
        onClick={(e) => { e.stopPropagation(); handleDelete(row.id, row.title); }}
        style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11,
          border: "1px solid #991b1b", background: "transparent",
          color: "#fca5a5", cursor: "pointer", fontFamily: fonts.mono,
        }}
      >
        Уд.
      </button>
    )},
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
            Контент
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            {items.length} материалов
          </p>
        </div>
        <button onClick={() => navigate("/admin/content/new")} style={btnPrimary}>
          + Создать
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: 16, marginBottom: 20, display: "flex", gap: 12 }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">Все типы</option>
          {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Все статусы</option>
          <option value="published">Опубликован</option>
          <option value="draft">Черновик</option>
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
            onRowClick={(row) => navigate(`/admin/content/${row.id}`)}
          />
        )}
      </div>
    </div>
  );
}

const reorderBtn = {
  width: 24, height: 24, borderRadius: 4,
  border: `1px solid ${colors.border}`,
  background: "transparent",
  color: colors.textMuted,
  fontSize: 11,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: fonts.mono,
};
