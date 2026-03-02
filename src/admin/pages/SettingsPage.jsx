import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors, fonts, cardStyle } from "../styles";
import DataTable from "../components/DataTable";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SettingsPage() {
  const { user, adminRole } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase.from("admin_users").select("id, email, role, created_at");
    setAdmins(data || []);
    setLoading(false);
  }

  const adminColumns = [
    { key: "email", label: "Email" },
    { key: "role", label: "Роль", render: (v) => (
      <span style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
        background: v === "superadmin" ? "#f59e0b20" : `${colors.accent}15`,
        color: v === "superadmin" ? "#f59e0b" : colors.accent,
      }}>
        {v}
      </span>
    )},
    { key: "created_at", label: "Создан", render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: "0 0 24px" }}>
        Настройки
      </h1>

      {/* Current admin info */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: "0 0 16px" }}>
          Текущий аккаунт
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
              EMAIL
            </div>
            <div style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
              {user?.email || "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
              РОЛЬ
            </div>
            <div style={{ fontSize: 14, color: colors.accent, fontFamily: fonts.mono, fontWeight: 600 }}>
              {adminRole || "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
              USER ID
            </div>
            <div style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.mono }}>
              {user?.id || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Supabase connection */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: "0 0 16px" }}>
          Подключение к Supabase
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: supabase ? "#10b981" : "#ef4444",
            boxShadow: supabase ? "0 0 8px #10b981" : "0 0 8px #ef4444",
          }} />
          <span style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
            {supabase ? "Подключено" : "Не подключено"}
          </span>
        </div>
        {supabase && (
          <div style={{ marginTop: 12, fontSize: 12, color: colors.textDim, fontFamily: fonts.mono }}>
            URL: {import.meta.env.VITE_SUPABASE_URL || "не задан"}
          </div>
        )}
      </div>

      {/* Admin users list */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: "0 0 16px" }}>
          Администраторы
        </h3>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
            Загрузка...
          </div>
        ) : (
          <DataTable columns={adminColumns} data={admins} />
        )}
        <div style={{ marginTop: 12, fontSize: 12, color: colors.textDim, fontFamily: fonts.body }}>
          Для добавления администраторов используйте Supabase Dashboard → таблица admin_users
        </div>
      </div>
    </div>
  );
}
