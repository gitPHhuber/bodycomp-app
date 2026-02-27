import { useState, useEffect } from "react";
import { trackGoal } from "../../utils/analytics";
import * as tracker from "../../lib/tracker";
import Reveal from "../../components/Reveal";
import { useMeta } from "../../utils/useMeta";
import { CLINICS, CITIES } from "./data";
import ClinicCard from "./ClinicCard";
import MapView from "./MapView";
import BookingModal from "./BookingModal";

const FORMSPREE_URL = "https://formspree.io/f/YOUR_FORMSPREE_ID";

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: 6,
  fontFamily: "'JetBrains Mono',monospace",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  background: "#0f172a",
  border: "1.5px solid #334155",
  color: "#e2e8f0",
  fontSize: 14,
  fontFamily: "'Outfit',sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export default function ClinicsPage() {
  useMeta(
    "Запись на DXA-сканирование тела — найти клинику",
    "Запишитесь на точный DXA-анализ состава тела. Stratos dR — золотой стандарт. Процент жира, мышцы, кости за 5 минут."
  );

  // Catalog state
  const [selectedCity, setSelectedCity] = useState("Все города");
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [bookingClinic, setBookingClinic] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", city: "", comment: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => { trackGoal('clinics_page_visit'); }, []);

  const filteredClinics = selectedCity === "Все города"
    ? CLINICS
    : CLINICS.filter(c => c.city === selectedCity);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const canSubmit = form.name.trim() && form.phone.trim() && agreed && status !== "sending";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          city: form.city,
          comment: form.comment,
        }),
      });
      if (res.ok) {
        trackGoal('booking_submit');
        tracker.trackClick("waitlist_submit", { city: form.city });
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const getFocusStyle = (field) =>
    focusedField === field ? { borderColor: "#22d3ee" } : {};

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Hero */}
        <Reveal from="bottom">
          <div style={{ paddingTop: 80, marginBottom: 24 }}>
            <div style={{
              fontSize: 11, color: "#22d3ee",
              fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: "0.1em", marginBottom: 6,
            }}>
              КАТАЛОГ КЛИНИК
            </div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, margin: "0 0 10px",
              background: "linear-gradient(135deg,#e2e8f0,#22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              DXA-сканирование тела
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Выберите клинику и запишитесь онлайн
            </p>
          </div>
        </Reveal>

        {/* City filter */}
        <Reveal from="bottom" delay={50}>
          <div style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 20,
            WebkitOverflowScrolling: "touch",
          }}>
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => {
                  tracker.trackClick("city_filter", { city });
                  setSelectedCity(city);
                  setSelectedClinicId(null);
                }}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: selectedCity === city ? "#22d3ee" : "#0f172a",
                  border: `1.5px solid ${selectedCity === city ? "#22d3ee" : "#1e293b"}`,
                  color: selectedCity === city ? "#020617" : "#94a3b8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Map */}
        <Reveal from="bottom" delay={100}>
          <MapView
            clinics={filteredClinics}
            selectedId={selectedClinicId}
            onSelect={(id) => setSelectedClinicId(id === selectedClinicId ? null : id)}
          />
        </Reveal>

        {/* Clinic cards */}
        {filteredClinics.map(clinic => (
          <Reveal key={clinic.id} from="bottom" delay={100}>
            <ClinicCard
              clinic={clinic}
              isSelected={selectedClinicId === clinic.id}
              onSelect={(id) => setSelectedClinicId(id === selectedClinicId ? null : id)}
              onBook={(c) => {
                trackGoal('clinic_book_click');
                tracker.trackBookingClick(c.id);
                setBookingClinic(c);
              }}
            />
          </Reveal>
        ))}

        {/* Separator */}
        <div style={{
          textAlign: "center",
          padding: "32px 0",
          borderTop: "1px solid #1e293b",
          marginTop: 12,
        }}>
          <div style={{
            fontSize: 11,
            color: "#f59e0b",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}>
            НЕТ ВАШЕГО ГОРОДА?
          </div>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 8px",
            color: "#e2e8f0",
          }}>
            Оставьте заявку
          </h2>
          <p style={{
            fontSize: 14,
            color: "#94a3b8",
            margin: 0,
          }}>
            Мы найдём клинику рядом с вами и свяжемся
          </p>
        </div>

        {/* Form or success */}
        {status === "sent" ? (
          <Reveal from="scale">
            <div style={{
              padding: 32, borderRadius: 18,
              background: "#0f172a", border: "1px solid #1e293b",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
              <h3 style={{
                fontSize: 22, fontWeight: 800, margin: "0 0 10px",
                background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Спасибо!</h3>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                Мы свяжемся с вами в течение 24 часов
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal from="bottom" delay={100}>
            <form onSubmit={handleSubmit} style={{
              padding: 24, borderRadius: 18,
              background: "#0f172a",
              border: "1px solid #1e293b",
            }}>

              {/* Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Имя *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ваше имя"
                  style={{ ...inputStyle, ...getFocusStyle("name") }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Телефон *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={update("phone")}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+7 (___) ___-__-__"
                  style={{ ...inputStyle, ...getFocusStyle("phone") }}
                />
              </div>

              {/* City */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Город</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={update("city")}
                  onFocus={() => setFocusedField("city")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ваш город"
                  style={{ ...inputStyle, ...getFocusStyle("city") }}
                />
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Комментарий</label>
                <textarea
                  value={form.comment}
                  onChange={update("comment")}
                  onFocus={() => setFocusedField("comment")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Удобное время, пожелания..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    ...getFocusStyle("comment"),
                    resize: "vertical",
                    minHeight: 70,
                  }}
                />
              </div>

              {/* Consent */}
              <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{
                    marginTop: 2, width: 18, height: 18, cursor: "pointer",
                    accentColor: "#22d3ee", flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  Согласен на обработку{" "}
                  <a href="/privacy" style={{ color: "#22d3ee", textDecoration: "underline" }}>
                    персональных данных
                  </a>
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  border: "none",
                  borderRadius: 12,
                  background: canSubmit
                    ? "linear-gradient(135deg,#0891b2,#22d3ee)"
                    : "#1e293b",
                  color: canSubmit ? "#020617" : "#475569",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "all 0.3s",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {status === "sending" ? "Отправляем..." : "Отправить заявку"}
              </button>

              {status === "error" && (
                <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
                  Ошибка отправки. Попробуйте ещё раз или напишите в Telegram.
                </p>
              )}
            </form>
          </Reveal>
        )}

        {/* Telegram CTA */}
        <Reveal from="bottom" delay={200}>
          <div style={{
            marginTop: 24, padding: 20, borderRadius: 18, textAlign: "center",
            background: "linear-gradient(135deg,#0891b210,#10b98110)",
            border: "1px solid #22d3ee22",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", marginBottom: 6 }}>
              Или напишите нам в Telegram
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14 }}>
              Ответим на вопросы и поможем записаться
            </div>
            <a
              href="https://t.me/asvomed"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "none",
                borderRadius: 12,
                background: "#1e293b",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              @asvomed →
            </a>
          </div>
        </Reveal>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "24px 0 0", marginTop: 24, borderTop: "1px solid #1e293b" }}>
          <p style={{ fontSize: 10, color: "#334155", lineHeight: 1.6 }}>
            Имеются противопоказания, необходима консультация специалиста.<br />
            Все аппараты — Stratos dR (DMS Imaging, Франция).
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingClinic && (
        <BookingModal
          clinic={bookingClinic}
          onClose={() => setBookingClinic(null)}
          onConfirm={() => {
            trackGoal('booking_confirmed');
            tracker.trackClick("booking_confirmed");
          }}
        />
      )}
    </div>
  );
}
