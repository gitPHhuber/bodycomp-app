import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { trackGoal } from "../../utils/analytics";
import * as tracker from "../../lib/tracker";
import { getSessionId } from "../../lib/tracker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Icons, getBodyTypeIcon } from "./Icons";
import { calc } from "./calculations";
import Gauge from "./Gauge";
import BodyRing from "./BodyRing";
import StatCard from "./StatCard";
import InputField from "./InputField";
import ShareCard from "../../components/ShareCard";
import { useMeta } from "../../utils/useMeta";

const BodyModel3D = lazy(() => import("../LandingPage/BodyModel3D"));

export default function AnalyzerPage() {
  useMeta(
    "Калькулятор состава тела онлайн — процент жира, мышцы, метаболизм",
    "Бесплатный расчёт состава тела за 3 минуты. Процент жира по формуле Navy, ИМТ, FFMI, базовый метаболизм, висцеральный риск."
  );
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=gender, 2=basics, 3=measurements, 4=results
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [neck, setNeck] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [results, setResults] = useState(null);
  const [showDxa, setShowDxa] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharingPng, setSharingPng] = useState(false);
  const topRef = useRef(null);
  const shareCardRef = useRef(null);
  const { user, profile, requireAuth } = useAuth();

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    trackGoal('calculator_start');
    tracker.trackCalcStart();
  }, []);

  const canProceed2 = age && height && weight;
  const canProceed3 = waist && neck && (gender === "male" || hip);

  function calculate() {
    const g = gender;
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const wa = parseFloat(waist);
    const hi = parseFloat(hip) || 0;
    const ne = parseFloat(neck);

    const bf = Math.max(3, Math.min(55, calc.bodyFatNavy(g, wa, ne, hi, h)));
    const bmi = calc.bmi(w, h);
    const bmr = calc.bmr(g, w, h, a);
    const whr = g === "female" && hi > 0 ? calc.whr(wa, hi) : calc.whr(wa, hi || wa * 0.85);
    const ffmi = calc.ffmi(w, h, bf);
    const lm = calc.leanMass(w, bf);
    const fm = calc.fatMass(w, bf);
    const bt = calc.bodyType(g, bf);
    const vr = calc.visceralRisk(g, whr);

    // Approximate muscle % (lean mass is ~40-50% muscle)
    const musclePct = (lm / w) * 100 * 0.55;

    // Activity multiplier for TDEE
    const actMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9 };
    const tdee = bmr * (actMult[activity] || 1.55);

    setResults({ bf, bmi, bmr, whr, ffmi, lm, fm, bt, vr, musclePct, tdee, weight: w, gender: g });
    trackGoal('calculator_complete');
    tracker.trackCalcComplete({
      height_cm: h, weight_kg: w, age: a, gender: g,
      waist_cm: wa, hip_cm: hi || null, neck_cm: ne,
      fat_pct: bf, muscle_kg: lm * 0.55, visceral_level: vr.level, bmi,
    });
    setStep(4);
  }

  async function saveResult() {
    if (!supabase || !results || saving) return;
    setSaving(true);
    try {
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (userRow) {
        await supabase.from("calc_results").insert({
          user_id: userRow.id,
          session_id: getSessionId(),
          height_cm: parseFloat(height),
          weight_kg: parseFloat(weight),
          age: parseInt(age),
          gender,
          waist_cm: parseFloat(waist),
          hip_cm: parseFloat(hip) || null,
          neck_cm: parseFloat(neck),
          fat_pct: results.bf,
          muscle_kg: results.lm * 0.55,
          visceral_level: results.vr.level,
          bmi: results.bmi,
        });
        setSaved(true);
      }
    } catch {
      // Silent failure
    } finally {
      setSaving(false);
    }
  }

  async function shareAsPng() {
    if (sharingPng) return;
    setSharingPng(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const el = shareCardRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#020617", scale: 2 });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const file = new File([blob], "bodycomp-result.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: "Мой анализ состава тела" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bodycomp-result.png";
        a.click();
        URL.revokeObjectURL(url);
      }
      trackGoal("share_png");
      tracker.trackShare("png_card");
    } catch {
      // User cancelled or error
    } finally {
      setSharingPng(false);
    }
  }

  const activityLabels = {
    sedentary: "Сидячий образ жизни",
    light: "Лёгкая активность (1-2 р/нед)",
    moderate: "Умеренная (3-4 р/нед)",
    active: "Высокая (5-6 р/нед)",
    extreme: "Экстремальная (ежедневно)",
  };

  // ── Shared styles
  const pageStyle = {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)",
    color: "#e2e8f0",
    fontFamily: "'Outfit', 'Manrope', sans-serif",
    padding: "0 0 40px 0",
  };

  const containerStyle = {
    maxWidth: 640, margin: "0 auto", padding: "0 20px",
  };

  const btnPrimary = {
    width: "100%", padding: "16px", border: "none", borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    color: "#020617", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.02em",
    boxShadow: "0 0 30px #22d3ee33",
  };

  const btnSecondary = {
    ...btnPrimary,
    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    boxShadow: "0 0 30px #10b98133",
  };

  const cardStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderRadius: 20, padding: 24, marginBottom: 16,
    border: "1px solid #334155",
  };

  // ── STEP 1: Gender
  if (step === 1) {
    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          <div style={{ paddingTop: 72, marginBottom: 32 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 20px", color: "#e2e8f0" }}>
              Рассчитайте состав тела
            </h1>
            <div style={{ fontSize: 12, color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>ШАГ 1 / 3</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Ваш пол</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>Формулы расчёта отличаются для мужчин и женщин</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {[
              { id: "male", icon: Icons.male(36, "#22d3ee"), label: "Мужской" },
              { id: "female", icon: Icons.female(36, "#22d3ee"), label: "Женский" },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => { setGender(g.id); setStep(2); }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "20px 24px", borderRadius: 16,
                  background: gender === g.id ? "#0891b215" : "#0f172a",
                  border: `2px solid ${gender === g.id ? "#22d3ee" : "#334155"}`,
                  color: "#e2e8f0", fontSize: 18, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ width: 48, display: "flex", justifyContent: "center" }}>{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: Basics
  if (step === 2) {
    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          <div style={{ paddingTop: 72, marginBottom: 32 }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
              ← Назад
            </button>
            <div style={{ fontSize: 12, color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>ШАГ 2 / 3</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Базовые параметры</h2>
          </div>

          <InputField label="Возраст" value={age} onChange={setAge} unit="лет" placeholder="30" min={14} max={99} />
          <InputField label="Рост" value={height} onChange={setHeight} unit="см" placeholder="175" min={120} max={230} />
          <InputField label="Вес" value={weight} onChange={setWeight} unit="кг" placeholder="75" min={30} max={250} />

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              Уровень активности
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(activityLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActivity(key)}
                  style={{
                    padding: "12px 16px", borderRadius: 10, textAlign: "left",
                    background: activity === key ? "#0891b215" : "#0f172a",
                    border: `1.5px solid ${activity === key ? "#22d3ee" : "#1e293b"}`,
                    color: activity === key ? "#22d3ee" : "#94a3b8",
                    fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(1)} style={{ ...btnPrimary, width: "auto", flex: "0 0 auto", padding: "16px 20px", background: "#1e293b", color: "#94a3b8", boxShadow: "none" }}>←</button>
            <button
              onClick={() => canProceed2 && setStep(3)}
              style={{ ...btnPrimary, opacity: canProceed2 ? 1 : 0.4 }}
              disabled={!canProceed2}
            >
              Далее →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Measurements
  if (step === 3) {
    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          <div style={{ paddingTop: 72, marginBottom: 24 }}>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: "4px 0", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
              ← Назад
            </button>
            <div style={{ fontSize: 12, color: "#22d3ee", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>ШАГ 3 / 3</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Обхваты тела</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>Измерьте сантиметровой лентой</p>
          </div>

          {/* Visual guide */}
          <div style={{ ...cardStyle, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", marginBottom: 8 }}>📏 Как измерить</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
              <b style={{ color: "#e2e8f0" }}>Шея</b> — по основанию, под кадыком<br />
              <b style={{ color: "#e2e8f0" }}>Талия</b> — на уровне пупка, расслабив живот<br />
              {gender === "female" && <><b style={{ color: "#e2e8f0" }}>Бёдра</b> — по самой широкой точке ягодиц<br /></>}
            </div>
          </div>

          <InputField label="Обхват шеи" value={neck} onChange={setNeck} unit="см" placeholder="38" min={20} max={60} hint="У основания шеи, под кадыком" />
          <InputField label="Обхват талии" value={waist} onChange={setWaist} unit="см" placeholder="82" min={40} max={180} hint="На уровне пупка" />
          {gender === "female" && (
            <InputField label="Обхват бёдер" value={hip} onChange={setHip} unit="см" placeholder="96" min={50} max={180} hint="По самой широкой точке" />
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(2)} style={{ ...btnPrimary, width: "auto", flex: "0 0 auto", padding: "16px 20px", background: "#1e293b", color: "#94a3b8", boxShadow: "none" }}>←</button>
            <button
              onClick={() => canProceed3 && calculate()}
              style={{ ...btnPrimary, opacity: canProceed3 ? 1 : 0.4 }}
              disabled={!canProceed3}
            >
              Рассчитать →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 4: Results
  if (step === 4 && results) {
    const r = results;
    const fatRanges = calc.fatRanges(r.gender);

    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          {/* Header */}
          <div style={{ paddingTop: 72, textAlign: "center", marginBottom: 32 }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>{getBodyTypeIcon(r.bt.type)}</div>
            <h2 style={{
              fontSize: 28, fontWeight: 800, margin: "0 0 6px",
              background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              {r.bt.type}
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Ваш тип телосложения</p>
          </div>

          {/* Body Fat Gauge */}
          <div style={cardStyle}>
            <Gauge value={r.bf} min={2} max={r.gender === "male" ? 40 : 45} ranges={fatRanges} label="Процент жира" unit="%" />
          </div>

          {/* Composition Ring */}
          <div style={cardStyle}>
            <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              Состав тела
            </div>
            <BodyRing fatPct={r.bf} musclePct={r.musclePct} />
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>{r.fm.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>кг жира</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}>{r.lm.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>кг без жира</div>
              </div>
            </div>
          </div>

          {/* 3D Body Model */}
          <div style={cardStyle}>
            <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              3D-модель
            </div>
            <Suspense fallback={<div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>Загрузка модели...</div>}>
              <BodyModel3D fatPct={r.bf} height={280} />
            </Suspense>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <StatCard label="ИМТ" value={r.bmi.toFixed(1)} unit="" sub={r.bmi < 18.5 ? "Дефицит" : r.bmi < 25 ? "Норма" : r.bmi < 30 ? "Избыток" : "Ожирение"} color="#f59e0b" delay={100} />
            <StatCard label="FFMI" value={r.ffmi.toFixed(1)} unit="" sub={r.ffmi < 18 ? "Ниже среднего" : r.ffmi < 20 ? "Среднее" : r.ffmi < 22 ? "Выше среднего" : "Продвинутое"} color="#8b5cf6" delay={200} />
            <StatCard label="Метаболизм" value={Math.round(r.bmr).toString()} unit="ккал" sub="Базовый обмен" color="#22d3ee" delay={300} />
            <StatCard label="TDEE" value={Math.round(r.tdee).toString()} unit="ккал" sub="Расход за день" color="#10b981" delay={400} />
          </div>

          {/* Visceral Risk */}
          <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>Висцеральный жир</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: r.vr.color }}>Риск: {r.vr.level}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>WHR: {r.whr.toFixed(2)}</div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: `3px solid ${r.vr.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {r.vr.level === "Низкий" ? Icons.check(24, r.vr.color) : r.vr.level === "Повышенный" ? Icons.alert(24, r.vr.color) : Icons.danger(24, r.vr.color)}
            </div>
          </div>

          {/* Accuracy warning + DXA CTA */}
          <div style={{
            background: "linear-gradient(135deg, #0c4a6e22, #164e6333)",
            borderRadius: 20, padding: 24, marginBottom: 16,
            border: "1px solid #22d3ee44",
            boxShadow: "0 0 30px #22d3ee10, inset 0 1px 0 #22d3ee15",
          }}>
            <h3 style={{
              fontSize: 18, fontWeight: 800, margin: "0 0 8px",
              background: "linear-gradient(135deg, #22d3ee, #0891b2)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1.3,
            }}>
              Хотите узнать точные цифры?
            </h3>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#22d3ee", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              {Icons.alert(18, "#22d3ee")} Погрешность ±8%
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 16px" }}>
              Этот расчёт имеет погрешность ±8%. DXA-сканирование даёт точность ±1–2%.
            </p>
            <button
              className="btn-lift btn-pulse"
              onClick={() => { tracker.trackClick("results_cta_dxa"); navigate("/clinics"); }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                border: "none", borderRadius: 12,
                color: "#020617", padding: "14px 16px", cursor: "pointer",
                fontSize: 14, fontWeight: 700, marginBottom: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Записаться на DXA →
            </button>
            <button
              className="btn-lift-secondary"
              onClick={() => { if (!showDxa) { trackGoal('dxa_info_click'); tracker.trackClick("dxa_info_toggle"); } setShowDxa(!showDxa); }}
              style={btnSecondary}
            >
              {showDxa ? "Скрыть" : "Узнать про DXA →"}
            </button>
          </div>

          {/* DXA Section */}
          {showDxa && (
            <div style={{
              background: "linear-gradient(135deg, #064e3b22, #10b98122)",
              borderRadius: 20, padding: 24, marginBottom: 16,
              border: "1px solid #10b98144",
              animation: "fadeIn 0.5s ease",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#10b981", margin: "0 0 12px" }}>
                DXA-сканирование тела
              </h3>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, marginBottom: 16 }}>
                DXA (двухэнергетическая рентгеновская абсорбциометрия) за 5 минут определяет:<br /><br />
                <span style={{ color: "#10b981" }}>▸</span> Точный % жира по каждой зоне тела<br />
                <span style={{ color: "#10b981" }}>▸</span> Мышечную массу и её распределение<br />
                <span style={{ color: "#10b981" }}>▸</span> Плотность костей (риск остеопороза)<br />
                <span style={{ color: "#10b981" }}>▸</span> Висцеральный жир (невидимый враг)<br />
                <span style={{ color: "#10b981" }}>▸</span> Асимметрию мышц лево/право<br /><br />
                Доза облучения минимальна — в 10 раз меньше рентгена грудной клетки.
              </div>

              <div style={{
                background: "#0f172a", borderRadius: 14, padding: 16, marginBottom: 16,
                border: "1px solid #334155",
              }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Партнёр</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Санаторий-партнёр ASVOMED</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>DXA-денситометр Stratos dR (Франция)</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 8, background: "#10b98122", color: "#10b981", fontSize: 12 }}>Body Composition</span>
                  <span style={{ padding: "4px 10px", borderRadius: 8, background: "#22d3ee22", color: "#22d3ee", fontSize: 12 }}>Денситометрия</span>
                  <span style={{ padding: "4px 10px", borderRadius: 8, background: "#8b5cf622", color: "#8b5cf6", fontSize: 12 }}>3D-DXA</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/clinics")}
                style={btnSecondary}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icons.calendar(18, "#020617")} Записаться на DXA</span>
              </button>
              <p style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginTop: 8 }}>
                Или напишите нам в <a href="https://t.me/asvomed" target="_blank" rel="noopener" style={{ color: "#22d3ee", textDecoration: "underline" }}>Telegram</a>
              </p>
            </div>
          )}

          {/* Save Result */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <button
              onClick={() => requireAuth(() => saveResult())}
              disabled={saved || saving}
              style={{
                ...btnPrimary,
                opacity: saved ? 0.6 : 1,
                background: saved ? "#10b981" : btnPrimary.background,
                boxShadow: saved ? "0 0 30px #10b98133" : btnPrimary.boxShadow,
              }}
            >
              {saving ? "Сохраняем..." : saved ? "Сохранено" : "Сохранить результат"}
            </button>
          </div>

          {/* Share */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={shareAsPng}
              disabled={sharingPng}
              style={{ ...btnPrimary, background: "#1e293b", color: "#94a3b8", boxShadow: "none", fontSize: 14, flex: 1 }}
            >
              {sharingPng ? "..." : "Поделиться картинкой"}
            </button>
            <button
              onClick={() => {
                trackGoal('share_result');
                tracker.trackShare("calc_result");
                const text = `Мой анализ состава тела:\n` +
                  `▸ ${r.bt.type}\n` +
                  `Жир: ${r.bf.toFixed(1)}% (${r.fm.toFixed(1)} кг)\n` +
                  `Мышцы+кости: ${r.lm.toFixed(1)} кг\n` +
                  `Метаболизм: ${Math.round(r.tdee)} ккал/день\n\n` +
                  `Узнай свои цифры → ${window.location.href}`;
                if (navigator.share) {
                  navigator.share({ text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("Скопировано!");
                }
              }}
              style={{ ...btnPrimary, background: "#1e293b", color: "#94a3b8", boxShadow: "none", fontSize: 14, flex: 1 }}
            >
              Текстом
            </button>
          </div>

          {/* Hidden share card for html2canvas */}
          <div style={{ position: "absolute", left: -9999, top: 0 }}>
            <ShareCard ref={shareCardRef} results={r} />
          </div>

          {/* Restart */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { setStep(1); setGender(""); setResults(null); }}
              style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", padding: 8, textDecoration: "underline" }}
            >
              Пройти заново
            </button>
          </div>

          {/* Methodology */}
          <div style={{ ...cardStyle, marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 12px" }}>
              Методология расчёта
            </h3>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>% жира</span> — формула US Navy Body Fat Formula, используемая Министерством обороны США. Рассчитывается по обхватам шеи, талии и бёдер с учётом роста.
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>ИМТ</span> — индекс массы тела (BMI). Отношение веса к квадрату роста (кг/м²).
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>FFMI</span> — индекс массы без жира (Fat-Free Mass Index). Оценка мышечного развития с поправкой на рост.
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>Метаболизм</span> — базовый обмен по формуле Mifflin-St Jeor. TDEE учитывает уровень физической активности.
              </div>
              <div>
                <span style={{ color: "#22d3ee", fontWeight: 600 }}>Висцеральный риск</span> — оценка по соотношению талия/бёдра (WHR) с пороговыми значениями ВОЗ.
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: "1px solid #1e293b", marginTop: 24 }}>
            <p style={{ fontSize: 10, color: "#334155", lineHeight: 1.6 }}>
              Результаты носят информационный характер и не являются медицинским диагнозом.
              Для точной оценки обратитесь к специалисту. Имеются противопоказания, необходима консультация специалиста.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
