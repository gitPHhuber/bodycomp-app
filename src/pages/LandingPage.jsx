import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   SPLASH
   ═══════════════════════════════════════════════ */
function Splash({ onDone }) {
  const [p, setP] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    let v = 0;
    const iv = setInterval(() => { v += Math.random() * 18 + 5; if (v >= 100) { v = 100; clearInterval(iv); setTimeout(() => setFade(true), 300); setTimeout(onDone, 900); } setP(Math.min(v, 100)); }, 120);
    return () => clearInterval(iv);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade ? 0 : 1, transition: "opacity 0.6s" }}>
      <div style={{ fontSize: 48, marginBottom: 24, animation: "spin3d 2s ease-in-out infinite" }}>◎</div>
      <div style={{ width: 180, height: 3, borderRadius: 2, background: "#1e293b", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#0891b2,#22d3ee)", width: `${p}%`, transition: "width 0.15s", boxShadow: "0 0 12px #22d3ee66" }} />
      </div>
      <div style={{ fontSize: 12, color: "#475569", fontFamily: "mono" }}>{Math.round(p)}%</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PARTICLES BACKGROUND
   ═══════════════════════════════════════════════ */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let w = innerWidth, h = innerHeight; c.width = w; c.height = h;
    const pts = Array.from({ length: 40 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.25 + 0.05 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(34,211,238,${p.o})`; ctx.fill(); });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 100) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(34,211,238,${0.04 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); } }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const rs = () => { w = innerWidth; h = innerHeight; c.width = w; c.height = h; };
    addEventListener("resize", rs);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", rs); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ═══════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════ */
function Typewriter({ text, speed = 55, delay = 0, style = {} }) {
  const [d, setD] = useState("");
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => { if (!go) return; let i = 0; const iv = setInterval(() => { i++; setD(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, speed); return () => clearInterval(iv); }, [go, text, speed]);
  return <span style={style}>{d}<span style={{ opacity: d.length < text.length ? 1 : 0, animation: "blink .8s step-end infinite" }}>|</span></span>;
}

/* ═══════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════ */
function Reveal({ children, from = "bottom", delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); o.disconnect(); } }, { threshold: 0.06 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, [delay]);
  const m = { bottom: "translateY(60px)", left: "translateX(-80px) rotate(-1.5deg)", right: "translateX(80px) rotate(1.5deg)", scale: "scale(0.85)", blur: "translateY(40px)" };
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : m[from], transition: `all 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`, filter: from === "blur" && !v ? "blur(6px)" : "none", ...style }}>{children}</div>;
}

/* ═══════════════════════════════════════════════
   COUNTING STAT — counts up & shifts color
   ═══════════════════════════════════════════════ */
function CountingStat({ value, suffix, label, duration = 2000 }) {
  const [cur, setCur] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.4 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, [started]);
  useEffect(() => {
    if (!started) return;
    const num = parseFloat(value); if (isNaN(num)) return;
    const s = Date.now();
    const tick = () => { const p = Math.min((Date.now() - s) / duration, 1); const eased = 1 - Math.pow(1 - p, 3); setCur(eased * num); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [started, value, duration]);

  // Color interpolation: white → yellow → red as counter fills
  const progress = cur / parseFloat(value);
  const r = Math.round(255);
  const g = Math.round(255 - progress * 200);
  const b = Math.round(255 - progress * 240);
  const color = `rgb(${r},${g},${b})`;
  const glow = `0 0 ${20 + progress * 30}px rgba(239,68,68,${progress * 0.4})`;

  return (
    <div ref={ref} style={{ flex: "0 0 auto", textAlign: "center", padding: "16px 20px", minWidth: 120 }}>
      <div style={{
        fontSize: 38, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace",
        color, textShadow: glow,
        transition: "text-shadow 0.3s",
        lineHeight: 1.1,
      }}>
        {suffix === "%" ? Math.round(cur) : cur.toFixed(cur < 10 ? 1 : 0).replace(/\.0$/, "")}{suffix}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, lineHeight: 1.3, maxWidth: 110, margin: "6px auto 0" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3D BODY MODEL — improved anatomy
   ═══════════════════════════════════════════════ */
function BodyModel3D({ fatPct = 25, height = 340 }) {
  const mountRef = useRef(null);
  const sRef = useRef({});
  const fRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dRef = useRef({ x: 0, ry: 0 });

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const w = el.clientWidth || 300;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, w / height, 0.1, 100);
    cam.position.set(0, 0.3, 7);
    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    ren.setSize(w, height); ren.setPixelRatio(Math.min(devicePixelRatio, 2)); ren.setClearColor(0, 0);
    el.appendChild(ren.domElement);

    // Lighting — soft studio setup
    scene.add(new THREE.AmbientLight(0x6677aa, 0.6));
    const key = new THREE.DirectionalLight(0x22d3ee, 1.0); key.position.set(3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x10b981, 0.5); fill.position.set(-3, 1, 3); scene.add(fill);
    const back = new THREE.DirectionalLight(0x8b5cf6, 0.3); back.position.set(0, 2, -4); scene.add(back);

    const body = new THREE.Group();

    // --- Materials ---
    const fatScale = 1 + Math.max(0, fatPct - 15) * 0.015;
    const musScale = 1 + Math.max(0, 30 - fatPct) * 0.01;

    const matSkin = new THREE.MeshStandardMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.22, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
    const matFat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.55, roughness: 0.6 });
    const matMuscle = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, roughness: 0.4, metalness: 0.15 });
    const matBone = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.3 });
    const matVisc = new THREE.MeshStandardMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45, roughness: 0.7 });

    // --- TORSO (outer silhouette) ---
    const torsoGeo = new THREE.SphereGeometry(1, 32, 28);
    torsoGeo.scale(0.65 * fatScale, 1.05, 0.45 * fatScale);
    const torso = new THREE.Mesh(torsoGeo, matSkin);
    torso.position.y = 0.3;
    body.add(torso);

    // --- CHEST (upper torso) ---
    const chestGeo = new THREE.SphereGeometry(0.55, 24, 20);
    chestGeo.scale(0.8 * musScale, 0.6, 0.5);
    const chest = new THREE.Mesh(chestGeo, matMuscle);
    chest.position.y = 0.85;
    body.add(chest);

    // --- FAT LAYER ---
    const fatGeo = new THREE.SphereGeometry(0.75 * fatScale, 28, 22);
    fatGeo.scale(0.58, 0.8, 0.4);
    const fatMesh = new THREE.Mesh(fatGeo, matFat);
    fatMesh.position.y = 0.2;
    body.add(fatMesh);

    // --- MUSCLE CORE ---
    const muscGeo = new THREE.SphereGeometry(0.45 * musScale, 24, 18);
    muscGeo.scale(0.55, 0.85, 0.38);
    const muscMesh = new THREE.Mesh(muscGeo, matMuscle);
    muscMesh.position.y = 0.3;
    body.add(muscMesh);

    // --- VISCERAL FAT (appears >22%) ---
    if (fatPct > 22) {
      const viscAmount = (fatPct - 22) / 23; // 0 to 1
      const viscGeo = new THREE.SphereGeometry(0.2 + viscAmount * 0.2, 18, 14);
      viscGeo.scale(1.3, 0.7, 1.1);
      const viscMesh = new THREE.Mesh(viscGeo, matVisc);
      viscMesh.position.y = 0.1;
      body.add(viscMesh);
    }

    // --- SPINE ---
    for (let i = 0; i < 12; i++) {
      const vertGeo = new THREE.SphereGeometry(0.06, 8, 6);
      vertGeo.scale(1, 0.6, 0.8);
      const vert = new THREE.Mesh(vertGeo, matBone);
      vert.position.y = -0.3 + i * 0.2;
      body.add(vert);
    }

    // --- HEAD ---
    const headGeo = new THREE.SphereGeometry(0.35, 28, 22);
    headGeo.scale(0.85, 1, 0.85);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.85;
    body.add(head);

    // --- NECK ---
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 12);
    const neck = new THREE.Mesh(neckGeo, matSkin);
    neck.position.y = 1.55;
    body.add(neck);

    // --- PELVIS ---
    const pelGeo = new THREE.SphereGeometry(0.28, 14, 10);
    pelGeo.scale(1.4, 0.5, 0.9);
    const pelvis = new THREE.Mesh(pelGeo, matBone);
    pelvis.position.y = -0.4;
    body.add(pelvis);

    // --- ARMS ---
    [-1, 1].forEach(side => {
      // Upper arm
      const uaGeo = new THREE.CylinderGeometry(0.1 * musScale, 0.09, 0.7, 12);
      const ua = new THREE.Mesh(uaGeo, matMuscle);
      ua.position.set(side * 0.72, 0.65, 0);
      ua.rotation.z = side * 0.12;
      body.add(ua);

      // Forearm
      const faGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.65, 10);
      const fa = new THREE.Mesh(faGeo, matSkin);
      fa.position.set(side * 0.78, 0.1, 0);
      fa.rotation.z = side * 0.05;
      body.add(fa);

      // Shoulder
      const shGeo = new THREE.SphereGeometry(0.13 * musScale, 12, 10);
      const sh = new THREE.Mesh(shGeo, matMuscle);
      sh.position.set(side * 0.68, 1.05, 0);
      body.add(sh);
    });

    // --- LEGS ---
    [-1, 1].forEach(side => {
      // Thigh
      const thGeo = new THREE.CylinderGeometry(0.17 * fatScale, 0.13, 0.9, 14);
      const th = new THREE.Mesh(thGeo, fatPct > 25 ? matFat : matMuscle);
      th.position.set(side * 0.25, -1.0, 0);
      body.add(th);

      // Shin
      const shGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.85, 12);
      const sh = new THREE.Mesh(shGeo, matSkin);
      sh.position.set(side * 0.25, -1.85, 0);
      body.add(sh);

      // Femur
      const feGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.8, 6);
      const fe = new THREE.Mesh(feGeo, matBone);
      fe.position.set(side * 0.25, -1.0, 0);
      body.add(fe);

      // Knee
      const knGeo = new THREE.SphereGeometry(0.08, 10, 8);
      const kn = new THREE.Mesh(knGeo, matBone);
      kn.position.set(side * 0.25, -1.42, 0);
      body.add(kn);
    });

    body.position.y = -0.2;
    scene.add(body);

    // Floating particles
    const pgeo = new THREE.BufferGeometry();
    const pp = new Float32Array(60 * 3);
    for (let i = 0; i < 180; i++) pp[i] = (Math.random() - 0.5) * 8;
    pgeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.02, transparent: true, opacity: 0.3 }));
    scene.add(pts);

    sRef.current = { scene, cam, ren, body, pts, el };
    let t = 0;
    const anim = () => { fRef.current = requestAnimationFrame(anim); t += 0.014; body.rotation.y += 0.003; body.position.y = -0.2 + Math.sin(t * 0.7) * 0.04; pts.rotation.y -= 0.0008; ren.render(scene, cam); };
    anim();
    return () => { cancelAnimationFrame(fRef.current); if (el.contains(ren.domElement)) el.removeChild(ren.domElement); ren.dispose(); };
  }, [fatPct, height]);

  const dn = e => { setDragging(true); dRef.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, ry: sRef.current.body?.rotation.y || 0 }; };
  const mv = useCallback(e => { if (!dragging || !sRef.current.body) return; const x = e.clientX || e.touches?.[0]?.clientX || 0; sRef.current.body.rotation.y = dRef.current.ry + (x - dRef.current.x) * 0.01; }, [dragging]);
  const up = () => setDragging(false);
  useEffect(() => { addEventListener("pointermove", mv); addEventListener("pointerup", up); addEventListener("touchmove", mv); addEventListener("touchend", up); return () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("touchmove", mv); removeEventListener("touchend", up); }; }, [mv]);

  return <div ref={mountRef} onPointerDown={dn} onTouchStart={dn} style={{ width: "100%", height, cursor: dragging ? "grabbing" : "grab", touchAction: "none", position: "relative" }}>
    <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#334155", fontFamily: "mono", background: "#020617cc", padding: "3px 10px", borderRadius: 8, pointerEvents: "none", border: "1px solid #1e293b" }}>↔ покрутите 3D-модель пальцем</div>
  </div>;
}

/* ═══════════════════════════════════════════════
   3D BONE MODEL — improved
   ═══════════════════════════════════════════════ */
function BoneModel3D({ density = 0.8, height = 260 }) {
  const mountRef = useRef(null); const fRef = useRef(null); const sRef = useRef({});
  const [dragging, setDragging] = useState(false); const dRef = useRef({ x: 0, ry: 0 });

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const w = el.clientWidth || 280;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, w / height, 0.1, 100); cam.position.set(0, 0.2, 6);
    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true }); ren.setSize(w, height); ren.setPixelRatio(Math.min(devicePixelRatio, 2)); ren.setClearColor(0, 0);
    el.appendChild(ren.domElement);

    scene.add(new THREE.AmbientLight(0x8888bb, 0.5));
    const dl = new THREE.DirectionalLight(0x8b5cf6, 1.2); dl.position.set(2, 4, 4); scene.add(dl);
    const fl = new THREE.DirectionalLight(0x22d3ee, 0.4); fl.position.set(-3, -1, 3); scene.add(fl);

    const bone = new THREE.Group();

    // Color based on density
    const hue = 0.12 + density * 0.55; // red(0.12) → green(0.67)
    const boneColor = new THREE.Color().setHSL(hue, 0.5, 0.4 + density * 0.3);
    const mat = new THREE.MeshStandardMaterial({ color: boneColor, transparent: true, opacity: 0.45 + density * 0.45, roughness: 0.3 - density * 0.1, metalness: density * 0.3 });

    // Shaft — slightly curved
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 2.8, 18), mat);
    bone.add(shaft);

    // Femoral head (ball joint)
    const ballGeo = new THREE.SphereGeometry(0.28, 22, 18);
    const ball = new THREE.Mesh(ballGeo, mat);
    ball.position.set(0.25, 1.55, 0);
    bone.add(ball);

    // Greater trochanter (bump on side)
    const trochGeo = new THREE.SphereGeometry(0.15, 12, 10);
    const troch = new THREE.Mesh(trochGeo, mat);
    troch.position.set(-0.15, 1.2, 0);
    bone.add(troch);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.55, 12);
    const neck = new THREE.Mesh(neckGeo, mat);
    neck.position.set(0.12, 1.3, 0);
    neck.rotation.z = -0.5;
    bone.add(neck);

    // Condyles (knee end)
    [-0.1, 0.1].forEach(x => {
      const cGeo = new THREE.SphereGeometry(0.18, 16, 12);
      cGeo.scale(1, 0.8, 1.1);
      const c = new THREE.Mesh(cGeo, mat);
      c.position.set(x, -1.48, 0);
      bone.add(c);
    });

    // Inner trabecular structure
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, transparent: true, opacity: Math.max(0.05, density * 0.4), wireframe: true });
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 2.4, 8, 16), innerMat);
    bone.add(inner);

    // Osteoporosis holes
    if (density < 0.65) {
      const count = Math.round((1 - density) * 30);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      for (let i = 0; i < count; i++) {
        const size = 0.02 + Math.random() * (0.06 * (1 - density));
        const hole = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 5), holeMat);
        const a = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 2.4;
        const r = 0.12 + Math.random() * 0.05;
        hole.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        bone.add(hole);
      }
    }

    // Periosteum (outer membrane) at high density
    if (density > 0.75) {
      const periMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
      const peri = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 2.6, 14), periMat);
      bone.add(peri);
    }

    bone.rotation.z = 0.08;
    scene.add(bone);

    sRef.current = { scene, cam, ren, bone, el };
    let t = 0;
    const anim = () => { fRef.current = requestAnimationFrame(anim); t += 0.012; bone.rotation.y += 0.005; bone.position.y = Math.sin(t) * 0.025; ren.render(scene, cam); };
    anim();
    return () => { cancelAnimationFrame(fRef.current); if (el.contains(ren.domElement)) el.removeChild(ren.domElement); ren.dispose(); };
  }, [density, height]);

  const dn = e => { setDragging(true); dRef.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, ry: sRef.current.bone?.rotation.y || 0 }; };
  const mv = useCallback(e => { if (!dragging || !sRef.current.bone) return; sRef.current.bone.rotation.y = dRef.current.ry + ((e.clientX || e.touches?.[0]?.clientX || 0) - dRef.current.x) * 0.01; }, [dragging]);
  const up = () => setDragging(false);
  useEffect(() => { addEventListener("pointermove", mv); addEventListener("pointerup", up); return () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); }; }, [mv]);

  return <div ref={mountRef} onPointerDown={dn} onTouchStart={dn} style={{ width: "100%", height, cursor: dragging ? "grabbing" : "grab", touchAction: "none" }} />;
}

/* ═══════════════════════════════════════════════
   BODY COMPARE SLIDER
   ═══════════════════════════════════════════════ */
function BodyCompare() {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const onMove = e => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setPos(Math.max(5, Math.min(95, ((e.clientX || e.touches?.[0]?.clientX || 0) - r.left) / r.width * 100))); };
  return (
    <div ref={ref} onPointerMove={onMove} onTouchMove={onMove} style={{ position: "relative", height: 200, borderRadius: 16, overflow: "hidden", cursor: "col-resize", touchAction: "none", userSelect: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1a0505,#2d0a0a)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 40 }}>🔴</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", fontFamily: "mono" }}>38% жира</div>
        <div style={{ fontSize: 12, color: "#fca5a5" }}>ИМТ 22 — «норма»</div>
        <div style={{ fontSize: 11, color: "#7f1d1d" }}>Риск диабета ×2.4</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#022c22,#064e3b)", clipPath: `inset(0 0 0 ${pos}%)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 40 }}>🟢</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", fontFamily: "mono" }}>18% жира</div>
        <div style={{ fontSize: 12, color: "#6ee7b7" }}>Здоровый состав тела</div>
        <div style={{ fontSize: 11, color: "#065f46" }}>Все показатели ОК</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 3, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 20px #fff8", zIndex: 2 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#020617", fontWeight: 800, boxShadow: "0 0 20px #fff6" }}>↔</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const PROFILES = [
  { id: "a", name: "Анна", age: 34, w: 62, h: 168, bmi: 22.0, fat: 36, muscle: 38, verdict: "Skinny Fat", vc: "#ef4444", icon: "👩", scale: "Весы: «62 кг — идеально!»", truth: "36% жира — скрытое ожирение. Мало мышц, висцеральный жир вокруг органов. Риск диабета повышен в 2 раза.", bmiL: "Норма ✓", bmiC: "#10b981", tip: "ИМТ 22 — «здорова». Но внутри — проблема, которую не видно." },
  { id: "d", name: "Дмитрий", age: 28, w: 92, h: 180, bmi: 28.4, fat: 15, muscle: 72, verdict: "Атлет", vc: "#10b981", icon: "🧔", scale: "Весы: «92 кг — срочно худей!»", truth: "15% жира. 72 кг чистой мышечной массы. Здоровее 90% людей с «нормальным» ИМТ.", bmiL: "Избыток ✗", bmiC: "#ef4444", tip: "ИМТ 28.4 — врач назначил бы диету здоровому атлету." },
  { id: "e", name: "Елена", age: 52, w: 68, h: 165, bmi: 25.0, fat: 28, muscle: 41, verdict: "Саркопения", vc: "#f59e0b", icon: "👩‍🦰", scale: "Весы: «68 кг — стабильно 10 лет!»", truth: "−4 кг мышц, +4 кг жира за 10 лет. Тот же вес — совершенно другое тело. Риск переломов ×3.", bmiL: "Норма ✓", bmiC: "#10b981", tip: "Стабильный вес — опаснейшая иллюзия здоровья после 40." },
];
const MYTHS = [
  { myth: "«Слежу за весом = контролирую здоровье»", fact: "Вес не различает жир, мышцы, воду, кости. Можно терять мышцы и набирать жир при том же числе на весах.", stat: "40%", sub: "людей с нормальным весом имеют скрытый избыток жира", icon: "⚖️" },
  { myth: "«Мой ИМТ в норме — я здоров»", fact: "Формуле почти 200 лет. Она создана для статистики населения и не различает 90 кг мышц и 90 кг жира.", stat: "1832", sub: "год создания формулы ИМТ", icon: "📊" },
  { myth: "«Диета работает — вес уходит»", fact: "На жёстких диетах до половины потерянного веса — это мышцы. Метаболизм замедляется, вес возвращается.", stat: "50%", sub: "потерь на диете может быть мышцами", icon: "🥗" },
  { myth: "«Умные весы показывают мой % жира»", fact: "Биоимпедансные весы ошибаются на ±8-15%. Результат зависит от выпитой воды, еды и времени суток.", stat: "±15%", sub: "погрешность домашних анализаторов", icon: "🔌" },
  { myth: "«Остеопороз — это про бабушек»", fact: "Потеря костной массы начинается с 30 лет. К 50 годам каждая 3-я женщина и каждый 5-й мужчина в зоне риска.", stat: "30", sub: "лет — старт потери костной массы", icon: "🦴" },
];
const THREATS = [
  { what: "Висцеральный жир", desc: "Жир вокруг печени, сердца, кишечника. Невидим снаружи. Предиктор №1 диабета и инфаркта.", tag: "Стройные снаружи — жирные внутри", icon: "🫁", c: "#ef4444" },
  { what: "Саркопения", desc: "Потеря 1% мышц каждый год после 30. К 60 годам — минус 30%. Падения, переломы, инвалидность.", tag: "Вес стоит — мышцы тают незаметно", icon: "💪", c: "#f59e0b" },
  { what: "Потеря костей", desc: "Падает бессимптомно десятилетиями. Первый и единственный признак — перелом.", tag: "Узнаёте когда уже поздно", icon: "🦴", c: "#8b5cf6" },
  { what: "Асимметрия тела", desc: "Одна сторона сильнее другой → хронические боли, травмы, проблемы с осанкой.", tag: "Определить можно только измерением", icon: "⚖️", c: "#0891b2" },
];

// Fat slider descriptions
function fatDesc(v) {
  if (v < 10) return { label: "Соревновательный атлет", color: "#22d3ee", detail: "Экстремально низкий жир. Видны все мышцы и вены. Не поддерживается долго." };
  if (v < 15) return { label: "Спортивная форма", color: "#10b981", detail: "Рельефный пресс, чёткие мышцы. Уровень профессиональных спортсменов." };
  if (v < 20) return { label: "Здоровая норма (муж)", color: "#10b981", detail: "Оптимальный уровень для мужчин. Хорошее здоровье и энергия." };
  if (v < 25) return { label: "Здоровая норма (жен)", color: "#22d3ee", detail: "Оптимальный уровень для женщин. Нормальный гормональный фон." };
  if (v < 30) return { label: "Повышенный жир", color: "#f59e0b", detail: "Начало скрытых рисков. Висцеральный жир вокруг органов растёт." };
  if (v < 35) return { label: "Ожирение I степени", color: "#ef4444", detail: "Высокий риск диабета, гипертонии, сердечно-сосудистых заболеваний." };
  return { label: "Ожирение II-III ст.", color: "#dc2626", detail: "Серьёзная угроза здоровью. Множественные метаболические нарушения." };
}
function boneDesc(v) {
  if (v < 40) return { label: "Тяжёлый остеопороз", color: "#dc2626", detail: "T-score < −3.5. Множественные переломы. Кость крайне хрупкая." };
  if (v < 55) return { label: "Остеопороз", color: "#ef4444", detail: "T-score < −2.5. Высокий риск переломов при минимальной нагрузке." };
  if (v < 75) return { label: "Остеопения", color: "#f59e0b", detail: "T-score от −1 до −2.5. Пред-стадия остеопороза. Обратима!" };
  return { label: "Норма", color: "#10b981", detail: "T-score > −1. Кость плотная и крепкая. Низкий риск переломов." };
}

/* ═══════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [myth, setMyth] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [fat, setFat] = useState(25);
  const [bone, setBone] = useState(80);

  const card = { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 20, padding: 24, border: "1px solid #334155" };
  const fd = fatDesc(fat);
  const bd = boneDesc(bone);

  if (loading) return <Splash onDone={() => setLoading(false)} />;

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif", overflow: "hidden" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ═══ HERO ═══ */}
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 28 }}>
          <Reveal from="scale" delay={200}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "#ef444412", border: "1px solid #ef444430", marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse2 1.5s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171", fontFamily: "mono" }}>ВАЖНО ЗНАТЬ</span>
            </div>
          </Reveal>
          <Reveal from="blur" delay={500}>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
              <span style={{ color: "#64748b" }}>Ваши весы<br /></span>
              <Typewriter text="скрывают правду" delay={800} speed={60} style={{ background: "linear-gradient(135deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
            </h1>
          </Reveal>
          <Reveal from="bottom" delay={1800}><p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>Одинаковый вес — совершенно разное здоровье.</p></Reveal>
          <Reveal from="bottom" delay={2100}><div style={{ marginTop: 20, animation: "float 3s ease-in-out infinite" }}><div style={{ fontSize: 10, color: "#334155", fontFamily: "mono", marginBottom: 2 }}>scroll</div><div style={{ fontSize: 24, color: "#334155" }}>↓</div></div></Reveal>
        </div>

        {/* ═══ STATS STRIP — counting & going red ═══ */}
        <Reveal from="scale" delay={100}>
          <div style={{ marginBottom: 28, borderRadius: 16, background: "#0f172a", border: "1px solid #1e293b", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "mono", letterSpacing: "0.12em", padding: "12px 16px 0", textAlign: "center" }}>РОССИЯ — ПРЯМО СЕЙЧАС</div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              <CountingStat value="14" suffix=" млн" label="больны остеопорозом" duration={2200} />
              <CountingStat value="20" suffix=" млн" label="остеопения" duration={2500} />
              <CountingStat value="40" suffix="%" label="скрытый избыток жира" duration={2800} />
            </div>
            <div style={{ textAlign: "center", paddingBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Каждые <span style={{ color: "#ef4444", fontWeight: 700, fontFamily: "mono" }}>5 минут</span> — перелом бедра из-за остеопороза</div>
            </div>
          </div>
        </Reveal>

        {/* ═══ COMPARE ═══ */}
        <Reveal from="left" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 6 }}>СРАВНЕНИЕ</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Один вес — два разных тела</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 10px" }}>Проведите пальцем по разделителю</p>
            <BodyCompare />
          </div>
        </Reveal>

        {/* ═══ 3D BODY ═══ */}
        <Reveal from="right" delay={100}>
          <div style={{ ...card, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div><div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 4 }}>ИНТЕРАКТИВНАЯ 3D-МОДЕЛЬ</div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Анатомия состава тела</h2></div>
            </div>
            <BodyModel3D fatPct={fat} height={340} />

            {/* Fat status */}
            <div style={{ padding: "12px 16px", borderRadius: 14, background: fd.color + "12", border: `1px solid ${fd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: fd.color }}>{fd.label}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: fd.color, fontFamily: "mono" }}>{fat}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{fd.detail}</div>
            </div>

            {/* Slider */}
            <div style={{ padding: "0 4px" }}>
              <input type="range" min={6} max={45} value={fat} onChange={e => setFat(+e.target.value)} style={{ width: "100%", accentColor: fd.color, height: 6, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", fontFamily: "mono", marginTop: 2 }}>
                <span>6%</span><span>15%</span><span>25%</span><span>35%</span><span>45%</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {[{ c: "#22d3ee", l: "Кожа" }, { c: "#ef4444", l: "Жир" }, { c: "#10b981", l: "Мышцы" }, { c: "#f1f5f9", l: "Кости" }, ...(fat > 22 ? [{ c: "#fbbf24", l: "Висцеральный жир" }] : [])].map((x, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, border: "1px solid #33415566" }} />{x.l}</div>)}
            </div>
          </div>
        </Reveal>

        {/* ═══ PROFILES ═══ */}
        <Reveal from="left"><div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 6 }}>ЭКСПЕРИМЕНТ</div><h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Три человека. «Здоровый» ИМТ.</h2></div></Reveal>
        {PROFILES.map((p, i) => {
          const rv = revealed[p.id];
          return (
            <Reveal key={p.id} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
              <div style={{ ...card, marginBottom: 14, cursor: "pointer", borderColor: rv ? p.vc + "55" : "#334155", boxShadow: rv ? `0 0 30px ${p.vc}10` : "none", transition: "all 0.35s" }} onClick={() => setRevealed(r => ({ ...r, [p.id]: true }))}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1px solid #1e293b" }}>{p.icon}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}, {p.age}</div><div style={{ fontSize: 12, color: "#64748b" }}>{p.h} см · {p.w} кг</div></div>
                  <div style={{ padding: "4px 10px", borderRadius: 8, background: p.bmiC + "22", color: p.bmiC, fontSize: 11, fontWeight: 700, fontFamily: "mono" }}>ИМТ {p.bmi}</div>
                </div>
                <div style={{ padding: "8px 14px", borderRadius: 10, background: "#020617", marginBottom: 12, fontSize: 13, color: "#64748b" }}>{p.scale}</div>
                {!rv ? <div style={{ textAlign: "center", padding: 12, background: "#ef444408", borderRadius: 12, border: "1px dashed #ef444425" }}><span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>👆 Нажмите — увидьте правду</span></div> : (
                  <div style={{ animation: "fadeSlide 0.6s ease" }}>
                    <div style={{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", background: "#1e293b", marginBottom: 10 }}>
                      <div style={{ width: `${p.fat}%`, background: "linear-gradient(90deg,#ef4444,#f87171)", transition: "width 1s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, fontFamily: "mono" }}>{p.fat}%</div>
                      <div style={{ width: `${p.muscle}%`, background: "linear-gradient(90deg,#10b981,#34d399)", transition: "width 1s ease .1s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, fontFamily: "mono" }}>{p.muscle}%</div>
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

        {/* ═══ 3D BONE ═══ */}
        <Reveal from="right" delay={100}>
          <div style={{ ...card, marginTop: 14, marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 4 }}>3D-МОДЕЛЬ БЕДРЕННОЙ КОСТИ</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px" }}>Остеопороз изнутри</h2>
            <p style={{ fontSize: 12, color: "#475569", margin: "0 0 4px" }}>Крутите модель пальцем, двигайте слайдер</p>

            <BoneModel3D density={bone / 100} height={260} />

            {/* Status */}
            <div style={{ padding: "12px 16px", borderRadius: 14, background: bd.color + "12", border: `1px solid ${bd.color}33`, marginBottom: 12, transition: "all 0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: bd.color }}>{bd.label}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: bd.color, fontFamily: "mono" }}>{bone}%</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{bd.detail}</div>
            </div>

            <input type="range" min={15} max={100} value={bone} onChange={e => setBone(+e.target.value)} style={{ width: "100%", accentColor: bd.color, height: 6, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "mono", marginTop: 2 }}>
              <span style={{ color: "#dc2626" }}>Тяжёлый</span><span style={{ color: "#ef4444" }}>Остеопороз</span><span style={{ color: "#f59e0b" }}>Остеопения</span><span style={{ color: "#10b981" }}>Норма</span>
            </div>
          </div>
        </Reveal>

        {/* ═══ QUIZ ═══ */}
        <Reveal from="left">
          <div style={{ ...card, background: "linear-gradient(135deg,#1e1b4b12,#4c1d9512)", border: "1px solid #7c3aed30", marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "mono", marginBottom: 8, letterSpacing: "0.1em" }}>КВИЗ</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>Два человека по 80 кг. У кого выше риск инфаркта?</h3>
            {[{ id: "a", t: "У того, кто выглядит полнее", ok: false }, { id: "b", t: "У того, у кого больше висцерального жира — даже если стройнее", ok: true }, { id: "c", t: "Риск одинаков — вес же одинаковый", ok: false }].map(o => {
              const s = quiz === o.id, g = quizDone && o.ok, b = quizDone && s && !o.ok;
              return <button key={o.id} onClick={() => { if (!quizDone) { setQuiz(o.id); setTimeout(() => setQuizDone(true), 400); } }} style={{ display: "block", width: "100%", padding: "13px 16px", marginBottom: 8, borderRadius: 12, textAlign: "left", background: g ? "#10b98115" : b ? "#ef444415" : s ? "#7c3aed15" : "#0f172a", border: `1.5px solid ${g ? "#10b981" : b ? "#ef4444" : s ? "#7c3aed" : "#1e293b"}`, color: "#e2e8f0", fontSize: 14, cursor: quizDone ? "default" : "pointer", transition: "all 0.3s" }}>{g && "✓ "}{b && "✗ "}{o.t}</button>;
            })}
            {quizDone && <div style={{ padding: 14, borderRadius: 12, background: "#10b98110", border: "1px solid #10b98130", animation: "fadeSlide 0.6s ease", marginTop: 6, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}><b style={{ color: "#10b981" }}>Висцеральный жир</b> невидим снаружи, но является предиктором №1 болезней сердца и диабета. <b>Единственный способ измерить точно — DXA-сканирование.</b></div>}
          </div>
        </Reveal>

        {/* ═══ MYTHS ═══ */}
        <Reveal from="bottom"><div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 6 }}>МИФЫ</div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>5 опасных заблуждений</h2></div></Reveal>
        {MYTHS.map((m, i) => {
          const op = myth === i;
          return (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 70}>
              <div onClick={() => setMyth(op ? null : i)} style={{ ...card, marginBottom: 10, cursor: "pointer", padding: op ? 22 : 16, borderColor: op ? "#f59e0b30" : "#334155", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 24, transition: "transform 0.3s", transform: op ? "scale(1.25) rotate(-8deg)" : "none" }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", textDecoration: op ? "line-through" : "none", transition: "all 0.3s" }}>{m.myth}</div>
                    {op && <div style={{ animation: "fadeSlide 0.5s ease" }}><div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, marginTop: 8, marginBottom: 12 }}>{m.fact}</div><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#f59e0b0a", border: "1px solid #f59e0b1a" }}><span style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b", fontFamily: "mono" }}>{m.stat}</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{m.sub}</span></div></div>}
                  </div>
                  <span style={{ fontSize: 16, color: "#334155", transform: op ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▾</span>
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* ═══ THREATS ═══ */}
        <Reveal from="bottom" delay={80}><div style={{ marginTop: 18, marginBottom: 14 }}><div style={{ fontSize: 11, color: "#ef4444", fontFamily: "mono", letterSpacing: "0.1em", marginBottom: 6 }}>НЕВИДИМЫЕ УГРОЗЫ</div><h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Чего не покажут весы и зеркало</h2></div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {THREATS.map((t, i) => (
            <Reveal key={i} from={i % 2 === 0 ? "left" : "right"} delay={i * 100}>
              <div style={{ ...card, padding: 14, borderColor: t.c + "1a", transition: "transform 0.3s, box-shadow 0.3s" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 10px 30px ${t.c}15`; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.c, marginBottom: 4 }}>{t.what}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.55, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ fontSize: 10, color: t.c, padding: "5px 8px", borderRadius: 6, background: t.c + "0a", lineHeight: 1.4 }}>⚡ {t.tag}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ═══ CTA ═══ */}
        <Reveal from="bottom">
          <div style={{ borderRadius: 22, padding: 32, textAlign: "center", background: "linear-gradient(135deg,#0891b210,#10b98110)", border: "1px solid #22d3ee1a", marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 14, animation: "float 3s ease-in-out infinite" }}>◎</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg,#e2e8f0,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Узнайте свои реальные цифры</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.55, margin: "0 0 22px" }}>Бесплатный расчёт за 3 минуты — или точный DXA-анализ</p>
            {[{ label: "Рассчитать состав тела →", bg: "linear-gradient(135deg,#0891b2,#22d3ee)", s: "#22d3ee", href: "/analyzer", ext: false }, { label: "Записаться на DXA", bg: "linear-gradient(135deg,#10b981,#34d399)", s: "#10b981", href: "/clinics", ext: false }].map((b, i) => (
              <button key={i} onClick={() => b.ext ? window.open(b.href, "_blank") : navigate(b.href)} style={{ display: "block", width: "100%", padding: 15, marginBottom: 8, border: "none", borderRadius: 14, background: b.bg, color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "mono", boxShadow: `0 0 20px ${b.s}20`, transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 6px 30px ${b.s}30`; }} onMouseOut={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 0 20px ${b.s}20`; }}>{b.label}</button>
            ))}
            <p style={{ fontSize: 11, color: "#334155", marginTop: 10 }}>DXA — золотой стандарт точности · 5 минут · Минимальное облучение</p>
          </div>
        </Reveal>

        <div style={{ textAlign: "center", padding: "14px 0", borderTop: "1px solid #1e293b" }}><p style={{ fontSize: 10, color: "#1e293b", lineHeight: 1.6 }}>Образовательный контент. Имеются противопоказания, необходима консультация специалиста.</p></div>
      </div>
    </div>
  );
}
