import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const XRAY_DATA = [
  {
    id: "anna", name: "Анна", age: 34, shape: "thin",
    fat: 36, muscle: 28, bone: 4, visceral: 14,
    verdict: "Skinny Fat", desc: "Скрытое ожирение", vc: "#ef4444",
    risk: "Риск диабета x2.4, сердечно-сосудистых x1.8",
    fatLayer: 18, visceralGlow: 0.5,
  },
  {
    id: "dima", name: "Дмитрий", age: 28, shape: "athletic",
    fat: 14, muscle: 52, bone: 6, visceral: 4,
    verdict: "Атлет", desc: "Здоровый состав", vc: "#10b981",
    risk: "Все показатели в норме",
    fatLayer: 5, visceralGlow: 0,
  },
];

/* ═══════════════════════════════════════════════════════════════
   SVG BODY PATHS (viewBox 300×460)
   ═══════════════════════════════════════════════════════════════ */
const BODY_PATHS = {
  athletic: [
    "M150,18",
    "C166,18 170,32 168,42", "C166,52 161,56 158,60",
    "L158,67",
    "Q174,71 194,76", "Q210,80 222,84",
    "Q230,88 234,98",
    "Q240,116 240,140", "Q240,162 236,180", "Q232,200 230,215",
    "L226,218",
    "Q228,200 228,180", "Q230,160 228,140", "Q226,118 220,102",
    "Q214,94 204,90",
    "Q196,90 192,106", "Q188,136 186,166", "Q184,192 186,212",
    "Q188,230 192,244",
    "Q198,266 200,290", "Q202,312 198,330",
    "Q196,342 196,354",
    "Q198,374 194,398", "Q190,418 186,434",
    "L172,444",
    "L168,436",
    "Q170,418 170,398", "Q170,372 168,348",
    "Q164,322 160,302", "Q156,282 152,266",
    "L150,258",
    "L148,266",
    "Q144,282 140,302", "Q136,322 132,348",
    "Q130,372 130,398", "Q130,418 132,436",
    "L128,444",
    "L114,434",
    "Q110,418 106,398", "Q102,374 104,354",
    "Q104,342 102,330",
    "Q98,312 100,290", "Q102,266 108,244",
    "Q112,230 114,212",
    "Q116,192 114,166", "Q112,136 108,106",
    "Q104,90 96,90",
    "Q86,94 80,102",
    "Q74,118 72,140", "Q70,162 72,180", "Q72,200 74,218",
    "L70,218",
    "Q68,200 66,180", "Q60,162 60,140", "Q60,116 66,98",
    "Q70,88 78,84",
    "Q90,80 106,76", "Q126,71 142,67",
    "L142,60",
    "C139,56 134,52 132,42", "C130,32 134,18 150,18",
    "Z",
  ].join(" "),

  thin: [
    "M150,18",
    "C164,18 167,30 166,40", "C165,50 160,55 157,59",
    "L157,66",
    "Q170,70 186,76", "Q198,80 206,84",
    "Q213,88 216,98",
    "Q222,118 222,140", "Q222,160 218,178", "Q216,198 214,212",
    "L210,215",
    "Q212,200 212,180", "Q214,160 212,140", "Q210,120 206,106",
    "Q200,94 192,90",
    "Q186,90 183,102", "Q180,128 178,158", "Q176,184 178,208",
    "Q180,226 184,242",
    "Q188,264 190,288", "Q192,312 190,328",
    "Q188,340 188,352",
    "Q190,374 188,398", "Q184,418 180,432",
    "L168,444",
    "L166,436",
    "Q166,418 166,398", "Q166,374 164,352",
    "Q162,332 158,310", "Q156,290 152,274",
    "L150,264",
    "L148,274",
    "Q144,290 142,310", "Q138,332 136,352",
    "Q134,374 134,398", "Q134,418 134,436",
    "L132,444",
    "L120,432",
    "Q116,418 112,398", "Q110,374 112,352",
    "Q112,340 110,328",
    "Q108,312 110,288", "Q112,264 116,242",
    "Q120,226 122,208",
    "Q124,184 122,158", "Q120,128 117,102",
    "Q114,90 108,90",
    "Q100,94 94,106",
    "Q90,120 88,140", "Q86,160 88,180", "Q88,200 90,215",
    "L86,212",
    "Q84,198 78,178", "Q78,160 78,140", "Q78,118 84,98",
    "Q87,88 94,84",
    "Q102,80 114,76", "Q130,70 143,66",
    "L143,59",
    "C140,55 135,50 134,40", "C133,30 136,18 150,18",
    "Z",
  ].join(" "),
};

