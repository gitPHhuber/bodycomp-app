import AdminSidebar from "./AdminSidebar";
import { colors } from "../styles";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
      <AdminSidebar />
      <main style={{
        flex: 1,
        marginLeft: 260,
        padding: "24px 32px",
        minHeight: "100vh",
        overflowX: "hidden",
      }}>
        {children}
      </main>
    </div>
  );
}
