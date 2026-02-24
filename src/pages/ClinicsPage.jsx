import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════
   MOCK CLINIC DATA (replace with real API later)
   ═══════════════════════════════════════════════ */
const CLINICS = [
  { id: 1, name: "Санаторий «Сириус»", city: "Сочи", address: "ул. Морская, 12", lat: 43.4025, lng: 39.9549, phone: "+7 (862) 123-45-67", rating: 4.8, reviews: 124, services: ["Body Composition", "Денситометрия", "3D-DXA"], device: "Stratos dR 3.0 «Про»", price: 5500, priceOld: 8000, hours: "Пн-Сб 8:00-20:00", img: "🏥", partner: true, slots: ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"] },
  { id: 2, name: "Клиника «МедЛайн»", city: "Москва", address: "ул. Тверская, 24, стр. 2", lat: 55.7649, lng: 37.6043, phone: "+7 (495) 987-65-43", rating: 4.6, reviews: 89, services: ["Body Composition", "Денситометрия"], device: "Stratos dR 2.5 «Оптимум»", price: 7500, priceOld: 12000, hours: "Пн-Пт 9:00-21:00", img: "🏢", partner: true, slots: ["09:30","10:30","11:30","14:00","15:00","16:30"] },
  { id: 3, name: "Центр здоровья «Вита»", city: "Санкт-Петербург", address: "Невский пр., 100", lat: 59.9311, lng: 30.3609, phone: "+7 (812) 555-44-33", rating: 4.7, reviews: 67, services: ["Body Composition", "Денситометрия", "Саркопения"], device: "Stratos dR 2.5 «Оптимум»", price: 6800, priceOld: 10000, hours: "Пн-Сб 8:00-19:00", img: "🏥", partner: true, slots: ["08:00","09:00","10:00","11:00","13:00","14:00"] },
  { id: 4, name: "Фитнес-клиника «Олимп»", city: "Екатеринбург", address: "ул. Ленина, 50", lat: 56.8389, lng: 60.5977, phone: "+7 (343) 222-11-00", rating: 4.5, reviews: 45, services: ["Body Composition", "Денситометрия"], device: "Stratos dR 2.4 «Стандарт»", price: 5000, priceOld: 7500, hours: "Пн-Пт 9:00-20:00", img: "💪", partner: true, slots: ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"] },
  { id: 5, name: "Диагностический центр «Нова»", city: "Новосибирск", address: "Красный пр., 75", lat: 55.0303, lng: 82.9206, phone: "+7 (383) 333-22-11", rating: 4.4, reviews: 38, services: ["Денситометрия", "Body Composition"], device: "Stratos dR 2.4 «Стандарт»", price: 4500, priceOld: 7000, hours: "Пн-Сб 8:00-18:00", img: "🔬", partner: true, slots: ["08:30","09:30","10:30","11:30","13:00","14:00","15:00"] },
  { id: 6, name: "Санаторий «Кедр»", city: "Краснодар", address: "ул. Красная, 180", lat: 45.0355, lng: 38.9753, phone: "+7 (861) 444-33-22", rating: 4.9, reviews: 156, services: ["Body Composition", "Денситометрия", "3D-DXA", "Саркопения"], device: "Stratos dR 3.0 «Про»", price: 5000, priceOld: 8500, hours: "Ежедневно 7:00-21:00", img: "🌿", partner: true, slots: ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"] },
];

const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Сочи", "Екатеринбург", "Новосибирск", "Краснодар"];

/* ═══════════════════════════════════════════════
   REVEAL ANIMATION
   ═══════════════════════════════════════════════ */
function Reveal({ children, from = "bottom", delay = 0 }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.disconnect(); } }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  const map = { bottom: "translateY(50px)", left: "translateX(-60px)", right: "translateX(60px)", scale: "scale(0.9)" };
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : map[from], transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>{children}</div>;
}

/* ═══════════════════════════════════════════════
   MAP COMPONENT (OpenStreetMap)
   ═══════════════════════════════════════════════ */
function MapView({ clinics, selectedId, onSelect }) {
  const [loaded, setLoaded] = useState(false);

  // Calculate center from clinics
  const center = clinics.length > 0
    ? { lat: clinics.reduce((s, c) => s + c.lat, 0) / clinics.length, lng: clinics.reduce((s, c) => s + c.lng, 0) / clinics.length }
    : { lat: 55.75, lng: 37.62 };

  const zoom = clinics.length === 1 ? 13 : clinics.length <= 3 ? 6 : 4;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - (zoom > 10 ? 0.05 : 40)},${center.lat - (zoom > 10 ? 0.03 : 15)},${center.lng + (zoom > 10 ? 0.05 : 40)},${center.lat + (zoom > 10 ? 0.03 : 15)}&layer=mapnik`;

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 16, border: "1px solid #334155" }}>
      <iframe
        src={mapUrl}
        style={{ width: "100%", height: 240, border: "none", filter: "saturate(0.3) brightness(0.4) hue-rotate(180deg)" }}
        onLoad={() => setLoaded(true)}
        title="map"
      />

      {/* Custom markers overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {clinics.map((c, i) => {
          // Simple position mapping (approximate)
          const xPct = 20 + (i / Math.max(clinics.length - 1, 1)) * 60;
          const yPct = 25 + (i % 3) * 20;
          const isSelected = selectedId === c.id;
          return (
            <div key={c.id} style={{
              position: "absolute",
              left: `${xPct}%`, top: `${yPct}%`,
              transform: "translate(-50%,-100%)",
              pointerEvents: "auto", cursor: "pointer",
              transition: "all 0.3s",
              zIndex: isSelected ? 10 : 1,
            }} onClick={() => onSelect(c.id)}>
              <div style={{
                background: isSelected ? "#22d3ee" : "#10b981",
                color: "#020617",
                padding: "4px 8px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono',monospace",
                whiteSpace: "nowrap",
                boxShadow: isSelected ? "0 0 20px #22d3ee66" : "0 2px 8px #0008",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
                transition: "all 0.3s",
              }}>
                ₽{c.price.toLocaleString()}
              </div>
              <div style={{
                width: 0, height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${isSelected ? "#22d3ee" : "#10b981"}`,
                margin: "0 auto",
              }} />
            </div>
          );
        })}
      </div>

      {!loaded && (
        <div style={{ position: "absolute", inset: 0, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, color: "#475569", fontFamily: "mono" }}>Загрузка карты...</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STAR RATING
   ═══════════════════════════════════════════════ */
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   CLINIC CARD
   ═══════════════════════════════════════════════ */
function ClinicCard({ clinic, isSelected, onSelect, onBook }) {
  const c = clinic;
  const discount = Math.round((1 - c.price / c.priceOld) * 100);

  return (
    <div
      onClick={() => onSelect(c.id)}
      style={{
        background: isSelected
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #0f172a 0%, #151f30 100%)",
        borderRadius: 18, padding: isSelected ? 20 : 16,
        border: `1.5px solid ${isSelected ? "#22d3ee55" : "#1e293b"}`,
        boxShadow: isSelected ? "0 0 30px #22d3ee12" : "none",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "#020617", border: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, flexShrink: 0,
        }}>{c.img}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{c.address}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Stars rating={c.rating} />
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{c.rating}</span>
            <span style={{ fontSize: 11, color: "#475569" }}>({c.reviews})</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#020617" }}>
        <div>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace" }}>₽{c.price.toLocaleString()}</span>
          <span style={{ fontSize: 14, color: "#475569", textDecoration: "line-through", marginLeft: 8, fontFamily: "'JetBrains Mono',monospace" }}>₽{c.priceOld.toLocaleString()}</span>
        </div>
        <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 8, background: "#10b98122", color: "#10b981", fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
          −{discount}%
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {c.services.map((s, i) => (
          <span key={i} style={{
            padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: s === "3D-DXA" ? "#8b5cf622" : s === "Саркопения" ? "#f59e0b22" : "#22d3ee15",
            color: s === "3D-DXA" ? "#a78bfa" : s === "Саркопения" ? "#fbbf24" : "#67e8f9",
          }}>{s}</span>
        ))}
      </div>

      {/* Expanded info */}
      {isSelected && (
        <div style={{ animation: "fadeSlide 0.5s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{ padding: "8px 12px", borderRadius: 10, background: "#020617" }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "mono" }}>Аппарат</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, marginTop: 2 }}>{c.device}</div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 10, background: "#020617" }}>
              <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "mono" }}>Часы работы</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, marginTop: 2 }}>{c.hours}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onBook(c); }}
              style={{
                flex: 1, padding: "14px", border: "none", borderRadius: 12,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: "0 0 20px #22d3ee22",
                transition: "transform 0.2s",
              }}
              onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={e => e.target.style.transform = "none"}
            >
              Записаться →
            </button>
            <a
              href={`tel:${c.phone.replace(/\D/g, "")}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 48, borderRadius: 12, background: "#1e293b",
                border: "1px solid #334155", textDecoration: "none", fontSize: 20,
              }}
            >📞</a>
          </div>
        </div>
      )}

      {/* Partner badge */}
      {c.partner && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10b981" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          Официальный партнёр · Stratos dR (Франция)
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BOOKING MODAL
   ═══════════════════════════════════════════════ */
function BookingModal({ clinic, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1=date, 2=time, 3=info, 4=done
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d;
  });

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

  const formatDate = (d) => `${d.getDate()} ${monthNames[d.getMonth()]}`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "#000a", backdropFilter: "blur(8px)" }} />
      <div
        style={{
          position: "relative", width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflow: "auto",
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
          animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#334155", margin: "0 auto 20px" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{clinic.img}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{clinic.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{clinic.city} · {clinic.device}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "#1e293b", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "#22d3ee" : "#1e293b", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Step 1: Date */}
        {step === 1 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Выберите дату</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20, WebkitOverflowScrolling: "touch" }}>
              {dates.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const isSel = selectedDate && d.toDateString() === selectedDate.toDateString();
                return (
                  <button key={i} onClick={() => setSelectedDate(d)} style={{
                    flexShrink: 0, width: 64, padding: "10px 6px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                    background: isSel ? "#22d3ee" : "#0f172a",
                    border: `1.5px solid ${isSel ? "#22d3ee" : "#1e293b"}`,
                    color: isSel ? "#020617" : isWeekend ? "#ef4444" : "#e2e8f0",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{dayNames[d.getDay()]}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0" }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10 }}>{monthNames[d.getMonth()]}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => selectedDate && setStep(2)}
              disabled={!selectedDate}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedDate ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedDate ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedDate ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >Далее →</button>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(1)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>←</button>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Выберите время</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{formatDate(selectedDate)}, {dayNames[selectedDate.getDay()]}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {clinic.slots.map((t, i) => {
                const isSel = selectedTime === t;
                return (
                  <button key={i} onClick={() => setSelectedTime(t)} style={{
                    padding: "14px 8px", borderRadius: 12, textAlign: "center", cursor: "pointer",
                    background: isSel ? "#22d3ee" : "#0f172a",
                    border: `1.5px solid ${isSel ? "#22d3ee" : "#1e293b"}`,
                    color: isSel ? "#020617" : "#e2e8f0",
                    fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                    transition: "all 0.2s",
                  }}>{t}</button>
                );
              })}
            </div>
            <button
              onClick={() => selectedTime && setStep(3)}
              disabled={!selectedTime}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedTime ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedTime ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedTime ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >Далее →</button>
          </div>
        )}

        {/* Step 3: Contact info */}
        {step === 3 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(2)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Ваши данные</div>
            </div>

            {/* Summary */}
            <div style={{ padding: 14, borderRadius: 14, background: "#020617", border: "1px solid #1e293b", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Клиника</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{clinic.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Дата</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{formatDate(selectedDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Время</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Стоимость</span>
                <div>
                  <span style={{ fontSize: 15, color: "#22d3ee", fontWeight: 700, fontFamily: "mono" }}>₽{clinic.price.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: "#475569", textDecoration: "line-through", marginLeft: 6 }}>₽{clinic.priceOld.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>Телефон</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" type="tel"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>

            <button
              onClick={() => { if (name && phone) { setStep(4); if (onConfirm) onConfirm({ clinic, date: selectedDate, time: selectedTime, name, phone }); } }}
              disabled={!name || !phone}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: name && phone ? "linear-gradient(135deg,#10b981,#34d399)" : "#1e293b",
                color: name && phone ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: name && phone ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: name && phone ? "0 0 30px #10b98122" : "none",
                transition: "all 0.3s",
              }}
            >Подтвердить запись ✓</button>

            <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 10 }}>
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeSlide 0.5s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "bounceIn 0.6s ease" }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg,#e2e8f0,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Запись подтверждена!
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
              {formatDate(selectedDate)} в {selectedTime}<br />
              {clinic.name}, {clinic.city}<br />
              {clinic.address}
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: "#10b98112", border: "1px solid #10b98133", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>📋 Подготовка к DXA:</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.8 }}>
                • Наденьте удобную одежду без металла<br />
                • Не принимайте кальций за 24 часа<br />
                • Возьмите паспорт<br />
                • Процедура занимает ~5 минут
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, border: "none", borderRadius: 12,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "mono",
              }}>Готово</button>
              <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 48, borderRadius: 12, background: "#1e293b",
                border: "1px solid #334155", textDecoration: "none", fontSize: 18,
              }}>📞</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function ClinicsPage() {
  const [city, setCity] = useState("Все города");
  const [service, setService] = useState("all");
  const [sort, setSort] = useState("price");
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [bookingClinic, setBookingClinic] = useState(null);
  const [geoStatus, setGeoStatus] = useState(null); // null | 'loading' | 'granted' | 'denied'

  const filtered = CLINICS
    .filter(c => city === "Все города" || c.city === city)
    .filter(c => service === "all" || c.services.includes(service))
    .sort((a, b) => sort === "price" ? a.price - b.price : sort === "rating" ? b.rating - a.rating : 0);

  const requestGeo = () => {
    setGeoStatus("loading");
    navigator.geolocation?.getCurrentPosition(
      () => setGeoStatus("granted"),
      () => setGeoStatus("denied"),
      { timeout: 5000 }
    );
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Header */}
        <Reveal from="bottom">
          <div style={{ paddingTop: 40, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>ЗАПИСЬ НА DXA</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#e2e8f0,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Ближайшие денситометры
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              {filtered.length} клиник{filtered.length > 1 && filtered.length < 5 ? "и" : ""} с аппаратами Stratos dR
            </p>
          </div>
        </Reveal>

        {/* Geo button */}
        <Reveal from="right" delay={100}>
          <button onClick={requestGeo} style={{
            width: "100%", padding: "12px 16px", marginBottom: 16, borderRadius: 14,
            background: geoStatus === "granted" ? "#10b98118" : "#0f172a",
            border: `1.5px solid ${geoStatus === "granted" ? "#10b98155" : "#1e293b"}`,
            color: geoStatus === "granted" ? "#10b981" : "#94a3b8",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.3s",
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
          }}>
            {geoStatus === "loading" ? "⏳ Определяем..." : geoStatus === "granted" ? "📍 Геолокация включена" : "📍 Определить моё местоположение"}
          </button>
        </Reveal>

        {/* Filters */}
        <Reveal from="left" delay={150}>
          <div style={{ marginBottom: 16 }}>
            {/* City */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 10, WebkitOverflowScrolling: "touch" }}>
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)} style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 10,
                  background: city === c ? "#22d3ee" : "#0f172a",
                  border: `1px solid ${city === c ? "#22d3ee" : "#1e293b"}`,
                  color: city === c ? "#020617" : "#94a3b8",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}>{c}</button>
              ))}
            </div>

            {/* Service & Sort */}
            <div style={{ display: "flex", gap: 8 }}>
              <select value={service} onChange={e => setService(e.target.value)} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, background: "#0f172a", border: "1px solid #1e293b",
                color: "#94a3b8", fontSize: 12, cursor: "pointer", outline: "none",
              }}>
                <option value="all">Все услуги</option>
                <option value="Body Composition">Body Composition</option>
                <option value="Денситометрия">Денситометрия</option>
                <option value="3D-DXA">3D-DXA</option>
                <option value="Саркопения">Саркопения</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{
                width: "auto", padding: "10px 12px", borderRadius: 10, background: "#0f172a", border: "1px solid #1e293b",
                color: "#94a3b8", fontSize: 12, cursor: "pointer", outline: "none",
              }}>
                <option value="price">По цене ↑</option>
                <option value="rating">По рейтингу ↓</option>
              </select>
            </div>
          </div>
        </Reveal>

        {/* Map */}
        <Reveal from="scale" delay={200}>
          <MapView clinics={filtered} selectedId={selectedClinic} onSelect={setSelectedClinic} />
        </Reveal>

        {/* Clinic list */}
        {filtered.map((c, i) => (
          <Reveal key={c.id} from={i % 2 === 0 ? "left" : "right"} delay={i * 80}>
            <ClinicCard
              clinic={c}
              isSelected={selectedClinic === c.id}
              onSelect={setSelectedClinic}
              onBook={setBookingClinic}
            />
          </Reveal>
        ))}

        {filtered.length === 0 && (
          <Reveal from="bottom">
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Клиник не найдено</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Попробуйте другой город или услугу</div>
            </div>
          </Reveal>
        )}

        {/* Bottom CTA */}
        <Reveal from="bottom" delay={200}>
          <div style={{
            marginTop: 24, padding: 20, borderRadius: 18, textAlign: "center",
            background: "linear-gradient(135deg,#0891b210,#10b98110)",
            border: "1px solid #22d3ee22",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", marginBottom: 6 }}>
              Не нашли свой город?
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
              Мы расширяем сеть. Оставьте заявку — сообщим, когда появится клиника рядом.
            </div>
            <button style={{
              padding: "12px 24px", border: "none", borderRadius: 12,
              background: "#1e293b", color: "#94a3b8", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseOver={e => { e.target.style.background = "#334155"; e.target.style.color = "#e2e8f0"; }}
              onMouseOut={e => { e.target.style.background = "#1e293b"; e.target.style.color = "#94a3b8"; }}
            >Сообщить мне →</button>
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
          onConfirm={(data) => console.log("Booking:", data)}
        />
      )}
    </div>
  );
}
