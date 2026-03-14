import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminStatus } from "../../hooks/useAdminStatus";
import { supabase } from "../../lib/supabase";
import { useMeta } from "../../utils/useMeta";

const HistoryChart = lazy(() => import("./HistoryChart"));

const DxaCharts = lazy(() => import("./DxaCharts"));
const NextStepCard = lazy(() => import("./NextStepCard"));

const DxaTimeline = lazy(() => import("./DxaTimeline"));


const TABS = [
  { id: "data", label: "Профиль" },
  { id: "history", label: "Расчёты" },
  { id: "dxa", label: "DXA" },
  { id: "quizzes", label: "Квизы" },
];

export default function ProfilePage() {
  useMeta("Профиль — BODYCOMP", "Личный кабинет: история расчётов, графики прогресса, данные DXA");

  const navigate = useNavigate();
  const { user, profile, signOut, fetchProfile } = useAuth();
  const { isAdmin } = useAdminStatus();
  const [tab, setTab] = useState("data");

  // Profile edit state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [consentRevoking, setConsentRevoking] = useState(false);

  // History state
  const [calcResults, setCalcResults] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Quiz state
  const [quizResults, setQuizResults] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // DXA state
  const [dxaResults, setDxaResults] = useState(null);
  const [dxaLoading, setDxaLoading] = useState(false);

  // Populate fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCity(profile.city || "");
      setBirthYear(profile.birth_year ?? "");
      setGender(profile.gender || "");
      setHeightCm(profile.height_cm ?? "");
    }
  }, [profile]);

  // Fetch calc results when history tab is opened
  useEffect(() => {
    if (tab === "history" && calcResults === null && profile) {
      loadCalcResults();
    }
  }, [tab, profile]);

  // Fetch quiz results
  useEffect(() => {
    if (tab === "quizzes" && quizResults === null && profile) {
      loadQuizResults();
    }
  }, [tab, profile]);

  // Fetch DXA results
  useEffect(() => {
    if (tab === "dxa" && dxaResults === null && profile) {
      loadDxaResults();
    }
  }, [tab, profile]);

  async function loadCalcResults() {
    if (!supabase || !profile) return;
    setCalcLoading(true);
    try {
      const { data } = await supabase
        .from("calc_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setCalcResults(data || []);
    } catch {
      setCalcResults([]);
    } finally {
      setCalcLoading(false);
    }
  }

  async function loadQuizResults() {
    if (!supabase || !profile) return;
    setQuizLoading(true);
    try {
      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      setQuizResults(data || []);
    } catch {
      setQuizResults([]);
    } finally {
      setQuizLoading(false);
    }
  }

  async function loadDxaResults() {
    if (!supabase || !profile) return;
    setDxaLoading(true);
    try {
      const { data } = await supabase
        .from("dxa_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("scan_date", { ascending: true });
      setDxaResults(data || []);
    } catch {
      setDxaResults([]);
    } finally {
      setDxaLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!supabase || !user || profileSaving) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      await supabase
        .from("users")
        .update({
          name: name.trim() || null,
          city: city.trim() || null,
          birth_year: birthYear !== "" ? Number(birthYear) : null,
          gender: gender || null,
          height_cm: heightCm !== "" ? Number(heightCm) : null,
        })
        .eq("auth_id", user.id);
      await fetchProfile(user.id);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      // Silent
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  async function handleRevokeConsent(field) {
    if (!supabase || !user || consentRevoking) return;
    setConsentRevoking(true);
    try {
      const updates = { [field]: false, [`${field}_at`]: null };
      await supabase.from("users").update(updates).eq("auth_id", user.id);
      await fetchProfile(user.id);
    } catch {
      // silent
    } finally {
      setConsentRevoking(false);
    }
  }

  const avatarLetter = (profile?.name?.[0] || user?.email?.[0] || "?").toUpperCase();

  // ── Styles
  const pageStyle = {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)",
    color: "#e2e8f0",
    fontFamily: "'Outfit', 'Manrope', sans-serif",
    padding: "0 0 40px 0",
  };

  const containerStyle = { maxWidth: 640, margin: "0 auto", padding: "0 20px" };

  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: 20, padding: 24, marginBottom: 16,
    border: "1px solid #334155",
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "14px 16px",
    background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12,
    color: "#fff", fontSize: 16, outline: "none",
    fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s",
  };

  const btnPrimary = {
    width: "100%", padding: "16px", border: "none", borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    color: "#020617", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: "0 0 30px #22d3ee33",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Profile Header */}
        <div style={{ paddingTop: 96, textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px",
            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#020617", fontSize: 28, fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {avatarLetter}
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, margin: "0 0 4px",
            background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {profile?.name || "Профиль"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{user?.email}</p>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: 12, background: "none", border: "1px solid #334155",
              color: "#64748b", padding: "8px 20px", borderRadius: 10,
              cursor: "pointer", fontSize: 12,
            }}
          >
            Выйти
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                background: "linear-gradient(135deg, #f59e0b22, #d9770622)",
                border: "1px solid #f59e0b44",
                color: "#f59e0b",
                padding: "8px 20px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s",
              }}
            >
              Админ-панель
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24, padding: 4,
          background: "#0f172a", borderRadius: 14, border: "1px solid #1e293b",
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "10px 8px", border: "none", borderRadius: 10,
                background: tab === t.id ? "#1e293b" : "transparent",
                color: tab === t.id ? "#22d3ee" : "#64748b",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Data */}
        {tab === "data" && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={cardStyle}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  style={{ ...inputStyle, color: "#64748b", cursor: "default" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Город
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Москва"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Год рождения
                </label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="1990"
                  min="1920"
                  max="2010"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Пол
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ value: "male", label: "Мужской" }, { value: "female", label: "Женский" }].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGender(opt.value)}
                      style={{
                        flex: 1, padding: "12px", border: "1.5px solid",
                        borderColor: gender === opt.value ? "#22d3ee" : "#334155",
                        borderRadius: 12,
                        background: gender === opt.value ? "#22d3ee11" : "#0f172a",
                        color: gender === opt.value ? "#22d3ee" : "#94a3b8",
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Рост, см
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  min="100"
                  max="250"
                  step="0.1"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                style={{
                  ...btnPrimary,
                  background: profileSaved ? "#10b981" : btnPrimary.background,
                  boxShadow: profileSaved ? "0 0 30px #10b98133" : btnPrimary.boxShadow,
                }}
              >
                {profileSaving ? "Сохраняем..." : profileSaved ? "Сохранено" : "Сохранить"}
              </button>
            </div>

            {/* Consents block */}
            <div style={cardStyle}>
              <div style={{
                fontSize: 13, color: "#64748b", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 14,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Мои согласия
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Медицинские данные</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {profile?.consent_health_data
                      ? `Дано ${profile.consent_health_data_at ? new Date(profile.consent_health_data_at).toLocaleDateString("ru-RU") : ""}`
                      : "Не дано"}
                  </div>
                </div>
                {profile?.consent_health_data && (
                  <button
                    onClick={() => handleRevokeConsent("consent_health_data")}
                    disabled={consentRevoking}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: "#ef444422", border: "1px solid #ef444444",
                      color: "#ef4444", fontSize: 11, cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Отозвать
                  </button>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Маркетинг</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {profile?.consent_marketing
                      ? `Дано ${profile.consent_marketing_at ? new Date(profile.consent_marketing_at).toLocaleDateString("ru-RU") : ""}`
                      : "Не дано"}
                  </div>
                </div>
                {profile?.consent_marketing && (
                  <button
                    onClick={() => handleRevokeConsent("consent_marketing")}
                    disabled={consentRevoking}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: "#ef444422", border: "1px solid #ef444444",
                      color: "#ef4444", fontSize: 11, cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Отозвать
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: History */}
        {tab === "history" && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            {calcLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                Загрузка...
              </div>
            ) : calcResults && calcResults.length > 0 ? (
              <>
                {/* Chart */}
                <div style={{ ...cardStyle, padding: "16px 12px" }}>
                  <div style={{
                    fontSize: 13, color: "#64748b", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 12, paddingLeft: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    Динамика
                  </div>
                  <Suspense fallback={<div style={{ height: 260 }} />}>
                    <HistoryChart data={calcResults} />
                  </Suspense>
                </div>

                {/* Result cards */}
                {calcResults.map((cr) => (
                  <div key={cr.id} style={{ ...cardStyle, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                        {new Date(cr.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      <div style={{
                        padding: "3px 8px", borderRadius: 6,
                        background: cr.fat_pct < 20 ? "#10b98122" : cr.fat_pct < 30 ? "#f59e0b22" : "#ef444422",
                        color: cr.fat_pct < 20 ? "#10b981" : cr.fat_pct < 30 ? "#f59e0b" : "#ef4444",
                        fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {cr.fat_pct?.toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>ИМТ: <span style={{ color: "#f59e0b", fontWeight: 600 }}>{cr.bmi?.toFixed(1)}</span></span>
                      <span style={{ color: "#94a3b8" }}>Мышцы: <span style={{ color: "#10b981", fontWeight: 600 }}>{cr.muscle_kg?.toFixed(1)} кг</span></span>
                      <span style={{ color: "#94a3b8" }}>Висц: <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{cr.visceral_level || "—"}</span></span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={cardStyle}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Пока нет результатов</div>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
                    Пройдите анализ состава тела и сохраните результат, чтобы отслеживать прогресс.
                  </p>
                  <button
                    onClick={() => navigate("/analyzer")}
                    style={{ ...btnPrimary, width: "auto", padding: "12px 24px", fontSize: 14 }}
                  >
                    Пройти анализ →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: DXA */}
        {tab === "dxa" && (

          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            {dxaLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                Загрузка...
              </div>
            ) : (
              <>
                <Suspense fallback={<div style={{ height: 260 }} />}>
                  <DxaCharts results={dxaResults || []} />
                </Suspense>
                {dxaResults && dxaResults.length > 0 && (
                  <Suspense fallback={null}>
                    <NextStepCard
                      lastScanDate={dxaResults[dxaResults.length - 1].scan_date}
                      scanType={dxaResults[dxaResults.length - 1].scan_type}
                    />
                  </Suspense>
                )}
              </>
            )}
          </div>

          <Suspense fallback={<div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>Загрузка...</div>}>
            <DxaTimeline />
          </Suspense>

        )}

        {/* Tab: Quizzes */}
        {tab === "quizzes" && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            {quizLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                Загрузка...
              </div>
            ) : quizResults && quizResults.length > 0 ? (
              quizResults.map((qr) => (
                <div key={qr.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{qr.quiz_slug}</div>
                    <div style={{
                      padding: "4px 10px", borderRadius: 8,
                      background: "#8b5cf622", color: "#8b5cf6",
                      fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {qr.score} баллов
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                    {new Date(qr.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <button
                    onClick={() => {
                      const text = `Мой результат квиза "${qr.quiz_slug}": ${qr.score} баллов!\nПопробуй сам → ${window.location.origin}`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                      }
                    }}
                    style={{
                      background: "#1e293b", border: "none", color: "#94a3b8",
                      padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 12,
                    }}
                  >
                    Поделиться
                  </button>
                </div>
              ))
            ) : (
              <div style={cardStyle}>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Квизы не пройдены</div>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                    Пройденные квизы и их результаты будут отображаться здесь.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
