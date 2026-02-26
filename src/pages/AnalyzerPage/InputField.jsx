export default function InputField({ label, value, onChange, unit, placeholder, min, max, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          style={{
            width: "100%", boxSizing: "border-box", padding: "14px 50px 14px 16px",
            background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12,
            color: "#fff", fontSize: 18, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#22d3ee"}
          onBlur={e => e.target.style.borderColor = "#334155"}
        />
        <span style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: "#64748b", fontFamily: "'JetBrains Mono', monospace",
        }}>{unit}</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
