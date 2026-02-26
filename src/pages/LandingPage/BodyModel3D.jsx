import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export default function BodyModel3D({ fatPct = 25, height = 340 }) {
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

    
    const torsoGeo = new THREE.SphereGeometry(1, 32, 28);
    torsoGeo.scale(0.65 * fatScale, 1.05, 0.45 * fatScale);
    const torso = new THREE.Mesh(torsoGeo, matSkin);
    torso.position.y = 0.3;
    body.add(torso);

    
    const chestGeo = new THREE.SphereGeometry(0.55, 24, 20);
    chestGeo.scale(0.8 * musScale, 0.6, 0.5);
    const chest = new THREE.Mesh(chestGeo, matMuscle);
    chest.position.y = 0.85;
    body.add(chest);

    
    const fatGeo = new THREE.SphereGeometry(0.75 * fatScale, 28, 22);
    fatGeo.scale(0.58, 0.8, 0.4);
    const fatMesh = new THREE.Mesh(fatGeo, matFat);
    fatMesh.position.y = 0.2;
    body.add(fatMesh);

    
    const muscGeo = new THREE.SphereGeometry(0.45 * musScale, 24, 18);
    muscGeo.scale(0.55, 0.85, 0.38);
    const muscMesh = new THREE.Mesh(muscGeo, matMuscle);
    muscMesh.position.y = 0.3;
    body.add(muscMesh);

    
    if (fatPct > 22) {
      const viscAmount = (fatPct - 22) / 23;
      const viscGeo = new THREE.SphereGeometry(0.2 + viscAmount * 0.2, 18, 14);
      viscGeo.scale(1.3, 0.7, 1.1);
      const viscMesh = new THREE.Mesh(viscGeo, matVisc);
      viscMesh.position.y = 0.1;
      body.add(viscMesh);
    }

    
    for (let i = 0; i < 12; i++) {
      const vertGeo = new THREE.SphereGeometry(0.06, 8, 6);
      vertGeo.scale(1, 0.6, 0.8);
      const vert = new THREE.Mesh(vertGeo, matBone);
      vert.position.y = -0.3 + i * 0.2;
      body.add(vert);
    }

    
    const headGeo = new THREE.SphereGeometry(0.35, 28, 22);
    headGeo.scale(0.85, 1, 0.85);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.85;
    body.add(head);

    
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 12);
    const neck = new THREE.Mesh(neckGeo, matSkin);
    neck.position.y = 1.55;
    body.add(neck);

    
    const pelGeo = new THREE.SphereGeometry(0.28, 14, 10);
    pelGeo.scale(1.4, 0.5, 0.9);
    const pelvis = new THREE.Mesh(pelGeo, matBone);
    pelvis.position.y = -0.4;
    body.add(pelvis);

    
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
      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono',monospace", background: "#020617cc", padding: "3px 10px", borderRadius: 8, pointerEvents: "none", border: "1px solid #1e293b" }}>
        ↔ покрутите 3D-модель пальцем
      </div>
    </div>
  );
}
