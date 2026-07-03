'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Image from 'next/image';

const NODE_COUNT = 60;
const CONNECTION_DIST = 250;
const PULSE_SPEED = 0.006;

interface Node3D {
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  phase: number;
}

interface Pulse {
  progress: number;
  speed: number;
  src: THREE.Vector3;
  dst: THREE.Vector3;
  ctrl: THREE.Vector3;
}

export function AuthIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    nodes: Node3D[];
    lines: { mesh: THREE.Line; a: number; b: number }[];
    pulses: Pulse[];
    nodePositions: THREE.Vector3[];
    animId: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const nodePositions: THREE.Vector3[] = [];
    const nodes: Node3D[] = [];
    const lines: { mesh: THREE.Line; a: number; b: number }[] = [];
    const pulses: Pulse[] = [];

    const depth = Math.min(W, H) * 0.6;

    for (let i = 0; i < NODE_COUNT; i++) {
      const x = (Math.random() - 0.5) * W * 1.2;
      const y = (Math.random() - 0.5) * H * 1.2;
      const z = (Math.random() - 0.5) * depth;
      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const r = 1.5 + Math.random() * 2.5;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: 0.7 }),
      );
      sphere.position.copy(pos);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(r * 3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: 0.08 }),
      );
      glow.position.copy(pos);

      scene.add(sphere);
      scene.add(glow);

      nodes.push({
        mesh: sphere,
        glow,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        vz: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < CONNECTION_DIST && dist > 0 && Math.random() < 0.15) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          const geom = new THREE.BufferGeometry().setFromPoints([
            nodePositions[i],
            nodePositions[j],
          ]);
          const line = new THREE.Line(
            geom,
            new THREE.LineBasicMaterial({
              color: 0xff5a36,
              transparent: true,
              opacity: alpha,
            }),
          );
          scene.add(line);
          lines.push({ mesh: line, a: i, b: j });
        }
      }
    }

    function spawnPulse() {
      if (lines.length === 0) return;
      const idx = Math.floor(Math.random() * lines.length);
      const { a, b } = lines[idx];
      const src = nodePositions[a];
      const dst = nodePositions[b];
      const ctrl = new THREE.Vector3(
        (src.x + dst.x) / 2 + (Math.random() - 0.5) * 60,
        (src.y + dst.y) / 2 + (Math.random() - 0.5) * 60,
        (src.z + dst.z) / 2 + (Math.random() - 0.5) * 40,
      );
      pulses.push({ progress: 0, speed: PULSE_SPEED + Math.random() * 0.004, src, dst, ctrl });
    }

    let frame = 0;
    const clock = new THREE.Clock();

    function animate() {
      frame++;
      const time = clock.getElapsedTime();

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        n.mesh.position.x += n.vx + Math.sin(time * 0.08 + n.phase) * 0.04;
        n.mesh.position.y += n.vy + Math.cos(time * 0.06 + n.phase) * 0.04;
        n.mesh.position.z += n.vz + Math.sin(time * 0.05 + n.phase * 1.3) * 0.03;

        nodePositions[i].copy(n.mesh.position);
        n.glow.position.copy(n.mesh.position);
        (n.glow.material as THREE.MeshBasicMaterial).opacity =
          0.06 + 0.04 * Math.sin(time * 0.3 + n.phase);
        (n.mesh.material as THREE.MeshBasicMaterial).opacity =
          0.55 + 0.25 * Math.sin(time * 0.25 + n.phase);

        const s = 1 + 0.1 * Math.sin(time * 0.2 + n.phase);
        n.mesh.scale.setScalar(s);
        n.glow.scale.setScalar(s);
      }

      for (const l of lines) {
        const posA = nodePositions[l.a];
        const posB = nodePositions[l.b];
        const positions = l.mesh.geometry.attributes.position;
        positions.setXYZ(0, posA.x, posA.y, posA.z);
        positions.setXYZ(1, posB.x, posB.y, posB.z);
        positions.needsUpdate = true;
      }

      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const p = pulses[pi];
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(pi, 1);
          continue;
        }
      }

      if (frame % 20 === 0) spawnPulse();

      camera.position.x = Math.sin(time * 0.03) * 30;
      camera.position.y = Math.cos(time * 0.02) * 20;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      sceneRef.current!.animId = requestAnimationFrame(animate);
    }

    sceneRef.current = { scene, camera, renderer, nodes, lines, pulses, nodePositions, animId: 0 };
    animate();

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(sceneRef.current!.animId);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/20 pointer-events-none" />

      <div className="relative z-10 flex flex-1 items-start justify-center pt-14 lg:pt-20">
        <div className="flex w-full justify-center px-8">
          <div className="w-[clamp(360px,75%,420px)]">
            <Image
              src="/recentthink-logo.svg"
              alt="RecentThink"
              width={420}
              height={420}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
