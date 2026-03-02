import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors, fonts } from "../styles";

export default function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        color: colors.textDim,
        fontFamily: fonts.mono,
        fontSize: 14,
      }}>
        Загрузка...
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        color: colors.textMuted,
        fontFamily: fonts.body,
        gap: 12,
      }}>
        <div style={{ fontSize: 48 }}>403</div>
        <div style={{ fontSize: 16 }}>Доступ запрещён</div>
        <div style={{ fontSize: 13, color: colors.textDim }}>
          Ваш аккаунт ({user.email}) не имеет прав администратора
        </div>
      </div>
    );
  }

  return children;
}
