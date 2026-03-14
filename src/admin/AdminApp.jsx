import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ClinicsPage from "./pages/ClinicsPage";
import ContentPage from "./pages/ContentPage";
import ContentEditorPage from "./pages/ContentEditorPage";
import TelegramPage from "./pages/TelegramPage";
import SettingsPage from "./pages/SettingsPage";
import MoneyFunnelPage from "./pages/MoneyFunnelPage";
import BookingsPage from "./pages/BookingsPage";

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="*" element={
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="funnel" element={<MoneyFunnelPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="clinics" element={<ClinicsPage />} />
                <Route path="content" element={<ContentPage />} />
                <Route path="content/new" element={<ContentEditorPage />} />
                <Route path="content/:id" element={<ContentEditorPage />} />
                <Route path="telegram" element={<TelegramPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        } />
      </Routes>
    </AdminAuthProvider>
  );
}
