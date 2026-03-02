import { useState, useEffect } from "react";
import { colors, fonts, inputStyle, labelStyle, btnPrimary, btnSecondary } from "../styles";

const TIERS = ["standard", "premium", "vip"];

export default function ClinicFormModal({ clinic, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", city: "", address: "", lat: "", lng: "",
    phone: "", price_from: "", price_to: "", working_hours: "",
    partner_tier: "standard", active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name || "",
        city: clinic.city || "",
        address: clinic.address || "",
        lat: clinic.lat?.toString() || "",
        lng: clinic.lng?.toString() || "",
        phone: clinic.phone || "",
        price_from: clinic.price_from?.toString() || "",
        price_to: clinic.price_to?.toString() || "",
        working_hours: clinic.working_hours || "",
        partner_tier: clinic.partner_tier || "standard",
        active: clinic.active !== false,
      });
    }
  }, [clinic]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name: form.name,
      city: form.city,
      address: form.address,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      phone: form.phone || null,
      price_from: parseInt(form.price_from) || 0,
      price_to: form.price_to ? parseInt(form.price_to) : null,
      working_hours: form.working_hours || null,
      partner_tier: form.partner_tier,
      active: form.active,
    });
    setSaving(false);
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
        onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
      />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
      />
      <div style={{
        position: "relative",
        width: 560,
        maxHeight: "90vh",
        overflow: "auto",
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: 32,
      }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: colors.text,
          fontFamily: fonts.body, margin: "0 0 24px",
        }}>
          {clinic ? "Редактировать клинику" : "Добавить клинику"}
        </h2>

        <form onSubmit={handleSubmit}>
          {field("Название *", "name", "text", "Клиника DXA")}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Город *", "city", "text", "Москва")}
            {field("Телефон", "phone", "tel", "+7 (999) 123-45-67")}
          </div>

          {field("Адрес *", "address", "text", "ул. Примерная, 1")}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {field("Широта", "lat", "number", "55.7558")}
            {field("Долгота", "lng", "number", "37.6173")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {field("Цена от *", "price_from", "number", "3000")}
            {field("Цена до", "price_to", "number", "5000")}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Тир партнёра</label>
              <select
                value={form.partner_tier}
                onChange={update("partner_tier")}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {field("Часы работы", "working_hours", "text", "Пн-Пт 9:00-18:00")}

          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: colors.accent, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Активна (видна пользователям)</span>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Отмена</button>
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.city.trim() || !form.address.trim()}
              style={{
                ...btnPrimary,
                opacity: saving ? 0.5 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Сохраняем..." : (clinic ? "Обновить" : "Создать")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
