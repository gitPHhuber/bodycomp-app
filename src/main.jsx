import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./utils/analytics";
import * as tracker from "./lib/tracker";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import ClinicsPage from "./pages/ClinicsPage";
import BodyComparePage from "./pages/BodyComparePage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/Header";
import "./styles/interactive.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); trackPageView(pathname); }, [pathname]);
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <TrackingProvider />
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/clinics" element={<ClinicsPage />} />
        <Route path="/xray" element={<BodyComparePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
