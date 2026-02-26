import { useState } from "react";
import Reveal from "../../components/Reveal";
import { CLINICS, CITIES } from "./data";
import MapView from "./MapView";
import ClinicCard from "./ClinicCard";
import BookingModal from "./BookingModal";

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
          <div style={{ paddingTop: 96, marginBottom: 24 }}>
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
