import { useState, useEffect, useRef } from "react";

import { trackGoal } from "../../utils/analytics";
import { supabase } from "../../lib/supabase";


import * as tracker from "../../lib/tracker";
const { trackGoal } = tracker;
import Reveal from "../../components/Reveal";
import { useMeta } from "../../utils/useMeta";
import { CLINICS, CITIES } from "./data";
import ClinicCard from "./ClinicCard";
import MapView from "./MapView";
import BookingModal from "./BookingModal";

const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_URL;

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

// ── Waitlist Modal ──────────────────────────────────────────
function WaitlistModal({ city, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!name || !email || submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      email,
      city,
      session_id: tracker.getSessionId(),
      source_page: window.location.pathname,
    };

    try {
      let submitted = false;

      if (supabase) {
        const { error: dbErr } = await supabase.from("waitlist").insert(payload);
        if (dbErr) throw dbErr;
        submitted = true;
      }

      if (!submitted && FORMSPREE_URL) {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Formspree error");
        submitted = true;
      }

      if (!submitted) throw new Error("No backend");

      tracker.trackClick("waitlist_interest", { city });
      setDone(true);
    } catch {
      setError("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "#000a", backdropFilter: "blur(8px)" }} />
      <div
        style={{
          position: "relative", width: "100%", maxWidth: 420,
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          borderRadius: 24, padding: "28px 24px 32px",
          animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#1e293b", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>✕</button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#e2e8f0" }}>Спасибо!</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Мы сообщим, когда запустимся в {city}</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>
              СКОРО В {city.toUpperCase()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: "#e2e8f0" }}>
              Узнать о запуске
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.5 }}>
              Оставьте контакт — мы напишем, когда откроется запись на DXA в {city}
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#f59e0b"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#f59e0b"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name || !email || submitting}
              style={{
                width: "100%", padding: 14, border: "none", borderRadius: 12,
                background: name && email && !submitting ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "#1e293b",
                color: name && email && !submitting ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: name && email && !submitting ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace",
                transition: "all 0.3s",
              }}
            >{submitting ? "Отправляем..." : "Сообщить мне"}</button>

            {error && (
              <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", marginTop: 10, marginBottom: 0 }}>{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function ClinicsPage() {
  useMeta(
    "Запись на DXA-сканирование тела — найти клинику",
    "Запишитесь на точный DXA-анализ состава тела. Stratos dR — золотой стандарт. Процент жира, мышцы, кости за 5 минут."
  );

  // Catalog state
  const [selectedCity, setSelectedCity] = useState("Все города");
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [bookingClinic, setBookingClinic] = useState(null);
  const [waitlistCity, setWaitlistCity] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", city: "", comment: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [focusedField, setFocusedField] = useState(null);

  const formRef = useRef({ name: "", phone: "", status: "idle" });
  useEffect(() => {
    formRef.current = { name: form.name, phone: form.phone, status };
  }, [form.name, form.phone, status]);

  useEffect(() => { trackGoal('clinics_page_visit'); }, []);

  useEffect(() => {
    return () => {
      const { name, phone, status: s } = formRef.current;
      if (s !== "sent") {
        const filled = [];
        if (name) filled.push("name");
        if (phone) filled.push("phone");
        if (filled.length > 0) {
          tracker.trackFormAbandon("/clinics", filled);
        }
      }
    };
  }, []);

  const filteredClinics = selectedCity === "Все города"
    ? CLINICS
    : CLINICS.filter(c => c.city === selectedCity);

  // Only real clinics (with coordinates) for the map
  const mapClinics = filteredClinics.filter(c => !c.comingSoon);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const canSubmit = form.name.trim() && form.phone.trim() && agreed && status !== "sending";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        comment: form.comment,
      };

      let submitted = false;

      if (supabase) {
        const { error } = await supabase.from("waitlist").insert({
          ...payload,
          session_id: tracker.getSessionId(),
          source_page: window.location.pathname,
        });
        if (error) throw error;
        submitted = true;
      }

      if (!submitted && FORMSPREE_URL) {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Formspree error");
        submitted = true;
      }

      if (!submitted) throw new Error("No backend");

      trackGoal('booking_submit');
      tracker.trackClick("waitlist_submit", { city: form.city });
      setStatus("sent");
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

        {/* Map — only real clinics */}
        {mapClinics.length > 0 && (
          <Reveal from="bottom" delay={100}>
            <MapView
              clinics={mapClinics}
              selectedId={selectedClinicId}
              onSelect={(id) => setSelectedClinicId(id === selectedClinicId ? null : id)}
            />
          </Reveal>
        )}

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
              onWaitlist={(c) => {
                tracker.trackClick("waitlist_card_click", { city: c.city });
                setWaitlistCity(c.city);
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
                  onFocus={() => { setFocusedField("name"); tracker.trackFormFocus("/clinics", "name"); }}
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
                  onFocus={() => { setFocusedField("phone"); tracker.trackFormFocus("/clinics", "phone"); }}
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

        <Reveal from="bottom" delay={220}>
          <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Что это</h3>
            <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Каталог клиник для записи на DXA-исследование состава тела и минеральной плотности костей.</p>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Здесь можно выбрать город, клинику и оставить заявку на удобное время.</p>
          </div>
        </Reveal>

        <Reveal from="bottom" delay={230}>
          <div style={{ marginTop: 12, padding: 18, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Кому подходит / не подходит</h3>
            <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Подходит пациентам, которым нужна инструментальная оценка состава тела и/или костной плотности.</p>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Не подходит для экстренных состояний и не заменяет очный осмотр врача.</p>
          </div>
        </Reveal>

        <Reveal from="bottom" delay={240}>
          <div style={{ marginTop: 12, padding: 18, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Точность и ограничения</h3>
            <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Точность зависит от качества оборудования, калибровки и соблюдения протокола исследования в клинике.</p>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>Результаты должны интерпретироваться специалистом с учётом клинической картины и анамнеза.</p>
          </div>
        </Reveal>

        <Reveal from="bottom" delay={250}>
          <div style={{ marginTop: 12, padding: 18, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Источники</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>
              <li><a href="https://iscd.org/learn/official-positions/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>ISCD Official Positions</a></li>
              <li><a href="https://www.bones.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>NIH Osteoporosis Resource</a></li>
            </ul>
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
          onConfirm={(result) => {
            trackGoal('booking_confirmed');
            tracker.trackBookingConfirmed(result?.bookingId);
          }}
        />
      )}

      {/* Waitlist Modal */}
      {waitlistCity && (
        <WaitlistModal
          city={waitlistCity}
          onClose={() => setWaitlistCity(null)}
        />
      )}
    </div>
  );
}
