import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import "./keyframes";
import Reveal from "../../components/Reveal";
import Typewriter from "./Typewriter";
import CountingStat from "./CountingStat";
import { PROFILES, MYTHS, THREATS, fatDesc, boneDesc } from "./data";
import { Icons } from "../AnalyzerPage/Icons";
import { useMeta } from "../../utils/useMeta";
import * as tracker from "../../lib/tracker";

const Particles = lazy(() => import("./Particles"));
const BodyModel3D = lazy(() => import("./BodyModel3D"));
const BoneCrossSection = lazy(() => import("./BoneCrossSection"));
const BodyCompare = lazy(() => import("./BodyCompare"));

const PROFILE_ICONS = {
  female: (sz, c) => Icons.fit(sz, c),
  male: (sz, c) => Icons.athletic(sz, c),
  female2: (sz, c) => Icons.average(sz, c),
};

const DXA_FEATURES = [
  { title: "Точный % жира по зонам", color: "#22d3ee", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="#22d3ee" strokeWidth="1.3" fill="#22d3ee12"/><path d="M12 8v5M9.5 20l2.5-7 2.5 7" stroke="#22d3ee" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11.5h10" stroke="#22d3ee" strokeWidth="1.3" strokeLinecap="round"/><path d="M4 8h2M18 8h2M4 14h2M18 14h2" stroke="#22d3ee" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/></svg> },
  { title: "Мышечная масса и баланс", color: "#10b981", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 10.5l3.5 1.5h2M19 10.5l-3.5 1.5h-2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 9l1 1.5M20 9l-1 1.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="5" r="2.5" stroke="#10b981" strokeWidth="1.3" fill="#10b98115"/><path d="M12 8v4M9 20l3-8 3 8" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { title: "Плотность костей", color: "#a78bfa", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="3.5" stroke="#a78bfa" strokeWidth="1.3" fill="none" opacity="0.8"/><line x1="12" y1="10" x2="12" y2="18" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="13" x2="16" y2="13" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="18" x2="9" y2="22" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="18" x2="15" y2="22" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="14" r="6" stroke="#a78bfa" strokeWidth="0.7" strokeDasharray="2 2.5" opacity="0.25"/></svg> },
  { title: "Висцеральный жир", color: "#f59e0b", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="#f59e0b" strokeWidth="1.3" fill="#f59e0b15"/><ellipse cx="12" cy="13" rx="4.5" ry="3" stroke="#f59e0b" strokeWidth="1.3" fill="#f59e0b0c"/><path d="M10 19.5l2-3 2 3" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 10.5h9" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round"/></svg> },
];

export default function LandingPage() {
  useMeta(
    "Состав тела — узнайте, что скрывают ваши весы | DXA-анализ",
    "Ваш вес не показывает правду. Узнайте реальный процент жира, мышечную массу и риски. Бесплатный расчёт или точный DXA-анализ."
  );
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState({});
  const [myth, setMyth] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [fat, setFat] = useState(25);
  const [bone, setBone] = useState(80);
  const [boneOpen, setBoneOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const schedule = typeof requestIdleCallback === "function" ? requestIdleCallback : (cb) => setTimeout(cb, 200);
    const id = schedule(() => setShowParticles(true));
    return () => {
      (typeof cancelIdleCallback === "function" ? cancelIdleCallback : clearTimeout)(id);
    };
  }, []);

  const loader3d = <div style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", borderRadius: 20 }}><span style={{ color: "#334155", fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>Загрузка 3D...</span></div>;
  const card = { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 20, padding: 24, border: "1px solid #334155" };
  const fd = fatDesc(fat);
  const bd = boneDesc(bone);

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif", overflow: "hidden" }}>
      {showParticles && <Suspense fallback={null}><Particles /></Suspense>}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ═══ Block 1: Hero ═══ */}
        <div style={{ textAlign: "center", paddingTop: 104, paddingBottom: 28 }}>
          <Reveal from="scale" delay={200}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "#22d3ee12", border: "1px solid #22d3ee30", marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22d3ee", animation: "pulse2 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace" }}>БЕСПЛАТНЫЙ РАСЧЁТ</span>
            </div>
          </Reveal>
          <Reveal from="blur" delay={500}>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
              <span style={{ color: "#64748b" }}>Ваши весы<br /></span>
              <Typewriter text="скрывают правду" delay={800} speed={60} style={{ background: "linear-gradient(135deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
            </h1>
          </Reveal>
          <Reveal from="bottom" delay={1800}><p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>Одинаковый вес — совершенно разное здоровье.</p></Reveal>
          <Reveal from="bottom" delay={2200}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              <button onClick={() => { tracker.trackClick("cta_analyzer_hero"); navigate("/analyzer"); }}
                className="btn-lift"
                style={{ padding: 14, border: "none", borderRadius: 14, background: "linear-gradient(135deg,#0891b2,#22d3ee)", color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", boxShadow: "0 0 20px #22d3ee20" }}>
                Рассчитать состав тела →
              </button>
              <button onClick={() => { tracker.trackClick("cta_xray_hero"); navigate("/xray"); }}
                className="btn-ghost-cyan"
                style={{ padding: 12, border: "1px solid #334155", borderRadius: 14, background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Как работает DXA-сканер
              </button>
            </div>
          </Reveal>
          <Reveal from="bottom" delay={2100}><div style={{ marginTop: 20, animation: "float 3s ease-in-out infinite" }}><div style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>scroll</div><div style={{ fontSize: 24, color: "#334155" }}>↓</div></div></Reveal>
        </div>

        {/* ═══ Block 2: BodyCompare ═══ */}
        <Reveal from="left" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DXA-СКАНЕР</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Один вес. Два разных тела.</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 14px" }}>Угадаете, кто из них здоров?</p>
            <Suspense fallback={loader3d}><BodyCompare /></Suspense>
          </div>
        </Reveal>

        {/* ═══ Block 3: DXA Features (NEW) ═══ */}
        <Reveal from="scale" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DXA-АНАЛИЗ</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 14px" }}>Что покажет DXA за 5 минут</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {DXA_FEATURES.map((f, i) => (
                <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 80}>
                  <div style={{ ...card, padding: 16, borderColor: f.color + "1a" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: f.color + "10", border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      {f.svg}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.35 }}>{f.title}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "10px 16px", borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b" }}>
              <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono',monospace" }}>от ₽5 000 · 5 минут · минимальное облучение</span>
            </div>
          </div>
        </Reveal>

        {/* ═══ Block 4: Profiles ═══ */}
        <Reveal from="left"><div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>ЭКСПЕРИМЕНТ</div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Три человека. «Здоровый» ИМТ.</h2></div></Reveal>
        {PROFILES.map((p, i) => {
          const rv = revealed[p.id];
          const renderIcon = PROFILE_ICONS[p.icon];
          return (
            <Reveal key={p.id} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
              <div style={{ ...card, marginBottom: 14, cursor: "pointer", borderColor: rv ? p.vc + "55" : "#334155", boxShadow: rv ? `0 0 30px ${p.vc}10` : "none", transition: "all 0.35s" }} onClick={() => { if (!rv) tracker.trackClick("profile_reveal", { profile: p.id }); setRevealed(r => ({ ...r, [p.id]: true })); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b" }}>
                    {renderIcon ? renderIcon(26, p.vc) : p.icon}
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}, {p.age}</div><div style={{ fontSize: 12, color: "#64748b" }}>{p.h} см · {p.w} кг</div></div>
                  <div style={{ padding: "4px 10px", borderRadius: 8, background: p.bmiC + "22", color: p.bmiC, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>ИМТ {p.bmi}</div>
                </div>
                <div style={{ padding: "8px 14px", borderRadius: 10, background: "#020617", marginBottom: 12, fontSize: 13, color: "#64748b" }}>{p.scale}</div>
                {!rv ? (
                  <div style={{ textAlign: "center", padding: 12, background: "#ef444408", borderRadius: 12, border: "1px dashed #ef444425" }}><span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>👆 Нажмите — увидьте правду</span></div>
                ) : (
                  <div style={{ animation: "fadeSlide 0.6s ease" }}>
                    <div style={{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", background: "#1e293b", marginBottom: 10 }}>
                      <div style={{ width: `${p.fat}%`, background: "linear-gradient(90deg,#ef4444,#f87171)", transition: "width 1s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{p.fat}%</div>
                      <div style={{ width: `${p.muscle}%`, background: "linear-gradient(90deg,#10b981,#34d399)", transition: "width 1s ease .1s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{p.muscle}%</div>
                      <div style={{ flex: 1, background: "#3b82f6" }} />
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: p.vc + "10", border: `1px solid ${p.vc}30` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.vc, marginBottom: 4 }}>Реальность: {p.verdict}</div>
                      <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{p.truth}</div>
                    </div>
                    <div style={{ marginTop: 6, padding: "6px 12px", borderRadius: 8, background: "#0f172a", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>💡 {p.tip}</div>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}

        {/* ═══ Block 5: Quiz ═══ */}
        <Reveal from="left">
          <div style={{ ...card, background: "linear-gradient(135deg,#1e1b4b12,#4c1d9512)", border: "1px solid #7c3aed30", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, letterSpacing: "0.1em" }}>ПРОВЕРЬТЕ СЕБЯ</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>Два человека по 80 кг. У кого выше риск инфаркта?</h3>
            {[{ id: "a", t: "У того, кто выглядит полнее", ok: false }, { id: "b", t: "У того, у кого больше висцерального жира — даже если стройнее", ok: true }, { id: "c", t: "Риск одинаков — вес же одинаковый", ok: false }].map(o => {
              const s = quiz === o.id, g = quizDone && o.ok, b2 = quizDone && s && !o.ok;
              return <button key={o.id} onClick={() => { if (!quizDone) { if (!quiz) tracker.trackQuizStart("visceral-fat"); setQuiz(o.id); setTimeout(() => { setQuizDone(true); tracker.trackQuizComplete("visceral-fat", o.ok ? 1 : 0, { selected: o.id, correct: o.ok }); }, 400); } }} style={{ display: "block", width: "100%", padding: "13px 16px", marginBottom: 8, borderRadius: 12, textAlign: "left", background: g ? "#10b98115" : b2 ? "#ef444415" : s ? "#7c3aed15" : "#0f172a", border: `1.5px solid ${g ? "#10b981" : b2 ? "#ef4444" : s ? "#7c3aed" : "#1e293b"}`, color: "#e2e8f0", fontSize: 14, cursor: quizDone ? "default" : "pointer", transition: "all 0.3s" }}>{g && "✓ "}{b2 && "✗ "}{o.t}</button>;
            })}
            {quizDone && <div style={{ padding: 14, borderRadius: 12, background: "#10b98110", border: "1px solid #10b98130", animation: "fadeSlide 0.6s ease", marginTop: 6, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}><b style={{ color: "#10b981" }}>Висцеральный жир</b> невидим снаружи, но является предиктором №1 болезней сердца и диабета. <b>Единственный способ измерить точно — DXA-сканирование.</b></div>}
          </div>
        </Reveal>

        {/* ═══ Block 6: 3D Body Model ═══ */}
        <Reveal from="right" delay={100}>
          <div style={{ ...card, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 4 }}>ИНТЕРАКТИВНАЯ 3D-МОДЕЛЬ</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Анатомия состава тела</h2>
              </div>
            </div>
            <Suspense fallback={loader3d}><BodyModel3D fatPct={fat} height={340} /></Suspense>
            <div style={{ padding: "12px 16px", borderRadius: 14, background: fd.color + "12", border: `1px solid ${fd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: fd.color }}>{fd.label}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: fd.color, fontFamily: "'JetBrains Mono',monospace" }}>{fat}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{fd.detail}</div>
            </div>
            <div style={{ padding: "0 4px" }}>
              <input type="range" min={6} max={45} value={fat} onChange={e => { setFat(+e.target.value); tracker.track3DInteraction("body_model", "fat_slider"); }} style={{ width: "100%", accentColor: fd.color, height: 6, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                <span>6%</span><span>15%</span><span>25%</span><span>35%</span><span>45%</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {[{ c: "#22d3ee", l: "Кожа" }, { c: "#ef4444", l: "Жир" }, { c: "#10b981", l: "Мышцы" }, { c: "#f1f5f9", l: "Кости" }, ...(fat > 22 ? [{ c: "#fbbf24", l: "Висцеральный жир" }] : [])].map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, border: "1px solid #33415566" }} />{x.l}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══ Block 7: Myths ═══ */}
        <Reveal from="bottom"><div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>МИФЫ</div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>5 опасных заблуждений</h2></div></Reveal>
        {MYTHS.map((m, i) => {
          const op = myth === i;
          return (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 70}>
              <div onClick={() => { if (!op) tracker.trackClick("myth_open", { index: i }); setMyth(op ? null : i); }} style={{ ...card, marginBottom: 10, cursor: "pointer", padding: op ? 22 : 16, borderColor: op ? "#f59e0b30" : "#334155", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 24, transition: "transform 0.3s", transform: op ? "scale(1.25) rotate(-8deg)" : "none" }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: op ? "#10b981" : "#f87171", textDecoration: op ? "line-through" : "none", transition: "all 0.3s" }}>{m.myth}</div>
                    {op && <div style={{ animation: "fadeSlide 0.5s ease" }}><div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, marginTop: 8, marginBottom: 12 }}>{m.fact}</div><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#f59e0b0a", border: "1px solid #f59e0b1a" }}><span style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace" }}>{m.stat}</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{m.sub}</span></div></div>}
                  </div>
                  <span style={{ fontSize: 16, color: "#334155", transform: op ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▾</span>
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* ═══ Block 8: Statistics + Threats (combined) ═══ */}
        <Reveal from="scale" delay={100}>
          <div style={{ marginTop: 18, marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>ЦИФРЫ ПО РОССИИ</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 14px" }}>Почему это важно</h2>
            <div style={{ borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                <CountingStat value="14" suffix=" млн" label="больны остеопорозом" duration={3200} />
                <CountingStat value="20" suffix=" млн" label="остеопения" duration={3800} />
                <CountingStat value="40" suffix="%" label="скрытый избыток жира" duration={4500} />
              </div>
              <div style={{ textAlign: "center", paddingBottom: 14 }}>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Каждые <span style={{ color: "#ef4444", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>5 минут</span> — перелом бедра из-за остеопороза</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {THREATS.map((t, i) => (
                <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
                  <div className="card-threat"
                    style={{ ...card, '--hover-shadow': `0 10px 30px ${t.c}15`, padding: 14, borderColor: t.c + "1a" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.c, marginBottom: 4 }}>{t.what}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.55, marginBottom: 8 }}>{t.desc}</div>
                    <div style={{ fontSize: 10, color: t.c, padding: "5px 8px", borderRadius: 6, background: t.c + "0a", lineHeight: 1.4 }}>⚡ {t.tag}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══ Block 9: Bones (simplified) ═══ */}
        <Reveal from="right" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div onClick={() => { setBoneOpen(o => { if (!o) tracker.trackClick("bone_section_open"); return !o; }); }} style={{ ...card, cursor: "pointer", borderColor: boneOpen ? "#8b5cf655" : "#ef444440", background: boneOpen ? "linear-gradient(135deg,#0f172a,#1e293b)" : "linear-gradient(135deg,#1a0a0a,#1e293b)", boxShadow: boneOpen ? "0 0 40px #8b5cf610" : "0 0 30px #ef444408", transition: "all 0.5s ease", position: "relative", overflow: "hidden" }}>
              {!boneOpen && <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, #ef444415, transparent 70%)", animation: "pulse2 3s ease-in-out infinite" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: boneOpen ? "#8b5cf610" : "#ef444412", border: `1px solid ${boneOpen ? "#8b5cf633" : "#ef444425"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.4s" }}>
                  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="6" r="4" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="1.5" fill="none" opacity="0.8" />
                    <line x1="16" y1="10" x2="16" y2="22" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="14" x2="23" y2="14" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="16" y1="22" x2="11" y2="30" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="16" y1="22" x2="21" y2="30" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="1.8" strokeLinecap="round" />
                    {!boneOpen && <><line x1="13" y1="16" x2="19" y2="20" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" /><line x1="19" y1="16" x2="13" y2="20" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" /></>}
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 3, color: boneOpen ? "#a78bfa" : "#ef4444", transition: "color 0.4s" }}>{boneOpen ? "3D-МОДЕЛЬ КОСТИ" : "СКРЫТАЯ УГРОЗА"}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25, color: "#e2e8f0" }}>{boneOpen ? "Посмотрите, что происходит внутри" : "После 30 ваш скелет тает"}</div>
                  {!boneOpen && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.4 }}>Каждый год вы теряете <span style={{ color: "#ef4444", fontWeight: 700 }}>1–2%</span> костной массы. Без симптомов.</div>}
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: boneOpen ? "#8b5cf612" : "#ef444412", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s", transform: boneOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5L7 9L11 5" stroke={boneOpen ? "#a78bfa" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              {!boneOpen && (
                <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#64748b", animation: "float 2.5s ease-in-out infinite" }}>
                  <span style={{ padding: "5px 14px", borderRadius: 20, background: "#ef44440a", border: "1px solid #ef444418" }}>👆 Нажмите — загляните внутрь своих костей</span>
                </div>
              )}
            </div>

            {boneOpen && (
              <div style={{ animation: "fadeSlide 0.5s ease", marginTop: 2 }}>
                <div style={{ ...card, marginTop: 0, borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", textAlign: "center" }}>Крутите пальцем · Щипком приближайте · Слайдер меняет плотность</p>
                  <Suspense fallback={loader3d}><BoneCrossSection density={bone / 100} height={280} /></Suspense>
                  <div style={{ padding: "12px 16px", borderRadius: 14, background: bd.color + "12", border: `1px solid ${bd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: bd.color }}>{bd.label}</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: bd.color, fontFamily: "'JetBrains Mono',monospace" }}>{bone}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{bd.detail}</div>
                  </div>
                  <input type="range" min={15} max={100} value={bone} onChange={e => { setBone(+e.target.value); tracker.track3DInteraction("bone_model", "density_slider"); }} style={{ width: "100%", accentColor: bd.color, height: 6, cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", marginTop: 2, marginBottom: 18 }}>
                    <span style={{ color: "#dc2626" }}>Тяжёлый</span><span style={{ color: "#ef4444" }}>Остеопороз</span><span style={{ color: "#f59e0b" }}>Остеопения</span><span style={{ color: "#10b981" }}>Норма</span>
                  </div>
                  <div onClick={() => { tracker.trackClick("cta_clinics_bone"); navigate("/clinics"); }} style={{ textAlign: "center", padding: "14px 0", cursor: "pointer" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", transition: "color 0.3s" }}>Хотите узнать свою плотность? →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* ═══ Block 10: Final CTA ═══ */}
        <Reveal from="bottom">
          <div style={{ borderRadius: 22, padding: 32, textAlign: "center", background: "linear-gradient(135deg,#0891b210,#10b98110)", border: "1px solid #22d3ee1a", marginBottom: 24 }}>
            <div style={{ marginBottom: 14, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>{Icons.bodyScan(44, "#22d3ee")}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#e2e8f0,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Узнайте свои реальные цифры</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.55, margin: "0 0 22px" }}>Бесплатный расчёт за 3 минуты — или точный DXA-анализ</p>
            {[{ label: "Рассчитать состав тела →", bg: "linear-gradient(135deg,#0891b2,#22d3ee)", s: "#22d3ee", href: "/analyzer", el: "cta_analyzer_bottom" }, { label: "Записаться на DXA", bg: "linear-gradient(135deg,#10b981,#34d399)", s: "#10b981", href: "/clinics", el: "cta_clinics_bottom" }].map((b, i) => (
              <button key={i} onClick={() => { tracker.trackClick(b.el); navigate(b.href); }}
                className="btn-lift-glow"
                style={{ '--hover-shadow': `0 6px 30px ${b.s}30`, display: "block", width: "100%", padding: 15, marginBottom: 8, border: "none", borderRadius: 14, background: b.bg, color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", boxShadow: `0 0 20px ${b.s}20` }}>
                {b.label}
              </button>
            ))}
            <p style={{ fontSize: 11, color: "#334155", marginTop: 10 }}>DXA — золотой стандарт точности · 5 минут · Минимальное облучение</p>
          </div>
        </Reveal>

        <div style={{ textAlign: "center", padding: "14px 0", borderTop: "1px solid #1e293b" }}>
          <p style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.6 }}>Образовательный контент. Имеются противопоказания, необходима консультация специалиста.</p>
        </div>
      </div>
    </div>
  );
}
