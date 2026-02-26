import { useState } from "react";

export default function MapView({ clinics, selectedId, onSelect }) {
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
