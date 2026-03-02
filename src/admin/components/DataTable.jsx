import { useState } from "react";
import { colors, fonts } from "../styles";

export default function DataTable({
  columns,
  data,
  onRowClick,
  sortable = true,
  pageSize = 50,
  emptyText = "Нет данных",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  let sorted = [...(data || [])];
  if (sortKey) {
    sorted.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: fonts.body,
          fontSize: 13,
        }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.textDim,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: fonts.mono,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    cursor: sortable && col.sortable !== false ? "pointer" : "default",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 4, fontSize: 10 }}>
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: colors.textDim,
                    fontFamily: fonts.mono,
                    fontSize: 13,
                  }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.cardHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${colors.border}`,
                        color: colors.text,
                        whiteSpace: "nowrap",
                        maxWidth: col.maxWidth || "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 0",
          borderTop: `1px solid ${colors.border}`,
          marginTop: 8,
        }}>
          <span style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.mono }}>
            {sorted.length} записей • Стр. {page + 1} из {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                background: "transparent",
                color: page === 0 ? colors.textDark : colors.textMuted,
                fontSize: 12,
                cursor: page === 0 ? "not-allowed" : "pointer",
                fontFamily: fonts.body,
              }}
            >
              ← Назад
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                background: "transparent",
                color: page >= totalPages - 1 ? colors.textDark : colors.textMuted,
                fontSize: 12,
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                fontFamily: fonts.body,
              }}
            >
              Далее →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
