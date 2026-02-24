import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// SVG Icons — clean, professional, with glow
// ─────────────────────────────────────────────
const Ic = ({ children, size = 32, color = "#22d3ee", glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={glow ? { filter: `drop-shadow(0 0 6px ${color}55)` } : {}}>
    {children}
  </svg>
);

const Icons = {
  timer: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="13" r="8" stroke={c} strokeWidth="1.6" opacity="0.2"/>
    <circle cx="12" cy="13" r="8" stroke={c} strokeWidth="1.8" strokeDasharray="14 50" strokeLinecap="round"/>
    <path d="M12 9.5v3.5l2.5 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 2.5h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 2.5V4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </Ic>,
  hexagon: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <path d="M12 2L20 7v10l-8 5-8-5V7l8-5z" stroke={c} strokeWidth="1.4" fill={c+"0c"}/>
    <circle cx="12" cy="9.5" r="1.2" fill={c}/>
    <circle cx="8.5" cy="13" r="1" fill={c} opacity="0.65"/>
    <circle cx="15.5" cy="13" r="1" fill={c} opacity="0.65"/>
    <path d="M12 9.5l-3.5 3.5M12 9.5l3.5 3.5" stroke={c} strokeWidth="0.7" opacity="0.4"/>
    <text x="12" y="18.5" textAnchor="middle" fill={c} fontSize="5.5" fontWeight="800" fontFamily="monospace" opacity="0.7">6</text>
  </Ic>,
  shield: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <path d="M12 2.5L3.5 6.5v5c0 5.25 3.63 10.15 8.5 11.5 4.87-1.35 8.5-6.25 8.5-11.5v-5L12 2.5z" stroke={c} strokeWidth="1.5" fill={c+"08"}/>
    <path d="M9 12.5l2 2 4-4.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Ic>,
  report: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" stroke={c} strokeWidth="1.5" fill={c+"08"}/>
    <path d="M8 7h8M8 10.5h4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <rect x="8" y="13.5" width="2.5" height="4.5" rx="0.6" fill={c} opacity="0.55"/>
    <rect x="12" y="11.5" width="2.5" height="6.5" rx="0.6" fill={c} opacity="0.75"/>
  </Ic>,
  male: (sz = 40, c = "#22d3ee") => <Ic size={sz} color={c}>
    <circle cx="10" cy="8.5" r="3.8" stroke={c} strokeWidth="1.6" fill={c+"10"}/>
    <path d="M15.5 4h4v4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.5 4L14 9.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M10 13v4.5M7 21l3-3.5 3 3.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 15h8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
  </Ic>,
  female: (sz = 40, c = "#22d3ee") => <Ic size={sz} color={c}>
    <circle cx="12" cy="8" r="4.5" stroke={c} strokeWidth="1.6" fill={c+"10"}/>
    <path d="M12 13v5.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9 16h6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
  </Ic>,
  bodyScan: (sz = 48, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3" fill={c+"12"}/>
    <path d="M12 8.5v4.5M9 20l3-7 3 7" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12h10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <rect x="2.5" y="2.5" width="19" height="19" rx="2" stroke={c} strokeWidth="1" strokeDasharray="2 2.5" opacity="0.25"/>
    <path d="M2.5 5V2.5H5M19 2.5h2.5V5M2.5 19v2.5H5M19 21.5h2.5V19" stroke={c} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
  </Ic>,
  athletic: (sz = 48, c = "#10b981") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v4M9 20l3-8 3 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10.5l3.5 1.5h2M19 10.5l-3.5 1.5h-2" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 9l1 1.5M20 9l-1 1.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </Ic>,
  fit: (sz = 48, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v5M9 20l3-7 3 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11h10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="7.5" stroke={c} strokeWidth="0.7" strokeDasharray="2 2.5" opacity="0.2"/>
    <path d="M8.5 2l3.5 1 3.5-1" stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
  </Ic>,
  average: (sz = 48, c = "#f59e0b") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v5M9.5 20l2.5-7 2.5 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11h10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M17 3h3v3M4 3h3" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
  </Ic>,
  warnTriangle: (sz = 48, c = "#ef4444") => <Ic size={sz} color={c} glow>
    <path d="M12 3L2.5 20.5h19L12 3z" stroke={c} strokeWidth="1.5" fill={c+"10"} strokeLinejoin="round"/>
    <path d="M12 9.5v4.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.1" fill={c}/>
  </Ic>,
  excess: (sz = 48, c = "#ef4444") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <ellipse cx="12" cy="13" rx="5" ry="3.5" stroke={c} strokeWidth="1.4" fill={c+"0c"}/>
    <path d="M9.5 19.5l2.5-3 2.5 3" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10.5h10" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </Ic>,
  calendar: (sz = 18, c = "#10b981") => <Ic size={sz} color={c}>
    <rect x="3" y="4" width="18" height="17" rx="2.5" stroke={c} strokeWidth="1.5" fill={c+"0c"}/>
    <path d="M3 9h18" stroke={c} strokeWidth="1.3"/>
    <path d="M8 2v3.5M16 2v3.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="14" r="1.5" fill={c}/>
  </Ic>,
  check: (s = 20, c = "#10b981") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M8 12.5l2.5 2.5L15 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Ic>,
  alert: (s = 20, c = "#f59e0b") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M12 8v4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="15.5" r="1" fill={c}/>
  </Ic>,
  danger: (s = 20, c = "#ef4444") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M14.5 9.5l-5 5M9.5 9.5l5 5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </Ic>,
};

// Get body type result icon component
function getBodyTypeIcon(type) {
  if (type === "Атлетическое") return Icons.athletic;
  if (type === "Подтянутое") return Icons.fit;
  if (type === "Среднее") return Icons.average;
  if (type === "Экстремально низкий жир") return Icons.warnTriangle;
  return Icons.excess;
}

// ─────────────────────────────────────────────
// Body Composition Formulas (zero API calls)
// ─────────────────────────────────────────────
const calc = {
  // Navy Body Fat Formula (US DoD)
  bodyFatNavy(gender, waist, neck, hip, height) {
    if (gender === "male") {
      return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    }
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  },

  // BMI
  bmi(weight, heightCm) {
    const h = heightCm / 100;
    return weight / (h * h);
  },

  // Basal Metabolic Rate (Mifflin-St Jeor)
  bmr(gender, weight, heightCm, age) {
    const base = 10 * weight + 6.25 * heightCm - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
  },

  // Waist-to-Hip Ratio
  whr(waist, hip) {
    return waist / hip;
  },

  // Fat-Free Mass Index
  ffmi(weight, heightCm, bodyFatPct) {
    const h = heightCm / 100;
    const ffm = weight * (1 - bodyFatPct / 100);
    return ffm / (h * h);
  },

  // Lean body mass
  leanMass(weight, bodyFatPct) {
    return weight * (1 - bodyFatPct / 100);
  },

  // Fat mass
  fatMass(weight, bodyFatPct) {
    return weight * (bodyFatPct / 100);
  },

  // Body type classification
  bodyType(gender, bodyFatPct) {
    if (gender === "male") {
      if (bodyFatPct < 6) return { type: "Экстремально низкий жир", emoji: "⚠️", risk: "high" };
      if (bodyFatPct < 14) return { type: "Атлетическое", emoji: "💪", risk: "low" };
      if (bodyFatPct < 18) return { type: "Подтянутое", emoji: "✅", risk: "low" };
      if (bodyFatPct < 25) return { type: "Среднее", emoji: "📊", risk: "medium" };
      return { type: "Избыточный жир", emoji: "⚡", risk: "high" };
    }
    if (bodyFatPct < 14) return { type: "Экстремально низкий жир", emoji: "⚠️", risk: "high" };
    if (bodyFatPct < 21) return { type: "Атлетическое", emoji: "💪", risk: "low" };
    if (bodyFatPct < 25) return { type: "Подтянутое", emoji: "✅", risk: "low" };
    if (bodyFatPct < 32) return { type: "Среднее", emoji: "📊", risk: "medium" };
    return { type: "Избыточный жир", emoji: "⚡", risk: "high" };
  },

  // Visceral fat risk by WHR
  visceralRisk(gender, whr) {
    if (gender === "male") {
      if (whr < 0.90) return { level: "Низкий", color: "#10b981" };
      if (whr < 0.99) return { level: "Повышенный", color: "#f59e0b" };
      return { level: "Высокий", color: "#ef4444" };
    }
    if (whr < 0.80) return { level: "Низкий", color: "#10b981" };
    if (whr < 0.84) return { level: "Повышенный", color: "#f59e0b" };
    return { level: "Высокий", color: "#ef4444" };
  },

  // Body fat category ranges for gauge
  fatRanges(gender) {
    if (gender === "male") {
      return [
        { label: "Мин.", from: 2, to: 6, color: "#f59e0b" },
        { label: "Атлет", from: 6, to: 14, color: "#10b981" },
        { label: "Норма", from: 14, to: 18, color: "#22d3ee" },
        { label: "Средне", from: 18, to: 25, color: "#f59e0b" },
        { label: "Выше", from: 25, to: 40, color: "#ef4444" },
      ];
    }
    return [
      { label: "Мин.", from: 10, to: 14, color: "#f59e0b" },
      { label: "Атлет", from: 14, to: 21, color: "#10b981" },
      { label: "Норма", from: 21, to: 25, color: "#22d3ee" },
      { label: "Средне", from: 25, to: 32, color: "#f59e0b" },
      { label: "Выше", from: 32, to: 45, color: "#ef4444" },
    ];
  },
};

// ─────────────────────────────────────────────
// Animated gauge component
// ─────────────────────────────────────────────
function Gauge({ value, min, max, ranges, label, unit }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const pct = Math.max(0, Math.min(100, ((anim - min) / (max - min)) * 100));
  const currentRange = ranges.find(r => value >= r.from && value < r.to) || ranges[ranges.length - 1];

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: currentRange.color, fontFamily: "'JetBrains Mono', monospace" }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "hidden", background: "#1e293b" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${currentRange.color}88, ${currentRange.color})`,
          borderRadius: 5,
          transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {ranges.map((r, i) => (
          <span key={i} style={{ fontSize: 10, color: r.color, opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>{r.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Ring chart for body composition breakdown
// ─────────────────────────────────────────────
function BodyRing({ fatPct, musclePct }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const r = 70, cx = 90, cy = 90, stroke = 16;
  const circ = 2 * Math.PI * r;
  const fatLen = (fatPct / 100) * circ;
  const muscleLen = (musclePct / 100) * circ;
  const otherLen = circ - fatLen - muscleLen;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, justifyContent: "center", padding: "12px 0" }}>
      <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={stroke}
          strokeDasharray={`${anim ? fatLen : 0} ${circ}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth={stroke}
          strokeDasharray={`${anim ? muscleLen : 0} ${circ}`}
          strokeDashoffset={`${-fatLen}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s" }}
        />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={stroke}
          strokeDasharray={`${anim ? otherLen : 0} ${circ}`}
          strokeDashoffset={`${-fatLen - muscleLen}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s" }}
        />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { color: "#ef4444", label: "Жир", value: fatPct },
          { color: "#10b981", label: "Мышцы", value: musclePct },
          { color: "#3b82f6", label: "Другое", value: 100 - fatPct - musclePct },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'JetBrains Mono', monospace" }}>
              {item.label}: <b style={{ color: "#fff" }}>{item.value.toFixed(1)}%</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────
function StatCard({ label, value, unit, sub, color = "#22d3ee", delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), delay); }, []);
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      borderRadius: 16, padding: "18px 16px",
      border: "1px solid #334155",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8", marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Input step component
// ─────────────────────────────────────────────
function InputField({ label, value, onChange, unit, placeholder, min, max, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          style={{
            width: "100%", boxSizing: "border-box", padding: "14px 50px 14px 16px",
            background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12,
            color: "#fff", fontSize: 18, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#22d3ee"}
          onBlur={e => e.target.style.borderColor = "#334155"}
        />
        <span style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: "#64748b", fontFamily: "'JetBrains Mono', monospace",
        }}>{unit}</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
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
          <div style={{ textAlign: "center", paddingTop: 60, paddingBottom: 40 }}>
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
          <div style={{ paddingTop: 40, marginBottom: 32 }}>
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
          <div style={{ paddingTop: 40, marginBottom: 32 }}>
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
          <div style={{ paddingTop: 40, marginBottom: 24 }}>
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
          <div style={{ paddingTop: 40, textAlign: "center", marginBottom: 32 }}>
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
