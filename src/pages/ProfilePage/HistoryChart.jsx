import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function HistoryChart({ data }) {
  if (!data || data.length < 2) return null;

  const chartData = data
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      fat: parseFloat(r.fat_pct?.toFixed(1)),
      bmi: parseFloat(r.bmi?.toFixed(1)),
      muscle: parseFloat(r.muscle_kg?.toFixed(1)),
    }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 12,
              fontSize: 13,
              color: "#e2e8f0",
              fontFamily: "'Outfit', sans-serif",
            }}
            labelStyle={{ color: "#64748b", marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Line
            type="monotone"
            dataKey="fat"
            stroke="#ef4444"
            name="Жир %"
            strokeWidth={2}
            dot={{ r: 3, fill: "#ef4444" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="bmi"
            stroke="#f59e0b"
            name="ИМТ"
            strokeWidth={2}
            dot={{ r: 3, fill: "#f59e0b" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="muscle"
            stroke="#10b981"
            name="Мышцы кг"
            strokeWidth={2}
            dot={{ r: 3, fill: "#10b981" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
