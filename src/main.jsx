import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AnalyzerPage from "./pages/AnalyzerPage.jsx";
import ClinicsPage from "./pages/ClinicsPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/clinics" element={<ClinicsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