/* ═══════════════════════════════════════════════════════════════
   SKELETON CONFIG per shape
   ═══════════════════════════════════════════════════════════════ */
const SKELETON = {
  athletic: {
    skull: { cx: 150, cy: 37, rx: 14, ry: 17 },
    spine: { x1: 150, y1: 64, x2: 150, y2: 226 },
    clavR: "M150,74 Q172,68 200,80",
    clavL: "M150,74 Q128,68 100,80",
    ribs: [
      { y: 96, rx: 32 },
      { y: 112, rx: 30 },
      { y: 128, rx: 27 },
      { y: 144, rx: 24 },
    ],
    pelvis: "M130,216 Q136,204 150,200 Q164,204 170,216 Q164,232 150,236 Q136,232 130,216",
    femurR: { x1: 164, y1: 230, x2: 170, y2: 326 },
    femurL: { x1: 136, y1: 230, x2: 130, y2: 326 },
    tibiaR: { x1: 170, y1: 334, x2: 174, y2: 418 },
    tibiaL: { x1: 130, y1: 334, x2: 126, y2: 418 },
    kneeR: { cx: 170, cy: 330, r: 5 },
    kneeL: { cx: 130, cy: 330, r: 5 },
    humerusR: { x1: 200, y1: 80, x2: 230, y2: 158 },
    humerusL: { x1: 100, y1: 80, x2: 70, y2: 158 },
    radiusR: { x1: 230, y1: 162, x2: 228, y2: 214 },
    radiusL: { x1: 70, y1: 162, x2: 72, y2: 214 },
    elbowR: { cx: 230, cy: 160, r: 4 },
    elbowL: { cx: 70, cy: 160, r: 4 },
  },
  thin: {
    skull: { cx: 150, cy: 37, rx: 13, ry: 16 },
    spine: { x1: 150, y1: 64, x2: 150, y2: 226 },
    clavR: "M150,74 Q166,68 190,80",
    clavL: "M150,74 Q134,68 110,80",
    ribs: [
      { y: 96, rx: 26 },
      { y: 112, rx: 24 },
      { y: 128, rx: 22 },
      { y: 144, rx: 20 },
    ],
    pelvis: "M134,216 Q140,204 150,200 Q160,204 166,216 Q160,232 150,236 Q140,232 134,216",
    femurR: { x1: 160, y1: 230, x2: 164, y2: 324 },
    femurL: { x1: 140, y1: 230, x2: 136, y2: 324 },
    tibiaR: { x1: 164, y1: 332, x2: 168, y2: 418 },
    tibiaL: { x1: 136, y1: 332, x2: 132, y2: 418 },
    kneeR: { cx: 164, cy: 328, r: 4.5 },
    kneeL: { cx: 136, cy: 328, r: 4.5 },
    humerusR: { x1: 190, y1: 80, x2: 214, y2: 158 },
    humerusL: { x1: 110, y1: 80, x2: 86, y2: 158 },
    radiusR: { x1: 214, y1: 162, x2: 212, y2: 212 },
    radiusL: { x1: 86, y1: 162, x2: 88, y2: 212 },
    elbowR: { cx: 214, cy: 160, r: 3.5 },
    elbowL: { cx: 86, cy: 160, r: 3.5 },
  },
};

/* ═══════════════════════════════════════════════════════════════
   MUSCLE CONFIG per shape
   ═══════════════════════════════════════════════════════════════ */
const MUSCLES = {
  athletic: {
    pecs: [
      { cx: 134, cy: 100, rx: 18, ry: 10 },
      { cx: 166, cy: 100, rx: 18, ry: 10 },
    ],
    abs: [
      { x: 141, y: 132, w: 18, h: 10, r: 3 },
      { x: 141, y: 148, w: 18, h: 10, r: 3 },
      { x: 141, y: 164, w: 18, h: 10, r: 3 },
    ],
    delts: [
      { cx: 212, cy: 90, rx: 12, ry: 8 },
      { cx: 88, cy: 90, rx: 12, ry: 8 },
    ],
    biceps: [
      { cx: 228, cy: 130, rx: 8, ry: 15 },
      { cx: 72, cy: 130, rx: 8, ry: 15 },
    ],
    quads: [
      { cx: 168, cy: 278, rx: 14, ry: 30 },
      { cx: 132, cy: 278, rx: 14, ry: 30 },
    ],
    calves: [
      { cx: 174, cy: 374, rx: 10, ry: 22 },
      { cx: 126, cy: 374, rx: 10, ry: 22 },
    ],
    opacity: 0.7,
  },
  thin: {
    pecs: [
      { cx: 139, cy: 100, rx: 12, ry: 6 },
      { cx: 161, cy: 100, rx: 12, ry: 6 },
    ],
    abs: [],
    delts: [
      { cx: 200, cy: 90, rx: 8, ry: 5 },
      { cx: 100, cy: 90, rx: 8, ry: 5 },
    ],
    biceps: [
      { cx: 212, cy: 130, rx: 5, ry: 10 },
      { cx: 88, cy: 130, rx: 5, ry: 10 },
    ],
    quads: [
      { cx: 162, cy: 278, rx: 10, ry: 24 },
      { cx: 138, cy: 278, rx: 10, ry: 24 },
    ],
    calves: [
      { cx: 166, cy: 374, rx: 7, ry: 16 },
      { cx: 134, cy: 374, rx: 7, ry: 16 },
    ],
    opacity: 0.3,
  },
};

