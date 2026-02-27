import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "#64748b",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
      }}>
        Загрузка...
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
}
