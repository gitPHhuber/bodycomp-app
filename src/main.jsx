import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, initMetrika } from "./utils/analytics";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import ClinicsPage from "./pages/ClinicsPage";
import BodyComparePage from "./pages/BodyComparePage";
import PrivacyPage from "./pages/PrivacyPage";
import Header from "./components/Header";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); trackPageView(pathname); }, [pathname]);
  return null;
}

initMetrika();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Перейти к содержимому</a>
      <ScrollToTop />
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/clinics" element={<ClinicsPage />} />
          <Route path="/xray" element={<BodyComparePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  </React.StrictMode>
);
