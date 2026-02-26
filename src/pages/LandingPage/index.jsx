import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./keyframes";
import Reveal from "../../components/Reveal";
import Splash from "./Splash";
import Particles from "./Particles";
import Typewriter from "./Typewriter";
import CountingStat from "./CountingStat";
import BodyModel3D from "./BodyModel3D";
import BoneCrossSection from "./BoneCrossSection";
import BodyCompare from "./BodyCompare";
import { PROFILES, MYTHS, THREATS, fatDesc, boneDesc } from "./data";

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [myth, setMyth] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [fat, setFat] = useState(25);
  const [bone, setBone] = useState(80);
  const [boneOpen, setBoneOpen] = useState(false);

  const card = { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 20, padding: 24, border: "1px solid #334155" };
  const fd = fatDesc(fat);
  const bd = boneDesc(bone);

  if (loading) return <Splash onDone={() => setLoading(false)} />;

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif", overflow: "hidden" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 20px 60px" }}>

        {}
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 28 }}>
          <Reveal from="scale" delay={200}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "#ef444412", border: "1px solid #ef444430", marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse2 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171", fontFamily: "'JetBrains Mono',monospace" }}>ВАЖНО ЗНАТЬ</span>
            </div>
          </Reveal>
          <Reveal from="blur" delay={500}>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
              <span style={{ color: "#64748b" }}>Ваши весы<br /></span>
              <Typewriter text="скрывают правду" delay={800} speed={60} style={{ background: "linear-gradient(135deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
            </h1>
          </Reveal>
          <Reveal from="bottom" delay={1800}><p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>Одинаковый вес — совершенно разное здоровье.</p></Reveal>
          <Reveal from="bottom" delay={2100}><div style={{ marginTop: 20, animation: "float 3s ease-in-out infinite" }}><div style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>scroll</div><div style={{ fontSize: 24, color: "#334155" }}>↓</div></div></Reveal>
        </div>

        {}
        <Reveal from="scale" delay={100}>
          <div style={{ marginBottom: 28, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.12em", padding: "12px 16px 0", textAlign: "center" }}>РОССИЯ — ПРЯМО СЕЙЧАС</div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              <CountingStat value="14" suffix=" млн" label="больны остеопорозом" duration={3200} />
              <CountingStat value="20" suffix=" млн" label="остеопения" duration={3800} />
              <CountingStat value="40" suffix="%" label="скрытый избыток жира" duration={4500} />
            </div>
            <div style={{ textAlign: "center", paddingBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Каждые <span style={{ color: "#ef4444", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>5 минут</span> — перелом бедра из-за остеопороза</div>
            </div>
          </div>
        </Reveal>

        {}
        <Reveal from="left" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DXA-СКАНЕР</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Один вес. Два разных тела.</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 14px" }}>Выберите человека и запустите сканирование</p>
            <BodyCompare />
          </div>
        </Reveal>

        {}
        <Reveal from="right" delay={100}>
          <div style={{ ...card, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 4 }}>ИНТЕРАКТИВНАЯ 3D-МОДЕЛЬ</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Анатомия состава тела</h2>
              </div>
            </div>
            <BodyModel3D fatPct={fat} height={340} />
            <div style={{ padding: "12px 16px", borderRadius: 14, background: fd.color + "12", border: `1px solid ${fd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: fd.color }}>{fd.label}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: fd.color, fontFamily: "'JetBrains Mono',monospace" }}>{fat}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{fd.detail}</div>
            </div>
            <div style={{ padding: "0 4px" }}>
              <input type="range" min={6} max={45} value={fat} onChange={e => setFat(+e.target.value)} style={{ width: "100%", accentColor: fd.color, height: 6, cursor: "pointer" }} />
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

        {}
        <Reveal from="left"><div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>ЭКСПЕРИМЕНТ</div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Три человека. «Здоровый» ИМТ.</h2></div></Reveal>
        {PROFILES.map((p, i) => {
          const rv = revealed[p.id];
          return (
            <Reveal key={p.id} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
              <div style={{ ...card, marginBottom: 14, cursor: "pointer", borderColor: rv ? p.vc + "55" : "#334155", boxShadow: rv ? `0 0 30px ${p.vc}10` : "none", transition: "all 0.35s" }} onClick={() => setRevealed(r => ({ ...r, [p.id]: true }))}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1px solid #1e293b" }}>{p.icon}</div>
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

        {}
        <Reveal from="right" delay={100}>
          <div style={{ marginTop: 14, marginBottom: 28 }}>
            <div onClick={() => setBoneOpen(o => !o)} style={{ ...card, cursor: "pointer", borderColor: boneOpen ? "#8b5cf655" : "#ef444440", background: boneOpen ? "linear-gradient(135deg,#0f172a,#1e293b)" : "linear-gradient(135deg,#1a0a0a,#1e293b)", boxShadow: boneOpen ? "0 0 40px #8b5cf610" : "0 0 30px #ef444408", transition: "all 0.5s ease", position: "relative", overflow: "hidden" }}>
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
                <>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, animation: "fadeSlide 0.6s ease" }}>
                    {[{ v: "14 млн", l: "с остеопорозом в РФ", c: "#ef4444" }, { v: "каждые 5 мин", l: "перелом бедра", c: "#f59e0b" }, { v: "0 симптомов", l: "до первого перелома", c: "#8b5cf6" }].map((s, i) => (
                      <div key={i} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: s.c + "08", border: `1px solid ${s.c}18`, textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: "#64748b", marginTop: 2, lineHeight: 1.3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#64748b", animation: "float 2.5s ease-in-out infinite" }}>
                    <span style={{ padding: "5px 14px", borderRadius: 20, background: "#ef44440a", border: "1px solid #ef444418" }}>👆 Нажмите — загляните внутрь своих костей</span>
                  </div>
                </>
              )}
            </div>

            {boneOpen && (
              <div style={{ animation: "fadeSlide 0.5s ease", marginTop: 2 }}>
                <div style={{ ...card, marginTop: 0, borderTop: "none", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", textAlign: "center" }}>Крутите пальцем · Щипком приближайте · Слайдер меняет плотность</p>
                  <BoneCrossSection density={bone / 100} height={280} />
                  <div style={{ padding: "12px 16px", borderRadius: 14, background: bd.color + "12", border: `1px solid ${bd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: bd.color }}>{bd.label}</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: bd.color, fontFamily: "'JetBrains Mono',monospace" }}>{bone}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{bd.detail}</div>
                  </div>
                  <input type="range" min={15} max={100} value={bone} onChange={e => setBone(+e.target.value)} style={{ width: "100%", accentColor: bd.color, height: 6, cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", marginTop: 2, marginBottom: 18 }}>
                    <span style={{ color: "#dc2626" }}>Тяжёлый</span><span style={{ color: "#ef4444" }}>Остеопороз</span><span style={{ color: "#f59e0b" }}>Остеопения</span><span style={{ color: "#10b981" }}>Норма</span>
                  </div>

                  <div style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 10 }}>НАЖМИТЕ — УЗНАЙТЕ ПОДРОБНОСТИ</div>
                  {[
                    { title: "Пик в 25–30 лет", text: "Костная масса достигает максимума к 30, потом только падает.", extra: "Каждый год — минус 0.5–1%. После менопаузы — до 3% в год. К 70 годам женщина может потерять до 40% костной массы.", bar: 30, color: "#f59e0b", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 17L8 12L12 15L17 8L21 4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 4H21V8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/><line x1="3" y1="21" x2="21" y2="21" stroke="#f59e0b" strokeWidth="1" opacity="0.3"/></svg> },
                    { title: "Перелом без причины", text: "При остеопорозе кость ломается от чиха, наклона, ступеньки.", extra: "2 из 3 переломов позвонков остаются незамеченными. Смертность после перелома бедра — до 20% в первый год.", bar: 66, color: "#ef4444", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L12 8L9 11L15 13L12 16L12 22" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1" opacity="0.2" strokeDasharray="3 3"/></svg> },
                    { title: "DXA видит невидимое", text: "Обычный рентген покажет проблему, когда потеряно 30%+ массы.", extra: "DXA ловит потерю от 1–2%. Разница в раннем обнаружении — 10 лет. 5 минут сканирования, доза облучения меньше чем от смартфона за день.", bar: 98, color: "#10b981", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#10b981" strokeWidth="2"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="3" stroke="#10b981" strokeWidth="1" opacity="0.4"/><circle cx="11" cy="11" r="1" fill="#10b981" opacity="0.6"/></svg> },
                  ].map((f, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); const det = e.currentTarget.querySelector(".fact-extra"); if (det) det.style.display = det.style.display === "none" ? "block" : "none"; }}
                      style={{ padding: 14, borderRadius: 14, background: f.color + "06", border: `1px solid ${f.color}15`, marginBottom: 10, cursor: "pointer", animation: `fadeSlide 0.5s ease ${i * 0.15}s both`, transition: "all 0.3s" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = f.color + "44"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = f.color + "15"; e.currentTarget.style.transform = "none"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color + "12", border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.svg}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{f.title}</span>
                          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginTop: 2 }}>{f.text}</div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}><path d="M3 4.5L6 7.5L9 4.5" stroke={f.color} strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>
                      <div className="fact-extra" style={{ display: "none", animation: "fadeSlide 0.3s ease", marginTop: 8, padding: "10px 12px", borderRadius: 10, background: f.color + "08", border: `1px solid ${f.color}12`, fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{f.extra}</div>
                      <div style={{ height: 4, borderRadius: 2, background: "#1e293b", overflow: "hidden", marginTop: 8 }}>
                        <div style={{ width: `${f.bar}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${f.color}88, ${f.color})`, transition: "width 1.5s ease" }} />
                      </div>
                    </div>
                  ))}

                  {}
                  <div style={{ padding: 18, borderRadius: 16, background: "linear-gradient(135deg,#1e1b4b15,#4c1d9508)", border: "1px solid #7c3aed20", marginTop: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>В какой вы группе риска?</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Нажмите свой возраст</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[{ age: "20–30", risk: "Низкий", desc: "Пик массы. Время инвестировать в кости.", c: "#10b981" }, { age: "30–45", risk: "Начало потерь", desc: "Потеря 0.5–1% в год уже идёт. Пора проверить.", c: "#22d3ee" }, { age: "45–55", risk: "Повышенный", desc: "Менопауза ускоряет потерю до 3% в год.", c: "#f59e0b" }, { age: "55+", risk: "Высокий", desc: "Каждые 5 мин — перелом бедра в России.", c: "#ef4444" }].map((a, i) => (
                        <div key={i} onClick={(e) => { e.stopPropagation(); const detail = e.currentTarget.querySelector(".age-detail"); if (detail) detail.style.display = detail.style.display === "none" ? "block" : "none"; }}
                          style={{ flex: "1 1 calc(50% - 6px)", minWidth: 130, padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: a.c + "0a", border: `1px solid ${a.c}22`, transition: "all 0.3s" }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = a.c + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = a.c + "22"; e.currentTarget.style.transform = "none"; }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: a.c, fontFamily: "'JetBrains Mono',monospace" }}>{a.age}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1", marginTop: 2 }}>{a.risk}</div>
                          <div className="age-detail" style={{ display: "none", fontSize: 11, color: "#94a3b8", marginTop: 6, lineHeight: 1.5, borderTop: `1px solid ${a.c}15`, paddingTop: 6, animation: "fadeSlide 0.3s ease" }}>{a.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", marginTop: 16, padding: "14px 0" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Узнать свою плотность костей точно</div>
                    <button onClick={() => navigate("/clinics")}
                      style={{ padding: "12px 28px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#8b5cf6,#a78bfa)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 0 20px #8b5cf620", transition: "transform 0.2s, box-shadow 0.2s" }}
                      onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 30px #8b5cf630"; }}
                      onMouseOut={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 0 20px #8b5cf620"; }}>
                      Записаться на DXA →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {}
        <Reveal from="left">
          <div style={{ ...card, background: "linear-gradient(135deg,#1e1b4b12,#4c1d9512)", border: "1px solid #7c3aed30", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8, letterSpacing: "0.1em" }}>КВИЗ</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>Два человека по 80 кг. У кого выше риск инфаркта?</h3>
            {[{ id: "a", t: "У того, кто выглядит полнее", ok: false }, { id: "b", t: "У того, у кого больше висцерального жира — даже если стройнее", ok: true }, { id: "c", t: "Риск одинаков — вес же одинаковый", ok: false }].map(o => {
              const s = quiz === o.id, g = quizDone && o.ok, b2 = quizDone && s && !o.ok;
              return <button key={o.id} onClick={() => { if (!quizDone) { setQuiz(o.id); setTimeout(() => setQuizDone(true), 400); } }} style={{ display: "block", width: "100%", padding: "13px 16px", marginBottom: 8, borderRadius: 12, textAlign: "left", background: g ? "#10b98115" : b2 ? "#ef444415" : s ? "#7c3aed15" : "#0f172a", border: `1.5px solid ${g ? "#10b981" : b2 ? "#ef4444" : s ? "#7c3aed" : "#1e293b"}`, color: "#e2e8f0", fontSize: 14, cursor: quizDone ? "default" : "pointer", transition: "all 0.3s" }}>{g && "✓ "}{b2 && "✗ "}{o.t}</button>;
            })}
            {quizDone && <div style={{ padding: 14, borderRadius: 12, background: "#10b98110", border: "1px solid #10b98130", animation: "fadeSlide 0.6s ease", marginTop: 6, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}><b style={{ color: "#10b981" }}>Висцеральный жир</b> невидим снаружи, но является предиктором №1 болезней сердца и диабета. <b>Единственный способ измерить точно — DXA-сканирование.</b></div>}
          </div>
        </Reveal>

        {}
        <Reveal from="bottom"><div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>МИФЫ</div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>5 опасных заблуждений</h2></div></Reveal>
        {MYTHS.map((m, i) => {
          const op = myth === i;
          return (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 70}>
              <div onClick={() => setMyth(op ? null : i)} style={{ ...card, marginBottom: 10, cursor: "pointer", padding: op ? 22 : 16, borderColor: op ? "#f59e0b30" : "#334155", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 24, transition: "transform 0.3s", transform: op ? "scale(1.25) rotate(-8deg)" : "none" }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", textDecoration: op ? "line-through" : "none", transition: "all 0.3s" }}>{m.myth}</div>
                    {op && <div style={{ animation: "fadeSlide 0.5s ease" }}><div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, marginTop: 8, marginBottom: 12 }}>{m.fact}</div><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#f59e0b0a", border: "1px solid #f59e0b1a" }}><span style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace" }}>{m.stat}</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{m.sub}</span></div></div>}
                  </div>
                  <span style={{ fontSize: 16, color: "#334155", transform: op ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▾</span>
                </div>
              </div>
            </Reveal>
          );
        })}

        {}
        <Reveal from="bottom" delay={80}><div style={{ marginTop: 18, marginBottom: 14 }}><div style={{ fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>НЕВИДИМЫЕ УГРОЗЫ</div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Чего не покажут весы и зеркало</h2></div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {THREATS.map((t, i) => (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
              <div style={{ ...card, padding: 14, borderColor: t.c + "1a", transition: "transform 0.3s, box-shadow 0.3s" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 10px 30px ${t.c}15`; }}
                onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.c, marginBottom: 4 }}>{t.what}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.55, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ fontSize: 10, color: t.c, padding: "5px 8px", borderRadius: 6, background: t.c + "0a", lineHeight: 1.4 }}>⚡ {t.tag}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {}
        <Reveal from="bottom">
          <div style={{ borderRadius: 22, padding: 32, textAlign: "center", background: "linear-gradient(135deg,#0891b210,#10b98110)", border: "1px solid #22d3ee1a", marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 14, animation: "float 3s ease-in-out infinite" }}>◎</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#e2e8f0,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Узнайте свои реальные цифры</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.55, margin: "0 0 22px" }}>Бесплатный расчёт за 3 минуты — или точный DXA-анализ</p>
            {[{ label: "Рассчитать состав тела →", bg: "linear-gradient(135deg,#0891b2,#22d3ee)", s: "#22d3ee", href: "/analyzer" }, { label: "Записаться на DXA", bg: "linear-gradient(135deg,#10b981,#34d399)", s: "#10b981", href: "/clinics" }].map((b, i) => (
              <button key={i} onClick={() => navigate(b.href)}
                style={{ display: "block", width: "100%", padding: 15, marginBottom: 8, border: "none", borderRadius: 14, background: b.bg, color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", boxShadow: `0 0 20px ${b.s}20`, transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 6px 30px ${b.s}30`; }}
                onMouseOut={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 0 20px ${b.s}20`; }}>
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
