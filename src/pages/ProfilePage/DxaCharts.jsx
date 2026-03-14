import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const CHARTS = [
  { key: "fat", label: "Жир %", color: "#ef4444", field: "total_fat_pct" },
  { key: "lean", label: "Мышечная масса кг", color: "#10b981", field: "lean_mass_kg" },
  { key: "bone", label: "Костная масса кг", color: "#3b82f6", field: "bone_mass_kg" },
  { key: "visceral", label: "Висцеральный жир см²", color: "#f59e0b", field: "visceral_fat_area_cm2" },
];

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  fontSize: 13,
  color: "#e2e8f0",
  fontFamily: "'Outfit', sans-serif",
};

const axisTick = { fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" };

const cellStyle = {
  background: "rgba(15,23,42,0.6)",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: "16px 12px",
};

const cardStyle = {
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  borderRadius: 20,
  padding: 24,
  marginBottom: 16,
  border: "1px solid #334155",
};

const btnPrimary = {
  width: "auto",
  padding: "12px 24px",
  border: "none",
  borderRadius: 14,
  background: "linear-gradient(135deg, #10b981, #34d399)",
  color: "#020617",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'JetBrains Mono', monospace",
  boxShadow: "0 0 30px #10b98133",
};

export default function DxaCharts({ results }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── 0 results
  if (!results || results.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Добавьте первое исследование
          </div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
            Пройдите DXA-скан, чтобы увидеть точные данные о составе тела с погрешностью ±1–2%.
          </p>
          <button onClick={() => navigate("/clinics")} style={btnPrimary}>
            Найти клинику →
          </button>
        </div>
      </div>
    );
  }

  // ── 1 result
  if (results.length === 1) {
    const r = results[0];
    const stats = [
      { label: "Жир %", value: r.total_fat_pct, color: "#ef4444", unit: "%" },
      { label: "Мышечная масса", value: r.lean_mass_kg, color: "#10b981", unit: " кг" },
      { label: "Костная масса", value: r.bone_mass_kg, color: "#3b82f6", unit: " кг" },
      { label: "Висцеральный жир", value: r.visceral_fat_area_cm2, color: "#f59e0b", unit: " см²" },
    ].filter((s) => s.value != null);

    return (
      <div style={cardStyle}>
        <div style={{
          fontSize: 12, color: "#64748b", textTransform: "uppercase",
          letterSpacing: "0.08em", marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Результат DXA — {new Date(r.scan_date).toLocaleDateString("ru-RU", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={cellStyle}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {parseFloat(s.value).toFixed(1)}{s.unit}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: 0 }}>
          Добавьте повторное исследование, чтобы увидеть динамику
        </p>
      </div>
    );
  }

  // ── 2+ results: charts
  const chartData = results.map((r) => ({
    date: new Date(r.scan_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    fat: r.total_fat_pct != null ? parseFloat(Number(r.total_fat_pct).toFixed(1)) : null,
    lean: r.lean_mass_kg != null ? parseFloat(Number(r.lean_mass_kg).toFixed(1)) : null,
    bone: r.bone_mass_kg != null ? parseFloat(Number(r.bone_mass_kg).toFixed(1)) : null,
    visceral: r.visceral_fat_area_cm2 != null ? parseFloat(Number(r.visceral_fat_area_cm2).toFixed(1)) : null,
  }));

  const visibleCharts = CHARTS.filter((c) =>
    chartData.some((d) => d[c.key] != null)
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 16,
      marginBottom: 16,
    }}>
      {visibleCharts.map((chart) => (
        <div key={chart.key} style={cellStyle}>
          <div style={{
            fontSize: 11, color: "#64748b", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {chart.label}
          </div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={axisTick}
                  axisLine={{ stroke: "#1e293b" }}
                  tickLine={false}
                />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#64748b", marginBottom: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={chart.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: chart.color }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
