import Stars from "./Stars";

export default function ClinicCard({ clinic, isSelected, onSelect, onBook }) {
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
