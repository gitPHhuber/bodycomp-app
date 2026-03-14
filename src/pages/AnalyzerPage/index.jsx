import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as tracker from "../../lib/tracker";
import { getSessionId } from "../../lib/tracker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Icons, getBodyTypeIcon } from "./Icons";
import { calc } from "./calculations";
import { SIZE_OPTIONS, SIZE_MAPPINGS } from "./sizeMappings";
import Gauge from "./Gauge";
import BodyRing from "./BodyRing";
import StatCard from "./StatCard";
import InputField from "./InputField";
import ShareCard from "../../components/ShareCard";
import RecommendationCard from "./RecommendationCard";
import OfferBanner from "./OfferBanner";
import { useMeta } from "../../utils/useMeta";


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
  const [calcMode, setCalcMode] = useState("quick");   // "quick" | "precise"
  const [clothingSize, setClothingSize] = useState(""); // XS..3XL
  const [results, setResults] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharingPng, setSharingPng] = useState(false);
  const [copied, setCopied] = useState(false);
  const topRef = useRef(null);
  const shareCardRef = useRef(null);
  const { user, profile, requireAuth } = useAuth();

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    tracker.trackCalcStart();
  }, []);

  const canProceed2 = age && height && weight;
  const canProceed3 = calcMode === "quick"
    ? !!clothingSize
    : waist && neck && (gender === "male" || hip);

  function calculate() {
    const g = gender;
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    // In quick mode, use mapped values from clothing size
    let wa, hi, ne;
    if (calcMode === "quick" && clothingSize) {
      const mapped = SIZE_MAPPINGS[g][clothingSize];
      wa = mapped.waist;
      ne = mapped.neck;
      hi = mapped.hip;
      // Also set state so saveResult() picks up the values
      setWaist(String(wa));
      setNeck(String(ne));
      setHip(String(hi));
    } else {
      wa = parseFloat(waist);
      hi = parseFloat(hip) || 0;
      ne = parseFloat(neck);
    }

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

    setResults({ bf, bmi, bmr, whr, ffmi, lm, fm, bt, vr, musclePct, tdee, weight: w, gender: g, calcMode });
    tracker.trackCalcComplete({
      height_cm: h, weight_kg: w, age: a, gender: g,
      waist_cm: wa, hip_cm: hi || null, neck_cm: ne,
      fat_pct: bf, muscle_kg: lm * 0.55, visceral_level: vr.level, bmi,
      calc_mode: calcMode,
      clothing_size: calcMode === "quick" ? clothingSize : undefined,
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bodycomp-result.png";
      a.click();
      URL.revokeObjectURL(url);
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
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{calcMode === "quick" ? "Размер одежды" : "Обхваты тела"}</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>{calcMode === "quick" ? "Выберите ваш размер" : "Измерьте сантиметровой лентой"}</p>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { id: "quick", label: "Быстрый расчёт" },
              { id: "precise", label: "Точный расчёт" },
            ].map(tab => {
              const active = calcMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (calcMode !== tab.id) {
                      setCalcMode(tab.id);
                      setClothingSize("");
                      setWaist(""); setNeck(""); setHip("");
                      setResults(null);
                      tracker.trackClick("calc_mode_switch", { mode: tab.id });
                    }
                  }}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 12,
                    background: active ? "#0891b215" : "#0f172a",
                    border: `1.5px solid ${active ? "#22d3ee" : "#1e293b"}`,
                    color: active ? "#22d3ee" : "#94a3b8",
                    fontSize: 14, fontWeight: active ? 700 : 500,
                    cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {calcMode === "quick" ? (
            <>
              {/* Accuracy label */}
              <div style={{
                fontSize: 12, color: "#f59e0b", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {Icons.alert(14, "#f59e0b")} Приблизительный расчёт (±5–8% точности)
              </div>

              {/* Size selector */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Ваш размер одежды
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {SIZE_OPTIONS.map(size => {
                    const active = clothingSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setClothingSize(size)}
                        style={{
                          padding: "12px 0",
                          flex: "1 1 calc(25% - 10px)",
                          minWidth: 60,
                          borderRadius: 12,
                          textAlign: "center",
                          background: active ? "#0891b215" : "#0f172a",
                          border: `1.5px solid ${active ? "#22d3ee" : "#1e293b"}`,
                          color: active ? "#22d3ee" : "#94a3b8",
                          fontSize: 15, fontWeight: active ? 700 : 500,
                          cursor: "pointer", transition: "all 0.2s",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Accuracy label */}
              <div style={{
                fontSize: 12, color: "#10b981", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {Icons.check(14, "#10b981")} Точный расчёт по формуле US Navy (±3–4%)
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
            </>
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

          {/* Personalized DXA Recommendation */}
          {results && (
            <RecommendationCard
              bodyType={r.bt}
              fatPct={r.bf}
              bmi={r.bmi}
              ffmi={r.ffmi}
              visceralRisk={r.vr}
              gender={gender}
              age={age}
            />
          )}

          {/* Bonus Offer Banner */}
          {results && <OfferBanner visible={!!results} />}

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
          {(() => {
            const shareUrl = window.location.href;
            const shareText =
              `Мой анализ состава тела:\n` +
              `▸ ${r.bt.type}\n` +
              `Жир: ${r.bf.toFixed(1)}% (${r.fm.toFixed(1)} кг)\n` +
              `Мышцы+кости: ${r.lm.toFixed(1)} кг\n` +
              `Метаболизм: ${Math.round(r.tdee)} ккал/день\n\n` +
              `Узнай свои цифры → ${shareUrl}`;
            const shortText = `Мой анализ состава тела: жир ${r.bf.toFixed(1)}%, мышцы ${r.lm.toFixed(1)} кг\nУзнай свои цифры → ${shareUrl}`;
            const shareBtn = {
              width: 48, height: 48, borderRadius: 14,
              border: "1px solid #334155", background: "#1e293b",
              color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            };
            const socialLinks = [
              { name: "Telegram", tracker: "telegram",
                url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg> },
              { name: "WhatsApp", tracker: "whatsapp",
                url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg> },
              { name: "VK", tracker: "vk",
                url: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Мой состав тела: жир ${r.bf.toFixed(1)}%`)}&comment=${encodeURIComponent(shareText)}`,
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.362 1.26 2.174 1.817.614.42 1.08.328 1.08.328l2.172-.03s1.136-.07.598-.964c-.044-.073-.314-.661-1.618-1.869-1.365-1.263-1.183-1.058.462-3.242.998-1.328 1.398-2.14 1.273-2.487-.12-.332-.858-.244-.858-.244l-2.447.015s-.182-.025-.316.056c-.131.079-.216.263-.216.263s-.388 1.032-.905 1.91c-1.089 1.852-1.525 1.95-1.703 1.834-.414-.27-.31-1.085-.31-1.665 0-1.81.274-2.564-.534-2.76-.268-.065-.466-.108-1.152-.115-.88-.009-1.624.003-2.046.21-.28.137-.497.443-.365.46.163.022.533.1.728.365.253.343.244 1.114.244 1.114s.146 2.13-.339 2.394c-.333.18-.788-.188-1.767-1.87-.502-.86-.88-1.81-.88-1.81s-.073-.179-.203-.275c-.158-.116-.378-.153-.378-.153l-2.324.015s-.349.01-.477.161c-.113.134.008.41.008.41s1.824 4.267 3.89 6.415c1.893 1.97 4.044 1.84 4.044 1.84h1.391z"/></svg> },
              { name: "X", tracker: "twitter",
                url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}`,
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            ];
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
                  ПОДЕЛИТЬСЯ
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                  {socialLinks.map((link) => (
                    <button
                      key={link.name}
                      title={link.name}
                      onClick={() => { tracker.trackShare(link.tracker); window.open(link.url, "_blank", "noopener,noreferrer"); }}
                      style={shareBtn}
                    >
                      {link.icon}
                    </button>
                  ))}
                  <button
                    title="Скопировать текст"
                    onClick={() => {
                      tracker.trackShare("copy_text");
                      navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
                    }}
                    style={{ ...shareBtn, background: copied ? "#10b981" : "#1e293b", color: copied ? "#fff" : "#94a3b8" }}
                  >
                    {copied
                      ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    }
                  </button>
                  <button
                    title="Скачать картинку"
                    onClick={shareAsPng}
                    disabled={sharingPng}
                    style={{ ...shareBtn, opacity: sharingPng ? 0.5 : 1 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Hidden share card for html2canvas */}
          <div style={{ position: "absolute", left: -9999, top: 0 }}>
            <ShareCard ref={shareCardRef} results={r} />
          </div>

          {/* Restart */}
          <div style={{ textAlign: "center" }}>
            <button

              onClick={() => { setStep(1); setGender(""); setResults(null); setCalcMode("quick"); setClothingSize(""); }}

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

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 12px" }}>Что это</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: "0 0 8px" }}>Онлайн-калькулятор даёт ориентировочную оценку состава тела на базе антропометрических формул.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>Это предварительный инструмент, который помогает понять направление изменений до инструментальной диагностики.</p>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 12px" }}>Кому подходит / не подходит</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: "0 0 8px" }}>Подходит для первичной самооценки и мониторинга трендов между визитами к специалисту.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>Не подходит для постановки диагноза и не заменяет DXA-исследование и очную консультацию врача.</p>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 12px" }}>Точность и ограничения</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: "0 0 8px" }}>Формульные методы чувствительны к точности замеров обхватов, пола, возраста и индивидуальных особенностей телосложения.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, margin: 0 }}>При клинических задачах и спорных значениях следует использовать инструментальные методы с врачебной интерпретацией.</p>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: "0 0 12px" }}>Источники</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#94a3b8", lineHeight: 1.8, fontSize: 13 }}>
              <li><a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>NCBI / PubMed</a></li>
              <li><a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>WHO guidance materials</a></li>
            </ul>
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
