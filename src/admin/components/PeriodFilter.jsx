import { colors, fonts } from "../styles";

const PERIODS = [
  { key: "today", label: "Сегодня" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
  { key: "all", label: "Всё время" },
];

export function getDateRange(period) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      return startOfDay.toISOString();
    case "week": {
      const d = new Date(startOfDay);
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    }
    case "month": {
      const d = new Date(startOfDay);
      d.setMonth(d.getMonth() - 1);
      return d.toISOString();
    }
    case "all":
    default:
      return null;
  }
}

export default function PeriodFilter({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: value === p.key ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
            background: value === p.key ? `${colors.accent}15` : "transparent",
            color: value === p.key ? colors.accent : colors.textMuted,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fonts.body,
            transition: "all 0.15s",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
