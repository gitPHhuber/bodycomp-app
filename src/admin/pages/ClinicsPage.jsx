import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, btnPrimary, btnDanger } from "../styles";
import DataTable from "../components/DataTable";
import ClinicFormModal from "../components/ClinicFormModal";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editClinic, setEditClinic] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadClinics(); }, []);

  async function loadClinics() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    try {
      const [{ data: clinicsData }, { data: bookings }] = await Promise.all([
        supabase.from("clinics").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("clinic_id"),
      ]);

      setClinics(clinicsData || []);

      const counts = {};
      (bookings || []).forEach((b) => {
        counts[b.clinic_id] = (counts[b.clinic_id] || 0) + 1;
      });
      setBookingCounts(counts);
    } catch (err) {
      console.error("Load clinics error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    if (!supabase) return;

    if (editClinic) {
      await supabase.from("clinics").update(data).eq("id", editClinic.id);
    } else {
      await supabase.from("clinics").insert(data);
    }

    setShowForm(false);
    setEditClinic(null);
    loadClinics();
  }

  async function handleToggleActive(clinic) {
    if (!supabase) return;
    await supabase.from("clinics").update({ active: !clinic.active }).eq("id", clinic.id);
    loadClinics();
  }

  async function handleDelete(clinic) {
    if (!supabase) return;
    if (!window.confirm(`Удалить клинику "${clinic.name}"?`)) return;
    await supabase.from("clinics").delete().eq("id", clinic.id);
    loadClinics();
  }

  const columns = [
    { key: "name", label: "Название", maxWidth: 200 },
    { key: "city", label: "Город", maxWidth: 120 },
    { key: "active", label: "Статус", render: (v, row) => (
      <button
        onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
        style={{
          padding: "2px 10px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
          border: "none", cursor: "pointer",
          background: v ? "#10b98120" : "#ef444420",
          color: v ? "#10b981" : "#ef4444",
        }}
      >
        {v ? "Активна" : "Выкл"}
      </button>
    )},
    { key: "partner_tier", label: "Тир", render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v === "vip" ? "#f59e0b20" : v === "premium" ? "#a78bfa20" : `${colors.accent}15`,
        color: v === "vip" ? "#f59e0b" : v === "premium" ? "#a78bfa" : colors.accent,
      }}>
        {v}
      </span>
    )},
    { key: "price_from", label: "Цена", render: (v, row) => (
      <span style={{ fontFamily: fonts.mono, fontSize: 12 }}>
        {v?.toLocaleString()}{row.price_to ? ` — ${row.price_to.toLocaleString()}` : ""} ₽
      </span>
    )},
    { key: "id", label: "Записей", sortable: false, render: (v) => (
      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>
        {bookingCounts[v] || 0}
      </span>
    )},
    { key: "working_hours", label: "Часы работы", maxWidth: 160 },
    { key: "_actions", label: "", sortable: false, render: (_, row) => (
      <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { setEditClinic(row); setShowForm(true); }}
          style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11,
            border: `1px solid ${colors.border}`, background: "transparent",
            color: colors.textMuted, cursor: "pointer", fontFamily: fonts.mono,
          }}
        >
          Ред.
        </button>
        <button
          onClick={() => handleDelete(row)}
          style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11,
            border: "1px solid #991b1b", background: "transparent",
            color: "#fca5a5", cursor: "pointer", fontFamily: fonts.mono,
          }}
        >
          Уд.
        </button>
      </div>
    )},
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            Клиники
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            {clinics.length} клиник-партнёров
          </p>
        </div>
        <button
          onClick={() => { setEditClinic(null); setShowForm(true); }}
          style={btnPrimary}
        >
          + Добавить клинику
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ ...cardStyle, padding: 16, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>ВСЕГО</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.accent, fontFamily: fonts.mono }}>{clinics.length}</div>
        </div>
        <div style={{ ...cardStyle, padding: 16, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>АКТИВНЫХ</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", fontFamily: fonts.mono }}>
            {clinics.filter((c) => c.active).length}
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>ЗАПИСЕЙ</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", fontFamily: fonts.mono }}>
            {Object.values(bookingCounts).reduce((s, c) => s + c, 0)}
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>ГОРОДОВ</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa", fontFamily: fonts.mono }}>
            {new Set(clinics.map((c) => c.city)).size}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
            Загрузка...
          </div>
        ) : (
          <DataTable columns={columns} data={clinics} />
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <ClinicFormModal
          clinic={editClinic}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditClinic(null); }}
        />
      )}
    </div>
  );
}
