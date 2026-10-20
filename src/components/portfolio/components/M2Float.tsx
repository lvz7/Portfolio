import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// A BMW M2 G87 on the right edge of the screen.
// Scroll: the car moves down the right side and turns.
// Keys: D opens and closes the doors, L turns the lights on and off.
// Wheels spin and the rear tires smoke, like a burnout.

const MODEL_SRC = "/models/bmw-m2-g87.glb";
const THREE_SRC = "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
const GLTF_SRC = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";

const CAR_WIDTH = 640;
const CAR_HEIGHT = 400;
const RIGHT_OFFSET = 540; // Keeps the car on screen. The box is placed this far from the right edge.
const TOP_OFFSET = 96; // Keeps the car below the sticky header.
const BOTTOM_OFFSET = 24;
const DOOR_OPEN_ANGLE = (Math.PI * 54) / 180;
const WHEEL_SPEED = 26; // radians per second
const SMOKE_RATE = 60; // particles per second

// Loads Three.js and the GLTF loader as plain scripts, once per page.
let libraryPromise: Promise<void> | null = null;
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
function loadLibrary() {
  if (!libraryPromise) {
    libraryPromise = loadScript(THREE_SRC).then(() => loadScript(GLTF_SRC));
  }
  return libraryPromise;
}

// True if the object or any of its parents has a name matching the pattern.
function hasAncestorNamed(obj: any, pattern: RegExp): boolean {
  let o = obj;
  while (o) {
    if (o.name && pattern.test(o.name)) return true;
    o = o.parent;
  }
  return false;
}

