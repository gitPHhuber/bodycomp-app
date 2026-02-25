import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   GLOBAL KEYFRAMES (injected once)
   ═══════════════════════════════════════════════ */
const KEYFRAMES_ID = "__asvomed-keyframes__";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800;900&display=swap');

    @keyframes spin3d {
      0% { transform: rotateY(0deg); }
      50% { transform: rotateY(180deg); }
      100% { transform: rotateY(360deg); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes pulse2 {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════════
   SPLASH
   ═══════════════════════════════════════════════ */
function Splash({ onDone }) {
  const [p, setP] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    let v = 0;
    const iv = setInterval(() => {
      v += Math.random() * 18 + 5;
      if (v >= 100) {
        v = 100;
        clearInterval(iv);
        setTimeout(() => setFade(true), 300);
        setTimeout(onDone, 900);
      }
      setP(Math.min(v, 100));
    }, 120);
    return () => clearInterval(iv);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade ? 0 : 1, transition: "opacity 0.6s" }}>
      <div style={{ fontSize: 48, marginBottom: 24, animation: "spin3d 2s ease-in-out infinite" }}>◎</div>
      <div style={{ width: 180, height: 3, borderRadius: 2, background: "#1e293b", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#0891b2,#22d3ee)", width: `${p}%`, transition: "width 0.15s", boxShadow: "0 0 12px #22d3ee66" }} />
      </div>
      <div style={{ fontSize: 12, color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(p)}%</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PARTICLES BACKGROUND
   ═══════════════════════════════════════════════ */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = innerWidth, h = innerHeight;
    c.width = w;
    c.height = h;
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.25 + 0.05,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${0.04 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
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
  useEffect(() => {
    if (!go) return;
    let i = 0;
    const iv = setInterval(() => { i++; setD(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, speed);
    return () => clearInterval(iv);
  }, [go, text, speed]);
  return (
    <span style={style}>
      {d}
      <span style={{ opacity: d.length < text.length ? 1 : 0, animation: "blink .8s step-end infinite" }}>|</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════ */
function Reveal({ children, from = "bottom", delay = 0, style = {} }) {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setV(true), delay); o.disconnect(); }
    }, { threshold: 0.06 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [delay]);
  const m = {
    bottom: "translateY(60px)", left: "translateX(-80px) rotate(-1.5deg)",
    right: "translateX(80px) rotate(1.5deg)", scale: "scale(0.85)", blur: "translateY(40px)",
  };
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0, transform: v ? "none" : m[from],
      transition: `all 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      filter: from === "blur" && !v ? "blur(6px)" : "none", ...style,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COUNTING STAT — counts up & shifts color
   ═══════════════════════════════════════════════ */
function CountingStat({ value, suffix, label, duration = 2000 }) {
  const [cur, setCur] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.4 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const s = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - s) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 5);
      setCur(eased * num);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration]);

  const p = parseFloat(value) > 0 ? cur / parseFloat(value) : 0;
  let r, g, b;
  if (p < 0.33) {
    const t = p / 0.33;
    r = Math.round(16 + t * (250 - 16));
    g = Math.round(185 + t * (204 - 185));
    b = Math.round(129 + t * (21 - 129));
  } else if (p < 0.66) {
    const t = (p - 0.33) / 0.33;
    r = Math.round(250 + t * (249 - 250));
    g = Math.round(204 + t * (115 - 204));
    b = Math.round(21 + t * (22 - 21));
  } else {
    const t = (p - 0.66) / 0.34;
    r = Math.round(249 + t * (239 - 249));
    g = Math.round(115 + t * (68 - 115));
    b = Math.round(22 + t * (68 - 22));
  }
  const color = `rgb(${r},${g},${b})`;
  const glowOpacity = 0.05 + p * 0.45;
  const glowSize = 12 + p * 35;
  const glow = `0 0 ${glowSize}px rgba(${r},${g},${b},${glowOpacity})`;

  return (
    <div ref={ref} style={{ flex: "0 0 auto", textAlign: "center", padding: "16px 20px", minWidth: 120 }}>
      <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color, textShadow: glow, lineHeight: 1.1 }}>
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
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth || 300;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, w / height, 0.1, 100);
    cam.position.set(0, 0.3, 7);
    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    ren.setSize(w, height);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.setClearColor(0, 0);
    el.appendChild(ren.domElement);

    scene.add(new THREE.AmbientLight(0x6677aa, 0.6));
    const key = new THREE.DirectionalLight(0x22d3ee, 1.0); key.position.set(3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x10b981, 0.5); fill.position.set(-3, 1, 3); scene.add(fill);
    const back = new THREE.DirectionalLight(0x8b5cf6, 0.3); back.position.set(0, 2, -4); scene.add(back);

    const body = new THREE.Group();
    const fatScale = 1 + Math.max(0, fatPct - 15) * 0.015;
    const musScale = 1 + Math.max(0, 30 - fatPct) * 0.01;

    const matSkin = new THREE.MeshStandardMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.22, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
    const matFat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.55, roughness: 0.6 });
    const matMuscle = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, roughness: 0.4, metalness: 0.15 });
    const matBone = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.3 });
    const matVisc = new THREE.MeshStandardMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45, roughness: 0.7 });

    // TORSO
    const torsoGeo = new THREE.SphereGeometry(1, 32, 28);
    torsoGeo.scale(0.65 * fatScale, 1.05, 0.45 * fatScale);
    const torso = new THREE.Mesh(torsoGeo, matSkin);
    torso.position.y = 0.3;
    body.add(torso);

    // CHEST
    const chestGeo = new THREE.SphereGeometry(0.55, 24, 20);
    chestGeo.scale(0.8 * musScale, 0.6, 0.5);
    const chest = new THREE.Mesh(chestGeo, matMuscle);
    chest.position.y = 0.85;
    body.add(chest);

    // FAT LAYER
    const fatGeo = new THREE.SphereGeometry(0.75 * fatScale, 28, 22);
    fatGeo.scale(0.58, 0.8, 0.4);
    const fatMesh = new THREE.Mesh(fatGeo, matFat);
    fatMesh.position.y = 0.2;
    body.add(fatMesh);

    // MUSCLE CORE
    const muscGeo = new THREE.SphereGeometry(0.45 * musScale, 24, 18);
    muscGeo.scale(0.55, 0.85, 0.38);
    const muscMesh = new THREE.Mesh(muscGeo, matMuscle);
    muscMesh.position.y = 0.3;
    body.add(muscMesh);

    // VISCERAL FAT
    if (fatPct > 22) {
      const viscAmount = (fatPct - 22) / 23;
      const viscGeo = new THREE.SphereGeometry(0.2 + viscAmount * 0.2, 18, 14);
      viscGeo.scale(1.3, 0.7, 1.1);
      const viscMesh = new THREE.Mesh(viscGeo, matVisc);
      viscMesh.position.y = 0.1;
      body.add(viscMesh);
    }

    // SPINE
    for (let i = 0; i < 12; i++) {
      const vertGeo = new THREE.SphereGeometry(0.06, 8, 6);
      vertGeo.scale(1, 0.6, 0.8);
      const vert = new THREE.Mesh(vertGeo, matBone);
      vert.position.y = -0.3 + i * 0.2;
      body.add(vert);
    }

    // HEAD
    const headGeo = new THREE.SphereGeometry(0.35, 28, 22);
    headGeo.scale(0.85, 1, 0.85);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.85;
    body.add(head);

    // NECK
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 12);
    const neck = new THREE.Mesh(neckGeo, matSkin);
    neck.position.y = 1.55;
    body.add(neck);

    // PELVIS
    const pelGeo = new THREE.SphereGeometry(0.28, 14, 10);
    pelGeo.scale(1.4, 0.5, 0.9);
    const pelvis = new THREE.Mesh(pelGeo, matBone);
    pelvis.position.y = -0.4;
    body.add(pelvis);

    // ARMS
    [-1, 1].forEach(side => {
      const uaGeo = new THREE.CylinderGeometry(0.1 * musScale, 0.09, 0.7, 12);
      const ua = new THREE.Mesh(uaGeo, matMuscle);
      ua.position.set(side * 0.72, 0.65, 0); ua.rotation.z = side * 0.12;
      body.add(ua);

      const faGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.65, 10);
      const fa = new THREE.Mesh(faGeo, matSkin);
      fa.position.set(side * 0.78, 0.1, 0); fa.rotation.z = side * 0.05;
      body.add(fa);

      const shGeo = new THREE.SphereGeometry(0.13 * musScale, 12, 10);
      const sh = new THREE.Mesh(shGeo, matMuscle);
      sh.position.set(side * 0.68, 1.05, 0);
      body.add(sh);
    });

    // LEGS
    [-1, 1].forEach(side => {
      const thGeo = new THREE.CylinderGeometry(0.17 * fatScale, 0.13, 0.9, 14);
      const th = new THREE.Mesh(thGeo, fatPct > 25 ? matFat : matMuscle);
      th.position.set(side * 0.25, -1.0, 0);
      body.add(th);

      const shGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.85, 12);
      const sh = new THREE.Mesh(shGeo, matSkin);
      sh.position.set(side * 0.25, -1.85, 0);
      body.add(sh);

      const feGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.8, 6);
      const fe = new THREE.Mesh(feGeo, matBone);
      fe.position.set(side * 0.25, -1.0, 0);
      body.add(fe);

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
    const anim = () => {
      fRef.current = requestAnimationFrame(anim);
      t += 0.014;
      body.rotation.y += 0.003;
      body.position.y = -0.2 + Math.sin(t * 0.7) * 0.04;
      pts.rotation.y -= 0.0008;
      ren.render(scene, cam);
    };
    anim();
    return () => {
      cancelAnimationFrame(fRef.current);
      if (el.contains(ren.domElement)) el.removeChild(ren.domElement);
      ren.dispose();
    };
  }, [fatPct, height]);

  const dn = e => { setDragging(true); dRef.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, ry: sRef.current.body?.rotation.y || 0 }; };
  const mv = useCallback(e => {
    if (!dragging || !sRef.current.body) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    sRef.current.body.rotation.y = dRef.current.ry + (x - dRef.current.x) * 0.01;
  }, [dragging]);
  const up = () => setDragging(false);

  useEffect(() => {
    addEventListener("pointermove", mv); addEventListener("pointerup", up);
    addEventListener("touchmove", mv); addEventListener("touchend", up);
    return () => {
      removeEventListener("pointermove", mv); removeEventListener("pointerup", up);
      removeEventListener("touchmove", mv); removeEventListener("touchend", up);
    };
  }, [mv]);

  return (
    <div ref={mountRef} onPointerDown={dn} onTouchStart={dn}
      style={{ width: "100%", height, cursor: dragging ? "grabbing" : "grab", touchAction: "none", position: "relative" }}>
      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#334155", fontFamily: "'JetBrains Mono',monospace", background: "#020617cc", padding: "3px 10px", borderRadius: 8, pointerEvents: "none", border: "1px solid #1e293b" }}>
        ↔ покрутите 3D-модель пальцем
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3D BONE MODEL — thick recognizable femur
   ═══════════════════════════════════════════════ */
function BoneCrossSection({ density = 0.8, height = 280 }) {
  const mountRef = useRef(null);
  const dragRef = useRef({ active: false, x: 0, rotY: 0 });
  const zoomRef = useRef({ dist: 0, scale: 1 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth || 300;
    const h = height;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    cam.position.set(0, 0, 9.5);
    cam.lookAt(0, 0, 0);

    const ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    ren.setSize(w, h);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.setClearColor(0, 0);
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 1.1;
    el.appendChild(ren.domElement);

    scene.add(new THREE.AmbientLight(0xfff8f0, 0.6));
    const key = new THREE.DirectionalLight(0xfff0dd, 1.4); key.position.set(3, 5, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xb0c4de, 0.5); fill.position.set(-4, 1, 3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x22d3ee, 0.25); rim.position.set(0, -4, -4); scene.add(rim);

    const d = density;
    const femur = new THREE.Group();

    const healthyC = new THREE.Color(0.98, 0.95, 0.88);
    const sickC = new THREE.Color(0.55, 0.42, 0.32);
    const boneColor = healthyC.clone().lerp(sickC, 1 - d);

    const boneMat = new THREE.MeshStandardMaterial({ color: boneColor, roughness: 0.45, metalness: 0.02, transparent: true, opacity: 0.55 + d * 0.45, side: THREE.DoubleSide });
    const solidMat = new THREE.MeshStandardMaterial({ color: boneColor, roughness: 0.4, metalness: 0.03 });
    const cortMat = new THREE.MeshStandardMaterial({ color: boneColor.clone().multiplyScalar(0.92), roughness: 0.35, metalness: 0.02, transparent: true, opacity: 0.3 + d * 0.35 });

    // SHAFT
    const shaftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.3, 0), new THREE.Vector3(-0.04, -1.2, 0.03),
      new THREE.Vector3(-0.07, 0, 0.05), new THREE.Vector3(-0.04, 1.0, 0.03),
      new THREE.Vector3(0, 1.7, 0),
    ]);
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(shaftCurve, 48, 0.38, 20, false), boneMat));
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(shaftCurve, 48, 0.42, 20, false), cortMat));

    // NECK
    const neckB = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 18), solidMat);
    neckB.position.set(0.35, 1.9, 0); neckB.rotation.z = -Math.PI / 3;
    femur.add(neckB);

    // HEAD
    const headB = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 22), solidMat);
    headB.position.set(0.75, 2.3, 0);
    femur.add(headB);

    // Cartilage cap
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xc8e0f0, transparent: true, opacity: 0.12 + d * 0.12, roughness: 0.15, metalness: 0.1 });
    const cart = new THREE.Mesh(new THREE.SphereGeometry(0.475, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), cartMat);
    cart.position.set(0.75, 2.3, 0); cart.rotation.x = -0.4;
    femur.add(cart);

    // GREATER TROCHANTER
    const troch = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), solidMat);
    troch.position.set(-0.2, 1.85, 0); troch.scale.set(1.0, 1.4, 0.85);
    femur.add(troch);

    // Lesser trochanter
    const lt = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), solidMat);
    lt.position.set(0.3, 1.35, 0.15);
    femur.add(lt);

    // CONDYLES
    const medC = new THREE.Mesh(new THREE.SphereGeometry(0.45, 22, 16), solidMat);
    medC.position.set(0.22, -2.5, 0); medC.scale.set(0.85, 0.8, 1.1);
    femur.add(medC);
    const latC = new THREE.Mesh(new THREE.SphereGeometry(0.42, 22, 16), solidMat);
    latC.position.set(-0.22, -2.5, 0); latC.scale.set(0.85, 0.8, 1.1);
    femur.add(latC);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 10), solidMat);
    bridge.position.set(0, -2.5, 0); bridge.rotation.z = Math.PI / 2;
    femur.add(bridge);

    // Patellar surface
    const patel = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), cartMat.clone());
    patel.position.set(0, -2.25, 0.35); patel.scale.set(1.3, 0.85, 0.5);
    femur.add(patel);

    // Linea aspera ridge
    const lineaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, -1.7, -0.35), new THREE.Vector3(-0.07, -0.5, -0.38),
      new THREE.Vector3(-0.06, 0.5, -0.37), new THREE.Vector3(-0.02, 1.3, -0.3),
    ]);
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(lineaCurve, 24, 0.05, 8, false), solidMat));

    // Internal trabecular wireframe
    if (d < 0.95) {
      const trabMat = new THREE.MeshStandardMaterial({
        color: boneColor.clone().multiplyScalar(0.7), transparent: true,
        opacity: Math.max(0.05, d * 0.25), roughness: 0.8, wireframe: true,
      });
      const trabGeo = new THREE.CylinderGeometry(0.25, 0.25, 3.5, 8, 12);
      const trab = new THREE.Mesh(trabGeo, trabMat);
      trab.position.y = -0.3;
      femur.add(trab);
    }

    // OSTEOPOROSIS EROSION
    if (d < 0.7) {
      const severity = (0.7 - d) / 0.55;
      const cavCount = Math.floor(severity * 30) + 5;
      const cavMat = new THREE.MeshStandardMaterial({ color: 0x0c0c1e, roughness: 0.95, transparent: true, opacity: 0.5 + severity * 0.4 });
      for (let i = 0; i < cavCount; i++) {
        const r = 0.03 + Math.random() * 0.08 * (1 + severity);
        const cav = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), cavMat);
        const t = 0.1 + Math.random() * 0.8;
        const pt = shaftCurve.getPoint(t);
        const ang = Math.random() * Math.PI * 2;
        const depth = Math.random() * 0.25;
        cav.position.set(pt.x + Math.cos(ang) * depth, pt.y, pt.z + Math.sin(ang) * depth);
        femur.add(cav);
      }
      if (severity > 0.3) {
        for (let i = 0; i < Math.floor(severity * 12); i++) {
          const r2 = 0.02 + Math.random() * 0.06;
          const nc = new THREE.Mesh(new THREE.SphereGeometry(r2, 6, 6), cavMat);
          nc.position.set(0.2 + Math.random() * 0.4, 1.6 + Math.random() * 0.5, (Math.random() - 0.5) * 0.25);
          femur.add(nc);
        }
      }
      if (severity > 0.6) {
        const crMat = new THREE.MeshStandardMaterial({ color: 0x1a0505, transparent: true, opacity: 0.4 });
        for (let i = 0; i < 4; i++) {
          const cr = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.3 + Math.random() * 0.3, 0.5), crMat);
          cr.position.set(0, -1.5 + Math.random() * 3, 0);
          cr.rotation.y = Math.random() * Math.PI; cr.rotation.z = (Math.random() - 0.5) * 0.3;
          femur.add(cr);
        }
      }
    }

    // Healthy glow
    if (d > 0.7) {
      const gc = d > 0.85 ? 0x10b981 : 0x22d3ee;
      const gm = new THREE.MeshStandardMaterial({ color: gc, emissive: gc, emissiveIntensity: 0.15, transparent: true, opacity: 0.06 });
      femur.add(new THREE.Mesh(new THREE.TubeGeometry(shaftCurve, 24, 0.48, 16, false), gm));
    }

    femur.rotation.x = 0.05;
    femur.position.y = 0;
    femur.scale.setScalar(0.82);
    scene.add(femur);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      if (!dragRef.current.active) femur.rotation.y += 0.004;
      femur.position.y = Math.sin(t * 0.6) * 0.03;
      const s = 0.82 * zoomRef.current.scale;
      femur.scale.set(s, s, s);
      ren.render(scene, cam);
    };
    animate();

    const onDown = (e) => { dragRef.current.active = true; dragRef.current.x = (e.clientX || e.touches?.[0]?.clientX || 0); dragRef.current.rotY = femur.rotation.y; };
    const onMove = (e) => { if (!dragRef.current.active) return; const cx = (e.clientX || e.touches?.[0]?.clientX || 0); femur.rotation.y = dragRef.current.rotY + (cx - dragRef.current.x) * 0.01; };
    const onUp = () => { dragRef.current.active = false; };

    const getTouchDist = (e) => {
      if (e.touches.length < 2) return 0;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onTouchStart = (e) => { if (e.touches.length === 2) { zoomRef.current.dist = getTouchDist(e); e.preventDefault(); } };
    const onTouchMove2 = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const newDist = getTouchDist(e);
        if (zoomRef.current.dist > 0) {
          const delta = newDist / zoomRef.current.dist;
          zoomRef.current.scale = Math.max(0.5, Math.min(2.5, zoomRef.current.scale * delta));
          zoomRef.current.dist = newDist;
        }
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      zoomRef.current.scale = Math.max(0.5, Math.min(2.5, zoomRef.current.scale * factor));
    };

    const cv = ren.domElement;
    cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp); cv.addEventListener("pointerleave", onUp);
    cv.addEventListener("touchstart", onTouchStart, { passive: false });
    cv.addEventListener("touchmove", onTouchMove2, { passive: false });
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.style.touchAction = "none";

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener("pointerdown", onDown); cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp); cv.removeEventListener("pointerleave", onUp);
      cv.removeEventListener("touchstart", onTouchStart);
      cv.removeEventListener("touchmove", onTouchMove2);
      cv.removeEventListener("wheel", onWheel);
      ren.dispose(); el.removeChild(cv);
    };
  }, [density, height]);

  return <div ref={mountRef} style={{ width: "100%", height, cursor: "grab" }} />;
}

/* ═══════════════════════════════════════════════
   BODY X-RAY — anatomic silhouette + scan
   ═══════════════════════════════════════════════ */
const XRAY_DATA = [
  { id: "anna", name: "Анна", age: 34, shape: "thin", fat: 36, muscle: 28, bone: 4, visceral: 14, verdict: "Skinny Fat", desc: "Скрытое ожирение", vc: "#ef4444", risk: "Риск диабета ×2.4, сердечно-сосудистых ×1.8", fatLayer: 18, visceralGlow: 0.5 },
  { id: "dima", name: "Дмитрий", age: 28, shape: "athletic", fat: 14, muscle: 52, bone: 6, visceral: 4, verdict: "Атлет", desc: "Здоровый состав", vc: "#10b981", risk: "Все показатели в норме", fatLayer: 5, visceralGlow: 0 },
];

function BodyCompare() {
  const [who, setWho] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPos, setScanPos] = useState(0);
  const p = XRAY_DATA[who];

  useEffect(() => {
    if (!isScanning) return;
    setScanPos(0);
    let start = null;
    const duration = 2800;
    const tick = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const eased = prog < 0.5 ? 4 * prog * prog * prog : 1 - Math.pow(-2 * prog + 2, 3) / 2;
      setScanPos(eased * 100);
      if (prog < 1) requestAnimationFrame(tick);
      else setIsScanning(false);
    };
    requestAnimationFrame(tick);
  }, [isScanning]);

  const switchPerson = (i) => { setWho(i); setScanPos(0); setIsScanning(false); };
  const scanned = scanPos > 95;

  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: "#080e1b", border: "1px solid #1e293b" }}>
      {/* Weight badge */}
      <div style={{ textAlign: "center", padding: "18px 16px 0" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 30, background: "#1e293b", border: "1px solid #334155" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 7H4C3.45 7 3 7.45 3 8V18C3 18.55 3.45 19 4 19H20C20.55 19 21 18.55 21 18V8C21 7.45 20.55 7 20 7Z" stroke="#64748b" strokeWidth="1.5" fill="none"/>
            <path d="M12 7V5M8 7V6M16 7V6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#e2e8f0", fontFamily: "'JetBrains Mono',monospace" }}>68</span>
          <span style={{ fontSize: 11, color: "#64748b" }}>кг — одинаково</span>
        </div>
      </div>

      {/* Person tabs */}
      <div style={{ display: "flex", gap: 8, padding: "14px 16px 0", justifyContent: "center" }}>
        {XRAY_DATA.map((d, i) => (
          <button key={d.id} onClick={() => switchPerson(i)} style={{
            flex: 1, maxWidth: 160, padding: "10px 12px", borderRadius: 14,
            border: `2px solid ${who === i ? d.vc + "55" : "#1e293b"}`,
            background: who === i ? d.vc + "0c" : "#0f172a",
            cursor: "pointer", transition: "all 0.35s",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: who === i ? "#e2e8f0" : "#64748b", transition: "color 0.3s" }}>{d.name}</div>
            <div style={{ fontSize: 11, color: who === i ? d.vc : "#475569", marginTop: 1, transition: "color 0.3s" }}>{d.age} лет</div>
          </button>
        ))}
      </div>

      {/* BODY SVG + SCANNER */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
        <div style={{ position: "relative", width: 260, height: 380 }}>
          <svg width="100%" height="100%" viewBox="0 0 280 420" fill="none" style={{ filter: "drop-shadow(0 0 12px rgba(0,0,0,0.5))" }}>
            <defs>
              <path id="shAth" d="M140 30 C155 30 165 42 165 58 C165 65 162 68 185 75 C205 82 205 95 200 130 C195 165 175 190 175 190 L178 260 C178 260 182 280 178 310 L175 400 L155 400 L158 310 C158 290 155 260 155 260 L148 210 L132 210 L125 260 C125 260 122 290 122 310 L125 400 L105 400 L102 310 C98 280 102 260 102 260 L105 190 C105 190 85 165 80 130 C75 95 75 82 95 75 C118 68 115 65 115 58 C115 42 125 30 140 30 Z"/>
              <path id="shThin" d="M140 35 C152 35 160 45 160 60 C160 68 158 70 172 78 C182 85 182 95 180 130 C178 170 172 195 172 195 L170 260 C170 260 172 280 170 310 L168 400 L152 400 L154 310 C154 290 152 260 152 260 L145 210 L135 210 L128 260 C128 260 126 290 126 310 L128 400 L112 400 L110 310 C108 280 110 260 110 260 L108 195 C108 195 102 170 100 130 C98 95 98 85 108 78 C122 70 120 68 120 60 C120 45 128 35 140 35 Z"/>
              <clipPath id="bcp"><use href={p.shape === "athletic" ? "#shAth" : "#shThin"}/></clipPath>
              <linearGradient id="mGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b91c1c"/><stop offset="50%" stopColor="#ef4444"/><stop offset="100%" stopColor="#7f1d1d"/></linearGradient>
              <linearGradient id="bGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
            </defs>

            <g>
              <use href={p.shape === "athletic" ? "#shAth" : "#shThin"} fill="#1e293b" opacity={isScanning || scanPos > 0 ? 0.3 : 1} style={{ transition: "opacity 0.5s" }}/>
              <use href={p.shape === "athletic" ? "#shAth" : "#shThin"} stroke="#334155" strokeWidth="1.5" fill="none"/>
            </g>

            <g clipPath="url(#bcp)">
              <mask id="sMask"><rect x="0" y="0" width="280" height={(scanPos / 100) * 420} fill="white"/></mask>
              <g mask="url(#sMask)">
                <rect width="280" height="420" fill="#0f172a"/>
                <g opacity={p.muscle < 35 ? 0.35 : 0.75}>
                  <path d="M140 85 Q165 85 170 120 L165 145 Q140 155 142 120" fill="url(#mGr)" opacity="0.6"/>
                  <path d="M140 85 Q115 85 110 120 L115 145 Q140 155 138 120" fill="url(#mGr)" opacity="0.6"/>
                  {p.shape === "athletic" && <path d="M125 150 L155 150 L152 200 L128 200 Z" fill="#ef4444" opacity="0.25"/>}
                  <ellipse cx="165" cy="250" rx={p.shape === "athletic" ? 14 : 9} ry="40" fill="url(#mGr)" opacity="0.5"/>
                  <ellipse cx="115" cy="250" rx={p.shape === "athletic" ? 14 : 9} ry="40" fill="url(#mGr)" opacity="0.5"/>
                  <ellipse cx="190" cy="120" rx="8" ry="25" fill="url(#mGr)" opacity="0.5" transform="rotate(-10 190 120)"/>
                  <ellipse cx="90" cy="120" rx="8" ry="25" fill="url(#mGr)" opacity="0.5" transform="rotate(10 90 120)"/>
                </g>
                <g fill="url(#bGr)" opacity="0.8">
                  <path d="M138 60 L142 60 L141 200 L139 200 Z" opacity="0.7"/>
                  <g stroke="#e2e8f0" strokeWidth="2" fill="none" opacity="0.4">
                    <path d="M140 90 Q165 100 160 140"/><path d="M140 90 Q115 100 120 140"/>
                    <path d="M140 105 Q162 115 158 150"/><path d="M140 105 Q118 115 122 150"/>
                  </g>
                  <path d="M120 190 Q140 215 160 190 L155 215 L125 215 Z" opacity="0.6"/>
                  <path d="M128 215 L118 310" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <path d="M152 215 L162 310" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <ellipse cx="140" cy="50" rx="14" ry="18" fill="#e2e8f0" opacity="0.85"/>
                </g>
                {p.visceral > 6 && (
                  <g style={{ mixBlendMode: "screen" }}>
                    <circle cx="140" cy="165" r="32" fill="#fbbf24" opacity={p.visceralGlow * 0.7}>
                      <animate attributeName="opacity" values={`${p.visceralGlow * 0.5};${p.visceralGlow * 0.8};${p.visceralGlow * 0.5}`} dur="3s" repeatCount="indefinite"/>
                    </circle>
                    <ellipse cx="140" cy="160" rx="18" ry="14" fill="#f59e0b" opacity="0.55"/>
                    <circle cx="130" cy="175" r="8" fill="#d97706" opacity="0.45"/>
                    <circle cx="150" cy="170" r="10" fill="#d97706" opacity="0.45"/>
                  </g>
                )}
                <use href={p.shape === "athletic" ? "#shAth" : "#shThin"} stroke="#fda4af" strokeWidth={p.fatLayer} fill="none" opacity="0.2" clipPath="url(#bcp)"/>
              </g>
            </g>
          </svg>

          {(isScanning || (scanPos > 0 && scanPos < 99)) && (
            <div style={{ position: "absolute", top: `${scanPos}%`, left: -6, right: -6, height: 2, background: "#22d3ee", boxShadow: "0 0 12px #22d3ee, 0 0 25px #22d3ee88", zIndex: 10, opacity: scanPos > 97 ? 0 : 1, transition: "opacity 0.3s" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, background: "linear-gradient(to bottom, rgba(34,211,238,0.12), transparent)", pointerEvents: "none" }}/>
            </div>
          )}

          {scanPos > 45 && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {p.visceral > 6 && (
                <div style={{ position: "absolute", top: "36%", right: 4, animation: "fadeSlide 0.5s ease 0.1s both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 28, height: 1, background: "#fbbf24", boxShadow: "0 0 4px #fbbf24" }}/>
                    <div style={{ background: "rgba(0,0,0,0.75)", padding: "3px 8px", borderRadius: 5, borderLeft: "2px solid #fbbf24", backdropFilter: "blur(4px)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", whiteSpace: "nowrap" }}>⚠ Висцеральный жир</div>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", top: "25%", left: 0, animation: "fadeSlide 0.5s ease 0.2s both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ background: "rgba(0,0,0,0.75)", padding: "3px 8px", borderRadius: 5, borderRight: "2px solid #ef4444", backdropFilter: "blur(4px)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", whiteSpace: "nowrap" }}>{p.muscle < 35 ? "Слабый тонус" : "Развитая мускулатура"}</div>
                  </div>
                  <div style={{ width: 20, height: 1, background: "#ef4444", boxShadow: "0 0 4px #ef4444" }}/>
                </div>
              </div>
              {scanPos > 55 && (
                <div style={{ position: "absolute", top: "48%", left: 0, animation: "fadeSlide 0.5s ease 0.1s both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ background: "rgba(0,0,0,0.75)", padding: "3px 8px", borderRadius: 5, borderRight: "2px solid #94a3b8", backdropFilter: "blur(4px)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", whiteSpace: "nowrap" }}>Скелет</div>
                    </div>
                    <div style={{ width: 16, height: 1, background: "#94a3b8" }}/>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HUD STATS */}
      <div style={{ padding: "8px 16px 4px", display: "flex", gap: 6 }}>
        {[
          { l: "Жир", v: p.fat, c: p.fat > 25 ? "#ef4444" : "#22d3ee", warn: p.fat > 25 },
          { l: "Мышцы", v: p.muscle, c: p.muscle < 35 ? "#f59e0b" : "#10b981", warn: p.muscle < 35 },
          { l: "Кости", v: p.bone, c: "#94a3b8", warn: false },
          { l: "Висцер.", v: p.visceral, c: p.visceral > 6 ? "#fbbf24" : "#94a3b8", warn: p.visceral > 6 },
        ].map((s, i) => {
          const vis = scanPos > (i * 20 + 18);
          return (
            <div key={s.l} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, background: "#0f172a", border: `1px solid ${vis ? s.c + "33" : "#1e293b"}`, borderBottom: `3px solid ${vis ? s.c : "#1e293b"}`, opacity: vis ? 1 : 0.2, transform: vis ? "translateY(0)" : "translateY(8px)", transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                {s.l} {s.warn && <span style={{ color: s.c, fontSize: 11, fontWeight: 900 }}>!</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: vis ? s.c : "#334155", fontFamily: "'JetBrains Mono',monospace", transition: "color 0.4s" }}>
                {s.v}<span style={{ fontSize: 10, opacity: 0.7 }}>%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SCAN BUTTON */}
      <div style={{ textAlign: "center", padding: "10px 16px 14px" }}>
        <button onClick={() => { if (!isScanning) { setScanPos(0); setTimeout(() => setIsScanning(true), 50); } }}
          style={{ padding: "13px 32px", borderRadius: 14, background: isScanning ? "#1e293b" : scanned ? `linear-gradient(135deg, ${p.vc}30, ${p.vc}15)` : "linear-gradient(135deg, #22d3ee25, #0891b215)", border: `2px solid ${isScanning ? "#334155" : scanned ? p.vc + "44" : "#22d3ee33"}`, cursor: isScanning ? "default" : "pointer", transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 10 }}>
          {isScanning ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin3d 1s linear infinite" }}><circle cx="8" cy="8" r="6" stroke="#22d3ee" strokeWidth="2" fill="none" strokeDasharray="20 20" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee", fontFamily: "'Outfit',sans-serif" }}>Сканирование...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={scanned ? p.vc : "#22d3ee"} strokeWidth="1.5" fill="none"/><circle cx="12" cy="10" r="3" stroke={scanned ? p.vc : "#22d3ee"} strokeWidth="1.2" fill="none"/><line x1="12" y1="13" x2="12" y2="19" stroke={scanned ? p.vc : "#22d3ee"} strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="16" x2="16" y2="16" stroke={scanned ? p.vc : "#22d3ee"} strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: scanned ? p.vc : "#22d3ee", fontFamily: "'Outfit',sans-serif", transition: "color 0.3s" }}>{scanned ? "Сканировать снова" : "Запустить рентген"}</span>
            </>
          )}
        </button>
        {!scanned && !isScanning && <div style={{ fontSize: 11, color: "#475569", marginTop: 8, animation: "float 2.5s ease-in-out infinite" }}>☝️ Нажмите чтобы просканировать тело</div>}
      </div>

      {/* VERDICT */}
      {scanned && (
        <div style={{ animation: "fadeSlide 0.6s ease" }}>
          <div style={{ margin: "0 16px 12px", padding: "14px 16px", borderRadius: 14, background: p.vc + "0a", border: `1px solid ${p.vc}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: p.vc + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {p.vc === "#ef4444" ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 9V13M12 17H12.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><path d="M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="#ef4444" strokeWidth="1.5" fill="#ef444410"/></svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="1.5" fill="#10b98110"/><path d="M8 12L11 15L16 9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: p.vc }}>{p.verdict}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: p.vc + "15", border: `1px solid ${p.vc}33`, fontSize: 10, color: p.vc, fontWeight: 700 }}>{p.desc}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{p.risk}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: "0 16px 20px" }}>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          Одинаковый вес. Одинаковый ИМТ.<br/>
          <span style={{ color: "#e2e8f0", fontWeight: 700 }}>Весы не покажут. DXA — покажет.</span>
        </div>
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
   MAIN — LandingPage
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
  const [boneOpen, setBoneOpen] = useState(false);

  const card = { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", borderRadius: 20, padding: 24, border: "1px solid #334155" };
  const fd = fatDesc(fat);
  const bd = boneDesc(bone);

  if (loading) return <Splash onDone={() => setLoading(false)} />;

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit',sans-serif", overflow: "hidden" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* HERO */}
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

        {/* STATS STRIP */}
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

        {/* COMPARE */}
        <Reveal from="left" delay={100}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "#22d3ee", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DXA-СКАНЕР</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Один вес. Два разных тела.</h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 14px" }}>Выберите человека и запустите сканирование</p>
            <BodyCompare />
          </div>
        </Reveal>

        {/* 3D BODY */}
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

        {/* PROFILES */}
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

        {/* BONE — COLLAPSIBLE */}
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

                  {/* Age risk */}
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

        {/* QUIZ */}
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

        {/* MYTHS */}
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

        {/* THREATS */}
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

        {/* CTA */}
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
