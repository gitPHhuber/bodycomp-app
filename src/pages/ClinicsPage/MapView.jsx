import { useState } from "react";

export default function MapView({ clinics, selectedId, onSelect }) {
  const [loaded, setLoaded] = useState(false);

  const activeClinics = clinics.filter(c => c.isActive !== false && c.lat && c.lng);
  const center = activeClinics.length > 0
    ? { lat: activeClinics[0].lat, lng: activeClinics[0].lng }
    : { lat: 51.7645, lng: 55.1014 };

  const zoom = activeClinics.length === 1 ? 15 : 5;

  // Yandex Maps widget: pt= маркер (pm2gnm = зелёный), ll= центр
  const pts = activeClinics.map(c => `${c.lng},${c.lat},pm2gnm`).join("~");
  const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${center.lng},${center.lat}&z=${zoom}&pt=${pts}`;

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 16, border: "1px solid #334155" }}>
      <iframe
        src={mapSrc}
        style={{ width: "100%", height: 280, border: "none" }}
        onLoad={() => setLoaded(true)}
        title="Карта клиники"
        allowFullScreen
      />

      {!loaded && (
        <div style={{ position: "absolute", inset: 0, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, color: "#475569" }}>Загрузка карты...</div>
        </div>
      )}
    </div>
  );
}
