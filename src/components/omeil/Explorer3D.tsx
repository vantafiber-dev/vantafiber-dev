import { useEffect, useRef } from "react";
import { STRATEGY_COLOR } from "@/components/omeil/palette";
import { unpackGrid } from "@/lib/omeil/simulate.ts";
import type { Replay } from "@/lib/omeil/types.ts";

export function Explorer3D({
  replay,
  frameIndex,
  reducedMotion,
}: {
  replay: Replay | null;
  frameIndex: number;
  reducedMotion: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frameRef = useRef(frameIndex);
  const reducedRef = useRef(reducedMotion);
  frameRef.current = frameIndex;
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const el = host.current;
    if (!el || !replay || replay.frames.length === 0) return;
    let dead = false;
    let raf = 0;
    const cleanups: Array<() => void> = [];

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (dead || !host.current) return;

      const width = host.current.clientWidth || 640;
      const height = host.current.clientHeight || 360;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x07090c, 1);
      host.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
      camera.position.set(replay.width * 0.15, Math.max(replay.width, replay.height) * 0.95, replay.height * 0.9);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !reducedMotion;
      controls.target.set(0, 0, 0);

      const canvas = document.createElement("canvas");
      canvas.width = replay.width;
      canvas.height = replay.height;
      const ctx = canvas.getContext("2d");
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      const field = new THREE.Mesh(
        new THREE.PlaneGeometry(replay.width, replay.height),
        new THREE.MeshBasicMaterial({ map: texture }),
      );
      field.rotation.x = -Math.PI / 2;
      scene.add(field);

      const grid = new THREE.GridHelper(Math.max(replay.width, replay.height), Math.max(replay.width, replay.height), 0x2a3a4a, 0x1b2836);
      grid.position.y = 0.02;
      scene.add(grid);

      const sample = replay.frames[0];
      const count = sample?.agents.length ?? 0;
      const geo = new THREE.SphereGeometry(0.38, 12, 10);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const agents = new THREE.InstancedMesh(geo, mat, Math.max(1, count));
      agents.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      agents.count = count;
      scene.add(agents);

      const edgeGeo = new THREE.BufferGeometry();
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x3ee0c7, transparent: true, opacity: 0.45 });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      scene.add(edges);

      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      const draw = () => {
        const frame = replay.frames[Math.min(replay.frames.length - 1, Math.max(0, frameRef.current))];
        if (!frame || !ctx) return;
        const resources = unpackGrid(frame.resources, replay.width * replay.height);
        const image = ctx.createImageData(replay.width, replay.height);
        for (let i = 0; i < resources.length; i++) {
          const t = Math.max(0, Math.min(1, resources[i] / 1.5));
          image.data[i * 4] = 7 + t * 18;
          image.data[i * 4 + 1] = 14 + t * 150;
          image.data[i * 4 + 2] = 18 + t * 120;
          image.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
        texture.needsUpdate = true;

        agents.count = frame.agents.length;
        frame.agents.forEach((agent, index) => {
          dummy.position.set(agent.x - replay.width / 2 + 0.5, agent.alive ? 0.45 : 0.12, agent.y - replay.height / 2 + 0.5);
          const scale = agent.alive ? 0.55 + Math.min(0.5, agent.energy * 0.08) : 0.22;
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          agents.setMatrixAt(index, dummy.matrix);
          color.set(STRATEGY_COLOR[agent.strategy]);
          if (!agent.alive) color.multiplyScalar(0.35);
          agents.setColorAt(index, color);
        });
        agents.instanceMatrix.needsUpdate = true;
        if (agents.instanceColor) agents.instanceColor.needsUpdate = true;

        const positions: number[] = [];
        for (const [a, b] of frame.edges) {
          const pa = frame.agents[a];
          const pb = frame.agents[b];
          if (!pa || !pb) continue;
          positions.push(pa.x - replay.width / 2 + 0.5, 0.55, pa.y - replay.height / 2 + 0.5);
          positions.push(pb.x - replay.width / 2 + 0.5, 0.55, pb.y - replay.height / 2 + 0.5);
        }
        edges.geometry.dispose();
        edges.geometry = new THREE.BufferGeometry();
        edges.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      };

      const onResize = () => {
        if (!host.current) return;
        const w = host.current.clientWidth || 640;
        const h = host.current.clientHeight || 360;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const observer = new ResizeObserver(onResize);
      observer.observe(host.current);

      const loop = () => {
        if (dead) return;
        if (!reducedRef.current) controls.enableDamping = true;
        controls.update();
        draw();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      loop();

      cleanups.push(() => {
        observer.disconnect();
        cancelAnimationFrame(raf);
        controls.dispose();
        geo.dispose();
        mat.dispose();
        texture.dispose();
        field.geometry.dispose();
        (field.material as { dispose: () => void }).dispose();
        edges.geometry.dispose();
        edgeMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      });
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [replay, reducedMotion]);

  if (!replay || replay.frames.length === 0) {
    return (
      <div className="panel flex min-h-72 items-center justify-center p-6 text-center text-sm text-muted">
        No replay is stored for this record. Run an experiment in the laboratory. Instrument checks do not keep a spatial replay.
      </div>
    );
  }

  return <div ref={host} className="panel h-80 w-full overflow-hidden md:h-[28rem]" aria-label="Three-dimensional replay of stored agent positions" />;
}