/* Visceral fat blobs in belly area */
const VISCERAL_BLOBS = [
  { cx: 150, cy: 155, rx: 24, ry: 18 },
  { cx: 138, cy: 168, rx: 18, ry: 13 },
  { cx: 164, cy: 172, rx: 16, ry: 11 },
  { cx: 147, cy: 182, rx: 20, ry: 14 },
  { cx: 158, cy: 160, rx: 12, ry: 9 },
];

/* ═══════════════════════════════════════════════════════════════
   ANNOTATIONS
   ═══════════════════════════════════════════════════════════════ */
const ANNOTATIONS = [
  {
    id: "muscles", threshold: 35, side: "right",
    label: "Мышцы", valueKey: "muscle", unit: "%",
    bodyPt: { athletic: { x: 180, y: 100 }, thin: { x: 170, y: 100 } },
    labelX: 232, labelY: 96,
  },
  {
    id: "bicep", threshold: 40, side: "left",
    label: "Бицепс", onlyShape: "athletic",
    bodyPt: { athletic: { x: 72, y: 130 }, thin: { x: 88, y: 130 } },
    labelX: 8, labelY: 126,
  },
  {
    id: "visceral", threshold: 45, side: "right",
    label: "Висцер. жир", icon: true, valueKey: "visceral", unit: "",
    onlyWhen: (p) => p.visceral > 6,
    bodyPt: { athletic: { x: 178, y: 166 }, thin: { x: 168, y: 166 } },
    labelX: 224, labelY: 162,
  },
  {
    id: "skeleton", threshold: 50, side: "left",
    label: "Скелет", valueKey: "bone", unit: "%",
    bodyPt: { athletic: { x: 130, y: 148 }, thin: { x: 136, y: 148 } },
    labelX: 8, labelY: 144,
  },
  {
    id: "subfat", threshold: 55, side: "left",
    label: "Подкож. жир", valueKey: "fat", unit: "%",
    onlyWhen: (p) => p.fat > 20,
    bodyPt: { athletic: { x: 116, y: 200 }, thin: { x: 124, y: 200 } },
    labelX: 4, labelY: 196,
  },
];

/* ═══════════════════════════════════════════════════════════════
   STAT CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const STAT_CARDS = [
  { key: "fat", label: "Жир", unit: "%", icon: "💧", dangerMin: 25, greenMax: 18, yellowMax: 28, visAt: 0 },
  { key: "muscle", label: "Мышцы", unit: "%", icon: "💪", dangerMax: 32, invertColor: true, visAt: 20 },
  { key: "bone", label: "Кости", unit: "%", icon: "🦴", visAt: 40 },
  { key: "visceral", label: "Висцер.", unit: "", icon: "🔥", dangerMin: 8, greenMax: 5, yellowMax: 10, visAt: 60 },
];

/* ═══════════════════════════════════════════════════════════════
   CSS KEYFRAMES (injected once)
   ═══════════════════════════════════════════════════════════════ */
