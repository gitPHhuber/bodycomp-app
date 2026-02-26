import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icons, getBodyTypeIcon } from "./Icons";
import { calc } from "./calculations";
import Gauge from "./Gauge";
import BodyRing from "./BodyRing";
import StatCard from "./StatCard";
import InputField from "./InputField";

export default function AnalyzerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=intro, 1=gender, 2=basics, 3=measurements, 4=results
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
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
  }, [step]);

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
    setStep(4);
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
    maxWidth: 440, margin: "0 auto", padding: "0 20px",
  };

  const btnPrimary = {
    width: "100%", padding: "16px", border: "none", borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    color: "#020617", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.02em",
    boxShadow: "0 0 30px #22d3ee33",
    transition: "transform 0.2s, box-shadow 0.2s",
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

  // ── STEP 0: Intro
  if (step === 0) {
    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          {/* Hero */}
          <div style={{ textAlign: "center", paddingTop: 116, paddingBottom: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: "0 auto 24px",
              background: "linear-gradient(135deg, #0891b2, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 60px #22d3ee44",
            }}>
              {Icons.bodyScan(44, "#020617")}
            </div>
            <h1 style={{
              fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "0 0 12px",
              background: "linear-gradient(135deg, #e2e8f0, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontFamily: "'Outfit', sans-serif",
            }}>
              Узнайте реальный<br />состав вашего тела
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Процент жира, мышечная масса, метаболизм и риски — за 3 минуты. Бесплатно.
            </p>
            <button
              style={btnPrimary}
              onClick={() => setStep(1)}
              onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 40px #22d3ee55"; }}
              onMouseOut={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 30px #22d3ee33"; }}
            >
              Начать анализ →
            </button>
          </div>

          {/* Features */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            {[
              { icon: Icons.timer(30, "#22d3ee"), title: "3 минуты", sub: "Быстрый анализ" },
              { icon: Icons.hexagon(30, "#22d3ee"), title: "6 метрик", sub: "Полная картина" },
              { icon: Icons.shield(30, "#22d3ee"), title: "Без регистрации", sub: "Данные не хранятся" },
              { icon: Icons.report(30, "#22d3ee"), title: "Отчёт", sub: "Можно поделиться" },
            ].map((f, i) => (
              <div key={i} style={{
                ...cardStyle, padding: "20px 16px", textAlign: "center", marginBottom: 0,
              }}>
                <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{f.sub}</div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
              Расчёт по формуле US Navy Body Fat Formula<br />
              используемой Министерством обороны США
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 1: Gender
  if (step === 1) {
    return (
      <div style={pageStyle}>
        <div ref={topRef} />
        <div style={containerStyle}>
          <div style={{ paddingTop: 96, marginBottom: 32 }}>
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
          <div style={{ paddingTop: 96, marginBottom: 32 }}>
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
          <div style={{ paddingTop: 96, marginBottom: 24 }}>
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
          <div style={{ paddingTop: 96, textAlign: "center", marginBottom: 32 }}>
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

          {/* Accuracy warning + DXA CTA */}
          <div style={{
            background: "linear-gradient(135deg, #0c4a6e22, #164e6333)",
            borderRadius: 20, padding: 24, marginBottom: 16,
            border: "1px solid #0891b244",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#22d3ee", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              {Icons.alert(18, "#22d3ee")} Точность: ±8-12%
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 16px" }}>
              Формулы дают приблизительную оценку. Домашние весы-анализаторы ошибаются ещё больше — до ±15%.
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: "0 0 16px" }}>
              Хотите узнать <span style={{ color: "#22d3ee" }}>точные цифры</span>? DXA-сканирование — золотой стандарт анализа состава тела, точность ±1-2%.
            </p>
            <button
              onClick={() => setShowDxa(!showDxa)}
              style={btnSecondary}
              onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.target.style.transform = "translateY(0)"; }}
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
                Или позвоните: +7 (XXX) XXX-XX-XX
              </p>
            </div>
          )}

          {/* Share */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <button
              onClick={() => {
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
              style={{ ...btnPrimary, background: "#1e293b", color: "#94a3b8", boxShadow: "none", fontSize: 14 }}
            >
              📤 Поделиться результатом
            </button>
          </div>

          {/* Restart */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => { setStep(0); setGender(""); setResults(null); }}
              style={{ background: "none", border: "none", color: "#475569", fontSize: 13, cursor: "pointer", padding: 8, textDecoration: "underline" }}
            >
              Пройти заново
            </button>
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
