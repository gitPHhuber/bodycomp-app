import { useState, useEffect, useRef, useCallback } from "react";
import { XRAY_DATA, BODY_PATHS, SKELETON, MUSCLES, VISCERAL_BLOBS, ANNOTATIONS, STAT_CARDS } from "./data";
import { CSS_KEYFRAMES } from "./keyframes";
import { useCountUp } from "./useCountUp";
import { statColor, isDanger, annotColor } from "./colorHelpers";
import { useMeta } from "../../utils/useMeta";

export default function BodyComparePage() {
  useMeta(
    "Рентген состава тела — сравните двух людей с одинаковым весом",
    "Интерактивный DXA-сканер: посмотрите, как одинаковый вес скрывает совершенно разное здоровье. Skinny fat vs атлет."
  );
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
      padding: "80px 16px 48px", fontFamily: "'Outfit',system-ui,sans-serif",
      overflow: "hidden", maxWidth: 640, margin: "0 auto",
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
                {musc.pecs.map((m, i) => (
                  <ellipse key={`pec${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {musc.abs.map((m, i) => (
                  <rect key={`abs${i}`} x={m.x} y={m.y} width={m.w} height={m.h} rx={m.r} />
                ))}
                {musc.delts.map((m, i) => (
                  <ellipse key={`delt${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {musc.biceps.map((m, i) => (
                  <ellipse key={`bic${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {musc.quads.map((m, i) => (
                  <ellipse key={`quad${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
                {musc.calves.map((m, i) => (
                  <ellipse key={`calf${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} />
                ))}
              </g>

              {/* ── Layer 2: SKELETON ── */}
              <g stroke="#c8d4e0" fill="none" strokeWidth="1.5" opacity="0.55">
                <ellipse cx={skel.skull.cx} cy={skel.skull.cy} rx={skel.skull.rx} ry={skel.skull.ry}
                  stroke="#e2e8f0" strokeWidth="1.2" />
                <line x1={skel.spine.x1} y1={skel.spine.y1} x2={skel.spine.x2} y2={skel.spine.y2}
                  strokeWidth="2.5" stroke="#d1d9e3" />
                <path d={skel.clavR} strokeWidth="1.8" />
                <path d={skel.clavL} strokeWidth="1.8" />
                {skel.ribs.map((rib, i) => (
                  <g key={`rib${i}`}>
                    <path d={`M150,${rib.y} Q${150 + rib.rx * 0.65},${rib.y - 5} ${150 + rib.rx},${rib.y + 4}`} />
                    <path d={`M150,${rib.y} Q${150 - rib.rx * 0.65},${rib.y - 5} ${150 - rib.rx},${rib.y + 4}`} />
                  </g>
                ))}
                <path d={skel.pelvis} strokeWidth="1.6" />
                <line x1={skel.femurR.x1} y1={skel.femurR.y1} x2={skel.femurR.x2} y2={skel.femurR.y2} strokeWidth="2.2" />
                <line x1={skel.femurL.x1} y1={skel.femurL.y1} x2={skel.femurL.x2} y2={skel.femurL.y2} strokeWidth="2.2" />
                <circle cx={skel.kneeR.cx} cy={skel.kneeR.cy} r={skel.kneeR.r} stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx={skel.kneeL.cx} cy={skel.kneeL.cy} r={skel.kneeL.r} stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1={skel.tibiaR.x1} y1={skel.tibiaR.y1} x2={skel.tibiaR.x2} y2={skel.tibiaR.y2} strokeWidth="1.8" />
                <line x1={skel.tibiaL.x1} y1={skel.tibiaL.y1} x2={skel.tibiaL.x2} y2={skel.tibiaL.y2} strokeWidth="1.8" />
                <line x1={skel.humerusR.x1} y1={skel.humerusR.y1} x2={skel.humerusR.x2} y2={skel.humerusR.y2} strokeWidth="1.8" />
                <line x1={skel.humerusL.x1} y1={skel.humerusL.y1} x2={skel.humerusL.x2} y2={skel.humerusL.y2} strokeWidth="1.8" />
                <circle cx={skel.elbowR.cx} cy={skel.elbowR.cy} r={skel.elbowR.r} stroke="#cbd5e1" strokeWidth="1" />
                <circle cx={skel.elbowL.cx} cy={skel.elbowL.cy} r={skel.elbowL.r} stroke="#cbd5e1" strokeWidth="1" />
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
              <rect x="0" y={Math.max(0, scanY - 60)} width="300" height={60} fill="url(#bc-scanTrail)" />
              <rect x="0" y={scanY - 1.5} width="300" height="3"
                fill="url(#bc-scanLineGrad)" filter="url(#bc-glowCyan)" />
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
                <line
                  x1={bp.x} y1={bp.y}
                  x2={isRight ? bx : bx + boxW}
                  y2={by + boxH / 2}
                  stroke={color} strokeWidth="0.8"
                  strokeDasharray="3,3" opacity="0.6"
                />
                <circle cx={bp.x} cy={bp.y} r="3" fill={color} opacity="0.9">
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect
                  x={bx} y={by}
                  width={boxW} height={boxH} rx="4"
                  fill="rgba(8,14,27,0.85)"
                  stroke={color} strokeWidth="0.6" opacity="0.95"
                />
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
              {counting && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(90deg, transparent, ${color}11, transparent)`,
                  backgroundSize: "200px 100%",
                  animation: "bcShimmer 1.2s linear infinite",
                  pointerEvents: "none",
                }} />
              )}

              <div style={{ fontSize: 16, marginBottom: 2 }}>{card.icon}</div>

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

      {/* ───── CTA after scan ───── */}
      {scanComplete && (
        <div style={{ padding: "16px", textAlign: "center", borderTop: "1px solid #1e293b", marginTop: 12 }}>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.5 }}>
            {person.id === "anna"
              ? "Анна не подозревала о скрытом ожирении. А вы знаете свои цифры?"
              : "Дмитрий точно знает свой состав тела. А вы?"}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={() => window.location.href = "/analyzer"}
              style={{ padding: "10px 16px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#0891b2,#22d3ee)", color: "#020617", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>
              Рассчитать →
            </button>
            <button onClick={() => window.location.href = "/clinics"}
              style={{ padding: "10px 16px", border: "1px solid #334155", borderRadius: 10, background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
              Записаться на DXA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
