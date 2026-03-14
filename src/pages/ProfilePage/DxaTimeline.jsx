import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import HealthDataConsent from "../../components/HealthDataConsent";
import AddDxaResult from "./AddDxaResult";

export default function DxaTimeline() {
  const { user, profile, fetchProfile } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const hasConsent = profile?.consent_health_data === true;

  useEffect(() => {
    if (hasConsent && results === null) {
      loadResults();
    }
  }, [hasConsent]);

  async function loadResults() {
    if (!supabase || !profile) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("dxa_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("scan_date", { ascending: false });
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleConsented() {
    setShowConsent(false);
    loadResults();
  }

  function handleSaved() {
    setShowAdd(false);
    setEditItem(null);
    loadResults();
  }

  function handleAddClick() {
    if (!hasConsent) {
      setShowConsent(true);
    } else {
      setShowAdd(true);
    }
  }

  // ── Styles ──
  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: 20, padding: 20, marginBottom: 12,
    border: "1px solid #334155",
  };

  const btnPrimary = {
    width: "100%", padding: 16, border: "none", borderRadius: 14,
    background: "linear-gradient(135deg, #10b981, #34d399)",
    color: "#020617", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: "0 0 30px #10b98133",
  };

  const metricStyle = (color) => ({
    fontSize: 13, color: "#94a3b8",
  });

  const metricValue = (color) => ({
    color, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
  });

  // ── Not consented: prompt ──
  if (!hasConsent) {
    return (
      <div style={{ animation: "fadeSlide 0.4s ease" }}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>
              Доступ к медицинским данным
            </h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
              Для хранения и просмотра результатов DXA-исследований необходимо ваше согласие на обработку медицинских данных.
            </p>
            <button onClick={() => setShowConsent(true)} style={{ ...btnPrimary, width: "auto", padding: "12px 24px", fontSize: 14 }}>
              Дать согласие
            </button>
          </div>
        </div>
        {showConsent && (
          <HealthDataConsent onConsent={handleConsented} onClose={() => setShowConsent(false)} />
        )}
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
        Загрузка...
      </div>
    );
  }

  // ── Consented: timeline ──
  return (
    <div style={{ animation: "fadeSlide 0.4s ease" }}>
      {/* Add button */}
      <button onClick={handleAddClick} style={{ ...btnPrimary, marginBottom: 16 }}>
        + Добавить результат DXA
      </button>

      {results && results.length > 0 ? (
        results.map((r) => (
          <div key={r.id} style={cardStyle}>
            {/* Header: date + clinic */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>
                {new Date(r.scan_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {r.clinic_name && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  · {r.clinic_name}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
              {r.scan_type === "initial" ? "Первичное обследование" : "Повторное обследование"}
            </div>

            {/* Metrics */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginBottom: 14 }}>
              {r.fat_pct != null && (
                <span style={metricStyle()}>
                  Жир: <span style={metricValue("#f59e0b")}>{r.fat_pct}%</span>
                </span>
              )}
              {r.muscle_mass_kg != null && (
                <span style={metricStyle()}>
                  Мышцы: <span style={metricValue("#10b981")}>{r.muscle_mass_kg} кг</span>
                </span>
              )}
              {r.bone_mass_kg != null && (
                <span style={metricStyle()}>
                  Кость: <span style={metricValue("#8b5cf6")}>{r.bone_mass_kg} кг</span>
                </span>
              )}
              {r.visceral_fat_area != null && (
                <span style={metricStyle()}>
                  Висц.: <span style={metricValue("#ef4444")}>{r.visceral_fat_area} см²</span>
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              {r.report_url && (
                <button
                  onClick={async () => {
                    if (!supabase) return;
                    const { data } = await supabase.storage
                      .from("dxa-reports")
                      .createSignedUrl(r.report_url, 300);
                    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                  }}
                  style={{
                    padding: "8px 14px", borderRadius: 10,
                    background: "#1e293b", border: "1px solid #334155",
                    color: "#94a3b8", fontSize: 12, textDecoration: "none",
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                  }}
                >
                  PDF
                </button>
              )}
              <button
                onClick={() => setEditItem(r)}
                style={{
                  padding: "8px 14px", borderRadius: 10,
                  background: "#1e293b", border: "1px solid #334155",
                  color: "#94a3b8", fontSize: 12, cursor: "pointer",
                }}
              >
                Редактировать
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🦴</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>
              Пока нет результатов DXA
            </div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
              Добавьте результаты DXA-денситометрии, чтобы отслеживать динамику состава тела.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddDxaResult onSaved={handleSaved} onClose={() => setShowAdd(false)} />
      )}
      {editItem && (
        <AddDxaResult existingResult={editItem} onSaved={handleSaved} onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}
