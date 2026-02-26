import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BoneCrossSection({ density = 0.8, height = 280 }) {
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

    
    const shaftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2.3, 0), new THREE.Vector3(-0.04, -1.2, 0.03),
      new THREE.Vector3(-0.07, 0, 0.05), new THREE.Vector3(-0.04, 1.0, 0.03),
      new THREE.Vector3(0, 1.7, 0),
    ]);
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(shaftCurve, 48, 0.38, 20, false), boneMat));
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(shaftCurve, 48, 0.42, 20, false), cortMat));

    
    const neckB = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 18), solidMat);
    neckB.position.set(0.35, 1.9, 0); neckB.rotation.z = -Math.PI / 3;
    femur.add(neckB);

    
    const headB = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 22), solidMat);
    headB.position.set(0.75, 2.3, 0);
    femur.add(headB);

    
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xc8e0f0, transparent: true, opacity: 0.12 + d * 0.12, roughness: 0.15, metalness: 0.1 });
    const cart = new THREE.Mesh(new THREE.SphereGeometry(0.475, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), cartMat);
    cart.position.set(0.75, 2.3, 0); cart.rotation.x = -0.4;
    femur.add(cart);

    
    const troch = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), solidMat);
    troch.position.set(-0.2, 1.85, 0); troch.scale.set(1.0, 1.4, 0.85);
    femur.add(troch);

    
    const lt = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), solidMat);
    lt.position.set(0.3, 1.35, 0.15);
    femur.add(lt);

    
    const medC = new THREE.Mesh(new THREE.SphereGeometry(0.45, 22, 16), solidMat);
    medC.position.set(0.22, -2.5, 0); medC.scale.set(0.85, 0.8, 1.1);
    femur.add(medC);
    const latC = new THREE.Mesh(new THREE.SphereGeometry(0.42, 22, 16), solidMat);
    latC.position.set(-0.22, -2.5, 0); latC.scale.set(0.85, 0.8, 1.1);
    femur.add(latC);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 10), solidMat);
    bridge.position.set(0, -2.5, 0); bridge.rotation.z = Math.PI / 2;
    femur.add(bridge);

    
    const patel = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), cartMat.clone());
    patel.position.set(0, -2.25, 0.35); patel.scale.set(1.3, 0.85, 0.5);
    femur.add(patel);

    
    const lineaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, -1.7, -0.35), new THREE.Vector3(-0.07, -0.5, -0.38),
      new THREE.Vector3(-0.06, 0.5, -0.37), new THREE.Vector3(-0.02, 1.3, -0.3),
    ]);
    femur.add(new THREE.Mesh(new THREE.TubeGeometry(lineaCurve, 24, 0.05, 8, false), solidMat));

    
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