export default function M2Float() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  // Holds the scene state the key handler and animation loop need.
  const controls = useRef({ doorsOpen: false, lightsOn: false });

  useEffect(() => {
    const mount = mountRef.current;
    const wrap = wrapRef.current;
    if (!mount || !wrap) return;

    let disposed = false;
    let frame = 0;
    let renderer: any = null;
    let lastTime = performance.now();
    const cleanups: Array<() => void> = [];

    loadLibrary()
      .then(() => {
        if (disposed) return;
        const THREE = (window as any).THREE;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(CAR_WIDTH, CAR_HEIGHT);
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, CAR_WIDTH / CAR_HEIGHT, 0.1, 100);
        camera.position.set(3.4, 1.5, 6.2);
        camera.lookAt(0, 0.35, 0);

        // Night lighting: a dim blue moon, a faint fill, and low ambient light.
        scene.add(new THREE.AmbientLight(0x3a4a66, 0.5));
        const moon = new THREE.DirectionalLight(0xc8dcff, 0.7);
        moon.position.set(-3, 5, 4);
        scene.add(moon);
        const fill = new THREE.DirectionalLight(0x355a8c, 0.35);
        fill.position.set(4, 2, -3);
        scene.add(fill);

        const carRoot = new THREE.Group();
        scene.add(carRoot);

        // Glow sprites for the lights.
        const glowTexture = makeGlowTexture(THREE);
        const glows: any[] = [];

        const loader = new THREE.GLTFLoader();
        loader.load(
          MODEL_SRC,
          (gltf: any) => {
            if (disposed) return;
            const model = gltf.scene;
            carRoot.add(model);
            model.updateMatrixWorld(true);

            // Center the car on the origin so rotation looks natural.
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.updateMatrixWorld(true);

            const wheelPivots = setupWheels(THREE, model, carRoot);
            const doorPivots = setupDoors(THREE, model, carRoot);
            const lightMeshes = setupLights(THREE, model);
            setupFlares(THREE, model, carRoot, glowTexture, glows);

            // Smoke from the rear tires.
            const smoke = setupSmoke(THREE, carRoot, glowTexture);

            setLoaded(true);

            const animate = (now: number) => {
              frame = requestAnimationFrame(animate);
              const dt = Math.min((now - lastTime) / 1000, 0.05);
              lastTime = now;

              // Scroll turns the car one full rotation over the page.
              const max = document.documentElement.scrollHeight - window.innerHeight;
              const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
              carRoot.rotation.y = p * Math.PI * 2;

              // Moves the car down the right edge.
              const x = Math.max(window.innerWidth - RIGHT_OFFSET, 0);
              const freeHeight = Math.max(window.innerHeight - CAR_HEIGHT - TOP_OFFSET - BOTTOM_OFFSET, 0);
              const y = TOP_OFFSET + freeHeight * p;
              wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;

              // Doors ease open and closed.
              const doorTarget = controls.current.doorsOpen ? 1 : 0;
              doorPivots.forEach((d: any) => {
                d.t += (doorTarget - d.t) * Math.min(1, dt * 4);
                d.pivot.rotation.y = d.sign * DOOR_OPEN_ANGLE * d.t;
              });

              // Lights switch on and off.
              const lightsOn = controls.current.lightsOn;
              lightMeshes.forEach((m: any) => {
                m.material.emissiveIntensity = lightsOn ? m.onIntensity : 0;
              });
              glows.forEach((g: any) => {
                g.material.opacity = lightsOn ? g.onOpacity : 0;
              });

              // Wheels spin, and the rear tires smoke.
              if (!reduceMotion) {
                wheelPivots.forEach((w: any) => {
                  w.rotation.x += WHEEL_SPEED * dt;
                });
                smoke.update(dt, wheelPivots.filter((w: any) => w.rear));
              }

              renderer.render(scene, camera);
            };
            frame = requestAnimationFrame(animate);

            // Keys: D for doors, L for lights.
            const onKey = (e: KeyboardEvent) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              const target = e.target as HTMLElement | null;
              if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
              if (e.key === "d" || e.key === "D") {
                controls.current.doorsOpen = !controls.current.doorsOpen;
              }
              if (e.key === "l" || e.key === "L") {
                controls.current.lightsOn = !controls.current.lightsOn;
              }
            };
            window.addEventListener("keydown", onKey);
            cleanups.push(() => window.removeEventListener("keydown", onKey));
          },
          undefined,
          () => {
            setLoaded(false);
          },
        );
      })
      .catch(() => {
        setLoaded(false);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanups.forEach((c) => c());
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
    // The scene is built once. Reduced motion is read each frame via the ref below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30 hidden lg:block"
      style={{
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <div ref={mountRef} style={{ width: CAR_WIDTH, height: CAR_HEIGHT }} />
    </div>
  );
}

function makeGlowTexture(THREE: any) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

// Groups the four wheels under pivots at their hubs, so each one spins around its axle.
function setupWheels(THREE: any, model: any, carRoot: any) {
  const wheelNodes: any[] = [];
  const pattern = /^(rimslaw_|m2g87undg_tire_|m2g87undg_brakedisc_)/;
  model.traverse((o: any) => {
    if (o.name && pattern.test(o.name)) wheelNodes.push(o);
  });

  // Groups nodes into four wheels by side (left and right) and end (front and rear).
  const groups: Record<string, { nodes: any[]; sum: any; count: number; rear: boolean }> = {};
  wheelNodes.forEach((n) => {
    const c = new THREE.Box3().setFromObject(n).getCenter(new THREE.Vector3());
    const key = `${c.x >= 0 ? "R" : "L"}${c.z >= 0 ? "F" : "B"}`;
    if (!groups[key]) groups[key] = { nodes: [], sum: new THREE.Vector3(), count: 0, rear: key.endsWith("B") };
    groups[key].nodes.push(n);
    groups[key].sum.add(c);
    groups[key].count += 1;
  });

  const pivots: any[] = [];
  Object.values(groups).forEach((g) => {
    const hub = g.sum.clone().divideScalar(g.count);
    const pivot = new THREE.Group();
    pivot.position.copy(hub);
    pivot.rear = g.rear;
    carRoot.add(pivot);
    g.nodes.forEach((n) => pivot.attach(n));
    pivots.push(pivot);
  });
  return pivots;
}

// Hinges each front and rear door on its front edge so it swings out.
function setupDoors(THREE: any, model: any, carRoot: any) {
  const doorPattern = /^m2g87undg_(door|doorpanel|doorglass)_(L|R)_\d+$/;
  const sides: Record<string, any[]> = { L: [], R: [] };
  model.traverse((o: any) => {
    const m = o.name && o.name.match(doorPattern);
    if (m) sides[m[2]].push(o);
  });

  const result: any[] = [];
  (["L", "R"] as const).forEach((side) => {
    const nodes = sides[side];
    if (!nodes.length) return;
    const box = new THREE.Box3();
    nodes.forEach((n) => box.expandByObject(n));
    const center = box.getCenter(new THREE.Vector3());
    const hinge = new THREE.Vector3(center.x, center.y, box.max.z);
    const pivot = new THREE.Group();
    pivot.position.copy(hinge);
    carRoot.add(pivot);
    nodes.forEach((n) => pivot.attach(n));
    // The right door swings out to the right side (negative X). The left door swings the other way.
    result.push({ pivot, sign: side === "R" ? 1 : -1, t: 0 });
  });
  return result;
}

// Finds headlight and taillight meshes and gives each its own material so only they glow.
function setupLights(THREE: any, model: any) {
  const lights: any[] = [];
  const lightPattern = /^m2g87undg_(headlight|taillight)_/;
  const glassPattern = /^m2g87undg_(headlight|taillight)glass/;
  model.traverse((o: any) => {
    if (!o.isMesh) return;
    const isLight = hasAncestorNamed(o, lightPattern) || hasAncestorNamed(o, glassPattern);
    if (!isLight) return;
    const isHead = hasAncestorNamed(o, /headlight/);
    const mat = o.material.clone();
    mat.emissive = new THREE.Color(isHead ? 0xfff1d0 : 0xff2a2a);
    mat.emissiveIntensity = 0;
    o.material = mat;
    lights.push({ material: mat, onIntensity: isHead ? 1.6 : 1.2 });
  });
  return lights;
}

// Adds soft glows at the headlights and taillights, shown when the lights are on.
function setupFlares(THREE: any, model: any, carRoot: any, texture: any, glows: any[]) {
  // One glow per headlight and taillight, placed at the centre of each light part.
  const spots: Array<{ pos: any; color: number; size: number }> = [];
  const lightPattern = /^m2g87undg_(headlight|taillight)_(L|R)_\d+$/;
  model.traverse((o: any) => {
    const m = o.name && o.name.match(lightPattern);
    if (!m) return;
    const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    const isHead = m[1] === "headlight";
    spots.push({ pos: c, color: isHead ? 0xfff1d0 : 0xff2a2a, size: isHead ? 0.16 : 0.12 });
  });
  spots.forEach((s) => {
    const mat = new THREE.SpriteMaterial({
      map: texture,
      color: s.color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(s.pos);
    sprite.scale.set(s.size, s.size, 1);
    carRoot.add(sprite);
    glows.push({ material: mat, onOpacity: 0.45 });
  });
  return spots;
}

// Smoke puffs that rise from the rear tires.
function setupSmoke(THREE: any, carRoot: any, texture: any) {
  const POOL = 90;
  const puffs: any[] = [];
  for (let i = 0; i < POOL; i++) {
    const mat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xb4bcc9,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    carRoot.add(sprite);
    puffs.push({ sprite, life: 0, maxLife: 1, vel: new THREE.Vector3() });
  }
  let next = 0;
  let accumulator = 0;

  return {
    update(dt: number, rearWheels: any[]) {
      if (rearWheels.length) {
        accumulator += dt * SMOKE_RATE;
        while (accumulator >= 1) {
          accumulator -= 1;
          const wheel = rearWheels[Math.floor(Math.random() * rearWheels.length)];
          const puff = puffs[next];
          next = (next + 1) % POOL;
          puff.sprite.position.set(
            wheel.position.x + (Math.random() - 0.5) * 0.3,
            wheel.position.y - 0.25,
            wheel.position.z - 0.2,
          );
          puff.vel.set((Math.random() - 0.5) * 0.25, 0.18 + Math.random() * 0.14, -0.9 - Math.random() * 0.8);
          puff.maxLife = 0.9 + Math.random() * 0.6;
          puff.life = puff.maxLife;
          puff.sprite.visible = true;
        }
      }
      puffs.forEach((p) => {
        if (p.life <= 0) return;
        p.life -= dt;
        if (p.life <= 0) {
          p.sprite.visible = false;
          p.sprite.material.opacity = 0;
          return;
        }
        const age = 1 - p.life / p.maxLife;
        p.sprite.position.addScaledVector(p.vel, dt);
        p.vel.multiplyScalar(1 - dt * 0.6);
        const s = 0.3 + age * 0.9;
        p.sprite.scale.set(s, s, 1);
        p.sprite.material.opacity = 0.5 * (1 - age);
      });
    },
  };
}
