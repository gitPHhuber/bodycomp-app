import React, { lazy, Suspense, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import * as tracker from "./lib/tracker";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import ClinicsPage from "./pages/ClinicsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import YandexMetrika from "./components/YandexMetrika";
import "./styles/interactive.css";

const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ClinicPage = lazy(() => import("./pages/ClinicPage"));
const BodyComparePage = lazy(() => import("./pages/BodyComparePage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ExpertQAPage = lazy(() => import("./pages/ExpertQAPage"));
const RepeatDxaPage = lazy(() => import("./pages/RepeatDxaPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function TrackingProvider() {
  const { pathname } = useLocation();
  const firedRef = useRef(new Set());
  const enterRef = useRef(Date.now());
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Time on previous page
    if (prevPathRef.current !== pathname) {
      const elapsed = Math.round((Date.now() - enterRef.current) / 1000);
      if (elapsed > 0) tracker.trackTimeOnPage(prevPathRef.current, elapsed);
      prevPathRef.current = pathname;
      enterRef.current = Date.now();
      firedRef.current = new Set();
    }

    tracker.trackPageView(pathname);

    // Scroll depth tracking
    const thresholds = [25, 50, 75, 100];
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (docH > 0) {
          const pct = Math.round((window.scrollY / docH) * 100);
          for (const t of thresholds) {
            if (pct >= t && !firedRef.current.has(t)) {
              firedRef.current.add(t);
              tracker.trackScrollDepth(pathname, t);
            }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const elapsed = Math.round((Date.now() - enterRef.current) / 1000);
        if (elapsed > 0) tracker.trackTimeOnPage(pathname, elapsed);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}

const ProfileFallback = () => (
  <div style={{
    minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#020617", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
  }}>
    Загрузка...
  </div>
);

const AdminFallback = () => (
  <div style={{
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#020617", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
  }}>
    Загрузка...
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin panel — separate layout, no main Header/AuthProvider */}
        <Route path="/admin/*" element={
          <Suspense fallback={<AdminFallback />}>
            <AdminApp />
          </Suspense>
        } />

        {/* Main site */}
        <Route path="*" element={
          <AuthProvider>
            <YandexMetrika />
            <ScrollToTop />
            <TrackingProvider />
            <Header />
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/analyzer" element={<AnalyzerPage />} />
              <Route path="/clinics" element={<ClinicsPage />} />
              <Route path="/clinics/:clinicSlug" element={
                <Suspense fallback={<ProfileFallback />}>
                  <ClinicPage />
                </Suspense>
              } />
              <Route path="/news" element={<Suspense fallback={<ProfileFallback />}><NewsPage /></Suspense>} />
              <Route path="/news/:slug" element={<Suspense fallback={<ProfileFallback />}><ArticlePage /></Suspense>} />
              <Route path="/expert-qa" element={<Suspense fallback={<ProfileFallback />}><ExpertQAPage /></Suspense>} />
              <Route path="/repeat-dxa" element={<Suspense fallback={<ProfileFallback />}><RepeatDxaPage /></Suspense>} />
              <Route path="/xray" element={<Suspense fallback={<ProfileFallback />}><BodyComparePage /></Suspense>} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Suspense fallback={<ProfileFallback />}>
                    <ProfilePage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </ErrorBoundary>
            <AuthModal />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