const CSS_KEYFRAMES = `
@keyframes bcAnnotSlideR {
  from { opacity:0; transform:translateX(24px); }
  to { opacity:1; transform:translateX(0); }
}
@keyframes bcAnnotSlideL {
  from { opacity:0; transform:translateX(-24px); }
  to { opacity:1; transform:translateX(0); }
}
@keyframes bcVerdictIn {
  from { opacity:0; transform:translateY(18px) scale(0.9); }
  to { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes bcPopIn {
  0% { transform:scale(0); }
  50% { transform:scale(1.35); }
  100% { transform:scale(1); }
}
@keyframes bcShimmer {
  0% { background-position:-200px 0; }
  100% { background-position:200px 0; }
}
@keyframes bcPulseGlow {
  0%,100% { filter:drop-shadow(0 0 4px currentColor); opacity:0.8; }
  50% { filter:drop-shadow(0 0 14px currentColor); opacity:1; }
}
@keyframes bcPulseVisceral {
  0%,100% { opacity:0.45; }
  50% { opacity:0.75; }
}
@keyframes bcScanDot {
  0%,100% { r:3; opacity:0.7; }
  50% { r:5; opacity:1; }
}
@keyframes bcFloat {
  0%,100% { transform:translateY(0); }
  50% { transform:translateY(-7px); }
}
`;

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */
function useCountUp(target, duration, active, delay = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const timer = useRef(null);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    timer.current = setTimeout(() => {
      const s = performance.now();
      const tick = (now) => {
        const p = Math.min((now - s) / duration, 1);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setVal(Math.round(e * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, active, delay]);
  return val;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function valueToColor(value, greenMax, yellowMax) {
  if (value <= greenMax) return "#10b981";
  if (value >= yellowMax) {
    const t = Math.min((value - yellowMax) / 15, 1);
    const r = Math.round(251 + (239 - 251) * t);
    const g = Math.round(191 + (68 - 191) * t);
    const b = Math.round(36 + (68 - 36) * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (value - greenMax) / (yellowMax - greenMax);
  const r = Math.round(16 + (251 - 16) * t);
  const g = Math.round(185 + (191 - 185) * t);
  const b = Math.round(129 + (36 - 129) * t);
  return `rgb(${r},${g},${b})`;
}

function muscleColor(v) {
  if (v >= 42) return "#10b981";
  if (v >= 32) return "#fbbf24";
  return "#ef4444";
}

function statColor(card, person) {
  if (card.invertColor) return muscleColor(person[card.key]);
  if (card.greenMax != null) return valueToColor(person[card.key], card.greenMax, card.yellowMax);
  return "#22d3ee";
}

function isDanger(card, person) {
  if (card.dangerMin != null && person[card.key] >= card.dangerMin) return true;
  if (card.dangerMax != null && person[card.key] <= card.dangerMax) return true;
  return false;
}

function annotColor(annot, person) {
  if (annot.id === "muscles") return muscleColor(person.muscle);
  if (annot.id === "bicep") return "#10b981";
  if (annot.id === "visceral") return "#fbbf24";
  if (annot.id === "skeleton") return "#94a3b8";
  if (annot.id === "subfat") return "#ef4444";
  return "#22d3ee";
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function BodyComparePage() {
  /* ─── State ─── */
  const [personIdx, setPersonIdx] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanPos, setScanPos] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef(null);

  const person = XRAY_DATA[personIdx];
  const shape = person.shape;
  const bodyPath = BODY_PATHS[shape];
  const skel = SKELETON[shape];
  const musc = MUSCLES[shape];

  /* ─── Animated count-up values ─── */
  const fatVal = useCountUp(person.fat, 1200, scanComplete, 100);
  const muscleVal = useCountUp(person.muscle, 1300, scanComplete, 250);
  const boneVal = useCountUp(person.bone, 1100, scanComplete, 400);
  const visceralVal = useCountUp(person.visceral, 1400, scanComplete, 550);
  const countVals = { fat: fatVal, muscle: muscleVal, bone: boneVal, visceral: visceralVal };

  /* ─── Scan animation ─── */
  useEffect(() => {
    if (!scanning) return;
    const start = performance.now();
    const duration = 2800;
    const tick = (now) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = p < 0.5
        ? 4 * p * p * p
        : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setScanPos(eased * 100);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setScanning(false);
        setScanComplete(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [scanning]);

  /* ─── Handlers ─── */
  const switchPerson = useCallback((idx) => {
    if (idx === personIdx || scanning) return;
    setTransitioning(true);
    setTimeout(() => {
      setPersonIdx(idx);
      setScanPos(0);
      setScanning(false);
      setScanComplete(false);
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  }, [personIdx, scanning]);

  const startScan = useCallback(() => {
    if (scanning) return;
    setScanPos(0);
    setScanComplete(false);
    setScanning(true);
  }, [scanning]);

  /* ─── Derived ─── */
  const scanY = (scanPos / 100) * 460;
  const isActive = scanning || scanComplete;
  const btnLabel = scanning ? "Сканирование..." : scanComplete ? "Сканировать снова" : "Запустить рентген";

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      minHeight: "100vh", background: "#080e1b",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "24px 16px 48px", fontFamily: "'Outfit',system-ui,sans-serif",
      overflow: "hidden",
    }}>
      <style>{CSS_KEYFRAMES}</style>

      {/* ───── WEIGHT BADGE ───── */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
        borderRadius: 100, padding: "8px 20px", marginBottom: 20,
        animation: "fadeSlide 0.6s ease both",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round">
          <path d="M6 18L3 12l3-6h12l3 6-3 6H6z" />
          <line x1="12" y1="6" x2="12" y2="18" />
        </svg>
        <span style={{ color: "#22d3ee", fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>
          68 кг — одинаково
        </span>
      </div>

      {/* ───── PERSON TABS ───── */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 24,
        animation: "fadeSlide 0.6s 0.1s ease both",
      }}>
        {XRAY_DATA.map((p, i) => {
          const active = i === personIdx;
          return (
            <button key={p.id} onClick={() => switchPerson(i)} style={{
              background: active ? "rgba(15,23,42,0.9)" : "rgba(15,23,42,0.4)",
              border: `1.5px solid ${active ? p.vc : "#1e293b"}`,
              borderRadius: 12, padding: "10px 22px",
              color: active ? "#f1f5f9" : "#64748b",
              fontSize: 15, fontWeight: active ? 700 : 500,
              cursor: "pointer", transition: "all 0.25s ease",
              boxShadow: active ? `0 0 16px ${p.vc}33, inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: active ? p.vc : "#334155",
                boxShadow: active ? `0 0 8px ${p.vc}` : "none",
                transition: "all 0.3s",
              }} />
              {p.name}, {p.age}
            </button>
          );
        })}
      </div>

      {/* ───── SVG BODY AREA ───── */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 340,
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "scale(0.95)" : "scale(1)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        marginBottom: 20,
      }}>
        <svg
          viewBox="0 0 300 460"
          width="100%"
          style={{ display: "block" }}
        >
          <defs>
            {/* Body shape for reuse */}
            <path id="bc-bodyShape" d={bodyPath} />

            {/* Clip to body outline */}
            <clipPath id="bc-bodyClip">
              <use href="#bc-bodyShape" />
            </clipPath>

            {/* Mask for scan progress */}
            <mask id="bc-scanMask">
              <rect x="0" y="0" width="300" height={scanY} fill="white" />
            </mask>

            {/* Muscle gradient */}
            <linearGradient id="bc-muscleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Visceral fat gradient */}
            <radialGradient id="bc-visceralGrad">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>

            {/* Scan line horizontal gradient */}
            <linearGradient id="bc-scanLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="20%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="80%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>

            {/* Scan trail gradient (vertical, above line) */}
            <linearGradient id="bc-scanTrail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.12" />
            </linearGradient>

            {/* Glow filter for scan line */}
            <filter id="bc-glowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glow filter for visceral fat */}
            <filter id="bc-glowYellow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Background grid lines (subtle) ── */}
          <g opacity="0.04" stroke="#22d3ee">
            {[...Array(24)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="300" y2={i * 20} strokeWidth="0.5" />
            ))}
            {[...Array(16)].map((_, i) => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="460" strokeWidth="0.5" />
            ))}
          </g>

          {/* ── Body outline (always visible, faint) ── */}
          <use href="#bc-bodyShape" fill="none" stroke="#1e293b" strokeWidth="1.5" />

          {/* ── Scanned internals (masked + clipped) ── */}
          {(scanning || scanComplete) && (
            <g mask="url(#bc-scanMask)" clipPath="url(#bc-bodyClip)">
              {/* Dark body fill */}
              <use href="#bc-bodyShape" fill="#0a1628" />

              {/* ── Layer 1: MUSCLES ── */}
              <g opacity={musc.opacity} fill="url(#bc-muscleGrad)">
                {/* Pectorals */}
                {musc.pecs.map((m, i) => (
                  <ellipse key={`pec${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {/* Abs */}
                {musc.abs.map((m, i) => (
                  <rect key={`abs${i}`} x={m.x} y={m.y} width={m.w} height={m.h} rx={m.r} />
                ))}
                {/* Delts */}
                {musc.delts.map((m, i) => (
                  <ellipse key={`delt${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {/* Biceps */}
                {musc.biceps.map((m, i) => (
                  <ellipse key={`bic${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {/* Quads */}
                {musc.quads.map((m, i) => (
                  <ellipse key={`quad${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {/* Calves */}
                {musc.calves.map((m, i) => (
                  <ellipse key={`calf${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
              </g>

              {/* ── Layer 2: SKELETON ── */}
              <g stroke="#c8d4e0" fill="none" strokeWidth="1.5" opacity="0.55">
                {/* Skull */}
                <ellipse cx={skel.skull.cx} cy={skel.skull.cy} rx={skel.skull.rx} ry={skel.skull.ry}
                  stroke="#e2e8f0" strokeWidth="1.2" />
                {/* Spine */}
                <line x1={skel.spine.x1} y1={skel.spine.y1} x2={skel.spine.x2} y2={skel.spine.y2}
                  strokeWidth="2.5" stroke="#d1d9e3" />
                {/* Clavicles */}
                <path d={skel.clavR} strokeWidth="1.8" />
                <path d={skel.clavL} strokeWidth="1.8" />
                {/* Ribs */}
                {skel.ribs.map((rib, i) => (
                  <g key={`rib${i}`}>
                    <path d={`M150,${rib.y} Q${150 + rib.rx * 0.65},${rib.y - 5} ${150 + rib.rx},${rib.y + 4}`} />
                    <path d={`M150,${rib.y} Q${150 - rib.rx * 0.65},${rib.y - 5} ${150 - rib.rx},${rib.y + 4}`} />
                  </g>
                ))}
                {/* Pelvis */}
                <path d={skel.pelvis} strokeWidth="1.6" />
                {/* Femurs */}
                <line x1={skel.femurR.x1} y1={skel.femurR.y1} x2={skel.femurR.x2} y2={skel.femurR.y2} strokeWidth="2.2" />
                <line x1={skel.femurL.x1} y1={skel.femurL.y1} x2={skel.femurL.x2} y2={skel.femurL.y2} strokeWidth="2.2" />
                {/* Knees */}
                <circle cx={skel.kneeR.cx} cy={skel.kneeR.cy} r={skel.kneeR.r} stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx={skel.kneeL.cx} cy={skel.kneeL.cy} r={skel.kneeL.r} stroke="#cbd5e1" strokeWidth="1.2" />
                {/* Tibias */}
                <line x1={skel.tibiaR.x1} y1={skel.tibiaR.y1} x2={skel.tibiaR.x2} y2={skel.tibiaR.y2} strokeWidth="1.8" />
                <line x1={skel.tibiaL.x1} y1={skel.tibiaL.y1} x2={skel.tibiaL.x2} y2={skel.tibiaL.y2} strokeWidth="1.8" />
                {/* Humerus (upper arm bones) */}
                <line x1={skel.humerusR.x1} y1={skel.humerusR.y1} x2={skel.humerusR.x2} y2={skel.humerusR.y2} strokeWidth="1.8" />
                <line x1={skel.humerusL.x1} y1={skel.humerusL.y1} x2={skel.humerusL.x2} y2={skel.humerusL.y2} strokeWidth="1.8" />
                {/* Elbows */}
                <circle cx={skel.elbowR.cx} cy={skel.elbowR.cy} r={skel.elbowR.r} stroke="#cbd5e1" strokeWidth="1" />
                <circle cx={skel.elbowL.cx} cy={skel.elbowL.cy} r={skel.elbowL.r} stroke="#cbd5e1" strokeWidth="1" />
                {/* Radius/Ulna (forearm bones) */}
                <line x1={skel.radiusR.x1} y1={skel.radiusR.y1} x2={skel.radiusR.x2} y2={skel.radiusR.y2} strokeWidth="1.4" />
                <line x1={skel.radiusL.x1} y1={skel.radiusL.y1} x2={skel.radiusL.x2} y2={skel.radiusL.y2} strokeWidth="1.4" />
              </g>

              {/* ── Layer 3: VISCERAL FAT ── */}
              {person.visceral > 6 && (
                <g style={{ mixBlendMode: "screen" }}
                  filter="url(#bc-glowYellow)"
                  opacity="1">
                  {VISCERAL_BLOBS.map((blob, i) => (
                    <ellipse
                      key={`vfat${i}`}
                      cx={blob.cx} cy={blob.cy} rx={blob.rx} ry={blob.ry}
                      fill="url(#bc-visceralGrad)"
                      style={{ animation: `bcPulseVisceral 3s ease-in-out ${i * 0.4}s infinite` }}
                    />
                  ))}
                </g>
              )}

              {/* ── Layer 4: SUBCUTANEOUS FAT ── */}
              <use
                href="#bc-bodyShape"
                fill="none"
                stroke="rgba(244,114,182,0.25)"
                strokeWidth={person.fatLayer}
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* ── SCAN LINE ── */}
          {scanning && (
            <g>
              {/* Trail above scan line */}
              <rect x="0" y={Math.max(0, scanY - 60)} width="300" height={60} fill="url(#bc-scanTrail)" />

              {/* Main scan line */}
              <rect x="0" y={scanY - 1.5} width="300" height="3"
                fill="url(#bc-scanLineGrad)" filter="url(#bc-glowCyan)" />

              {/* Edge dots */}
              <circle cx="8" cy={scanY} r="4" fill="#22d3ee" filter="url(#bc-glowCyan)">
                <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="292" cy={scanY} r="4" fill="#22d3ee" filter="url(#bc-glowCyan)">
                <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* ── ANNOTATIONS ── */}
          {(scanning || scanComplete) && ANNOTATIONS.map((ann) => {
            const visible = scanPos >= ann.threshold;
            if (!visible) return null;
            if (ann.onlyShape && ann.onlyShape !== shape) return null;
            if (ann.onlyWhen && !ann.onlyWhen(person)) return null;

            const color = annotColor(ann, person);
            const bp = ann.bodyPt[shape];
            const isRight = ann.side === "right";
            const animName = isRight ? "bcAnnotSlideR" : "bcAnnotSlideL";
            const value = ann.valueKey ? person[ann.valueKey] : null;
            const label = ann.icon ? `\u26A0 ${ann.label}` : ann.label;
            const textVal = value != null ? ` ${value}${ann.unit}` : "";
            const fullLabel = label + textVal;
            const boxW = fullLabel.length * 5.5 + 12;
            const boxH = 16;
            const bx = isRight ? ann.labelX : ann.labelX;
            const by = ann.labelY;

            return (
              <g key={ann.id}
                style={{
                  animation: `${animName} 0.45s cubic-bezier(0.34,1.56,0.64,1) both`,
                }}>
                {/* Dashed connector line */}
                <line
                  x1={bp.x} y1={bp.y}
                  x2={isRight ? bx : bx + boxW}
                  y2={by + boxH / 2}
                  stroke={color} strokeWidth="0.8"
                  strokeDasharray="3,3" opacity="0.6"
                />
                {/* Pulsing dot on body */}
                <circle cx={bp.x} cy={bp.y} r="3" fill={color} opacity="0.9">
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Label background */}
                <rect
                  x={bx} y={by}
                  width={boxW} height={boxH} rx="4"
                  fill="rgba(8,14,27,0.85)"
                  stroke={color} strokeWidth="0.6" opacity="0.95"
                />
                {/* Label text */}
                <text
                  x={bx + 6} y={by + 11.5}
                  fill={color}
                  fontSize="8" fontWeight="600"
                  fontFamily="'Outfit',system-ui,sans-serif"
                >
                  {fullLabel}
                </text>
              </g>
            );
          })}

          {/* ── CORNER HUD ELEMENTS ── */}
          <g opacity="0.3" fill="none" stroke="#22d3ee" strokeWidth="1">
            <polyline points="2,12 2,2 12,2" />
            <polyline points="288,2 298,2 298,12" />
            <polyline points="298,448 298,458 288,458" />
            <polyline points="12,458 2,458 2,448" />
          </g>
          {isActive && (
            <text x="150" y="456" textAnchor="middle" fill="#22d3ee" fontSize="6" opacity="0.3"
              fontFamily="'JetBrains Mono',monospace">
              DXA BODY COMPOSITION SCAN
            </text>
          )}
        </svg>

        {/* ── HTML scan line glow overlay ── */}
        {scanning && (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: `${scanPos}%`,
            height: 4,
            background: "linear-gradient(90deg, transparent, #22d3ee, #10b981, #22d3ee, transparent)",
            boxShadow: "0 0 18px #22d3ee, 0 0 40px rgba(34,211,238,0.4)",
            pointerEvents: "none",
            transition: "none",
          }} />
        )}
      </div>

      {/* ───── STAT CARDS ───── */}
      <div style={{
        display: "flex", gap: 8, width: "100%", maxWidth: 380,
        marginBottom: 20,
        animation: "fadeSlide 0.6s 0.2s ease both",
      }}>
        {STAT_CARDS.map((card) => {
          const cardVisible = scanComplete || (scanning && scanPos >= card.visAt);
          const color = statColor(card, person);
          const danger = scanComplete && isDanger(card, person);
          const displayVal = scanComplete ? countVals[card.key] : 0;
          const counting = scanComplete && countVals[card.key] < person[card.key];

          return (
            <div key={card.key} style={{
              flex: 1,
              background: "#0f172a",
              borderRadius: 10,
              border: `1px solid ${cardVisible ? color + "44" : "#1e293b"}`,
              borderBottom: `3px solid ${cardVisible ? (scanning ? "#22d3ee" : color) : "#1e293b"}`,
              padding: "10px 6px 8px",
              textAlign: "center",
              opacity: cardVisible ? 1 : 0.35,
              transform: cardVisible ? "translateY(0)" : "translateY(6px)",
              transition: "all 0.4s ease",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Shimmer overlay while counting */}
              {counting && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(90deg, transparent, ${color}11, transparent)`,
                  backgroundSize: "200px 100%",
                  animation: "bcShimmer 1.2s linear infinite",
                  pointerEvents: "none",
                }} />
              )}

              {/* Icon */}
              <div style={{ fontSize: 16, marginBottom: 2 }}>{card.icon}</div>

              {/* Value */}
              <div style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 18, fontWeight: 800,
                color: cardVisible && scanComplete ? color : "#475569",
                transition: "color 0.3s",
                position: "relative",
                display: "inline-flex", alignItems: "center", gap: 3,
              }}>
                {scanComplete ? displayVal : "—"}
                {card.unit && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{card.unit}</span>}
                {/* Danger badge */}
                {danger && (
                  <span style={{
                    position: "absolute", top: -4, right: -14,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#ef4444", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "bcPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                    boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                  }}>!</span>
                )}
              </div>

              {/* Label */}
              <div style={{
                fontSize: 10, color: "#64748b", fontWeight: 600,
                marginTop: 2, letterSpacing: 0.3,
              }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* ───── SCAN BUTTON ───── */}
      {!scanning && !scanComplete && (
        <div style={{
          textAlign: "center", marginBottom: 4,
          animation: "bcFloat 3s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
            нажмите чтобы просканировать
          </span>
        </div>
      )}
      <button onClick={startScan} style={{
        background: scanning
          ? "linear-gradient(135deg, #0f172a, #1e293b)"
          : "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(16,185,129,0.12))",
        border: `1.5px solid ${scanning ? "#22d3ee55" : "#22d3ee44"}`,
        borderRadius: 14, padding: "14px 32px",
        color: scanning ? "#22d3ee" : "#e2e8f0",
        fontSize: 15, fontWeight: 700,
        cursor: scanning ? "default" : "pointer",
        transition: "all 0.3s ease",
        boxShadow: scanning
          ? "0 0 24px rgba(34,211,238,0.2), inset 0 0 20px rgba(34,211,238,0.05)"
          : "0 0 16px rgba(34,211,238,0.1)",
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 20,
        animation: "fadeSlide 0.6s 0.3s ease both",
      }}>
        {scanning ? (
          <span style={{
            display: "inline-block", width: 18, height: 18,
            border: "2.5px solid #22d3ee44", borderTopColor: "#22d3ee",
            borderRadius: "50%",
            animation: "spin3d 1s linear infinite",
          }} />
        ) : scanComplete ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        )}
        {btnLabel}
      </button>

      {/* ───── VERDICT ───── */}
      {scanComplete && (
        <div style={{
          textAlign: "center",
          animation: "bcVerdictIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          marginBottom: 20, maxWidth: 380,
        }}>
          {/* Verdict icon */}
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: person.vc + "18",
            border: `2px solid ${person.vc}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            color: person.vc,
            animation: "bcPulseGlow 2.5s ease-in-out infinite",
          }}>
            {person.shape === "athletic" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          {/* Verdict title */}
          <div style={{
            fontSize: 22, fontWeight: 800, color: person.vc,
            marginBottom: 4, letterSpacing: 0.5,
          }}>
            {person.verdict}
          </div>
          <div style={{
            fontSize: 14, color: "#94a3b8", fontWeight: 600,
            marginBottom: 10,
          }}>
            {person.desc}
          </div>

          {/* Risk badge */}
          <div style={{
            display: "inline-block",
            background: person.vc + "10",
            border: `1px solid ${person.vc}30`,
            borderRadius: 8, padding: "8px 16px",
            fontSize: 12, color: person.vc === "#ef4444" ? "#fca5a5" : "#6ee7b7",
            fontWeight: 500,
          }}>
            {person.risk}
          </div>
        </div>
      )}

      {/* ───── PUNCHLINE ───── */}
      <div style={{
        textAlign: "center", maxWidth: 380,
        padding: "16px 20px",
        borderTop: "1px solid #1e293b22",
        animation: "fadeSlide 0.6s 0.4s ease both",
      }}>
        <p style={{
          fontSize: 14, lineHeight: 1.7,
          color: "#64748b", fontWeight: 500, margin: 0,
        }}>
          <span style={{ color: "#94a3b8" }}>Одинаковый вес. Одинаковый ИМТ.</span>
          <br />
          Весы не покажут.{" "}
          <span style={{
            color: "#22d3ee", fontWeight: 700,
            textShadow: "0 0 12px rgba(34,211,238,0.3)",
          }}>
            DXA — покажет.
          </span>
        </p>
      </div>
    </div>
  );
}
