import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Car, ParkingSquare } from "lucide-react";
import { CarAudio, prefetchCarSounds } from "./carAudio";

// A BMW M2 G87 on the right edge of the screen.
// Scroll: the car moves down the right side and turns.
// D: opens and closes the doors, with a door sound.
// Space: turns the engine on and off. W: rev the engine in neutral (it starts the engine if it is off). S: brake.
// Q: shift down. E: shift up (six gears). Sound lives in carAudio.ts.
// Wheels spin and the rear tires smoke, like a burnout.
//
// Drive mode (G, or the Drive button): the car leaves the right edge and you drive it
// around the whole page. W/Up gas, S/Down brake and reverse, A/Left and D/Right steer,
// Q/E change gear (each gear raises the top speed), F opens the doors, Esc parks it.
// The page scrolls to follow the car, and the car can't leave the page.

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

// Drive mode tuning. Speeds are in screen pixels per second.
const DRIVE_SCALE = 0.6; // The render box shrinks to this size while driving.
const GEAR_TOP_SPEED = [0, 300, 450, 620, 800, 980, 1150]; // Top speed per gear (index 1 to 6).
const ACCEL = 520; // Gas, px/s squared.
const BRAKE = 1100; // Braking, px/s squared.
const COAST = 260; // Slowdown when no key is held.
const MAX_REVERSE = 220;
const MAX_TURN = 2.3; // Radians per second at low speed.
const EDGE_MARGIN = 115; // How close the car centre can get to the page edge (about half the car's length).
const PX_PER_UNIT = 44; // Roughly how many screen pixels one model unit covers while driving.
const WHEEL_RADIUS = 0.35; // Model units.
const KMH_PER_PX = 0.22; // Only used for the speed readout.

// Takes the short way round when blending two angles.
function lerpAngle(a: number, b: number, t: number) {
  const d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return a + d * t;
}

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

export default function M2Float() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLSpanElement | null>(null);
  const driveApi = useRef<{ toggle: () => void } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [driving, setDriving] = useState(false);
  const reduceMotion = useReducedMotion();

  // The key handler and animation loop read this state.
  const controls = useRef({
    doorsOpen: false,
    engineOn: false,
    throttle: false,
    brake: false,
    gear: 1,
    driving: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const mount = mountRef.current;
    const wrap = wrapRef.current;
    if (!mount || !wrap) return;

    let disposed = false;
    let frame = 0;
    let renderer: any = null;
    let lastTime = performance.now();
    let sound: CarAudio | null = null;
    const cleanups: Array<() => void> = [];
    void prefetchCarSounds();

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
        // Docked view is a 3/4 angle. Drive view looks down from above and sits far enough back
        // that the car never gets cropped, whichever way it points.
        const dockCamPos = new THREE.Vector3(3.4, 1.5, 6.2);
        const dockLook = new THREE.Vector3(0, 0.35, 0);
        const driveCamPos = new THREE.Vector3(0, 10.6, 3.0);
        const driveLook = new THREE.Vector3(0, 0, 0);
        const camPos = new THREE.Vector3();
        const camLook = new THREE.Vector3();
        camera.position.copy(dockCamPos);
        camera.lookAt(dockLook);

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

        const smokeTexture = makeSmokeTexture(THREE);

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
            const smoke = setupSmoke(THREE, carRoot, smokeTexture);

            // A soft shadow on the "ground" under the car, so it reads as driving over the page.
            const carSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
            const shadowMat = new THREE.MeshBasicMaterial({
              map: smokeTexture,
              color: 0x000000,
              transparent: true,
              opacity: 0,
              depthWrite: false,
            });
            const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
            shadow.rotation.x = -Math.PI / 2;
            shadow.scale.set(carSize.x * 1.25, carSize.z * 1.15, 1);
            shadow.position.y = -carSize.y / 2 + 0.01;
            carRoot.add(shadow);

            // Drive state. The car's position is kept in page coordinates, so the page can scroll under it.
            // Heading 0 points down the screen. Heading PI points up, and -PI/2 points left.
            const drive = {
              blend: 0, // 0 = docked on the right edge, 1 = fully in drive mode
              wx: 0,
              wy: 0,
              heading: -Math.PI / 2,
              speed: 0, // signed, px/s. Negative is reverse.
              hudTimer: 0,
              lastCx: 0,
              lastCy: 0,
            };

            const ensureSound = () => {
              if (!sound) sound = new CarAudio();
              sound.resume();
              return sound;
            };

            const setDrive = (on: boolean) => {
              if (controls.current.driving === on) return;
              controls.current.driving = on;
              setDriving(on);
              controls.current.left = false;
              controls.current.right = false;
              controls.current.throttle = false;
              controls.current.brake = false;
              if (on) {
                ensureSound();
                controls.current.engineOn = true;
                if (controls.current.gear < 3) controls.current.gear = 3;
                // Start from wherever the car is on screen right now.
                drive.wx = drive.lastCx;
                drive.wy = drive.lastCy + window.scrollY;
                drive.heading = -Math.PI / 2;
                drive.speed = 0;
              }
            };
            driveApi.current = { toggle: () => setDrive(!controls.current.driving) };

            setLoaded(true);

            const animate = (now: number) => {
              frame = requestAnimationFrame(animate);
              const dt = Math.min((now - lastTime) / 1000, 0.05);
              lastTime = now;

              const isDriving = controls.current.driving;
              drive.blend += ((isDriving ? 1 : 0) - drive.blend) * Math.min(1, dt * 5);
              if (Math.abs((isDriving ? 1 : 0) - drive.blend) < 0.002) drive.blend = isDriving ? 1 : 0;
              const b = drive.blend;

              // Docked pose. Scroll turns the car one full rotation over the page and slides it down the right edge.
              const max = document.documentElement.scrollHeight - window.innerHeight;
              const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
              const dockRot = p * Math.PI * 2;
              const dockX = Math.max(window.innerWidth - RIGHT_OFFSET, 0);
              const freeHeight = Math.max(window.innerHeight - CAR_HEIGHT - TOP_OFFSET - BOTTOM_OFFSET, 0);
              const dockY = TOP_OFFSET + freeHeight * p;
              const dockCx = dockX + CAR_WIDTH / 2;
              const dockCy = dockY + CAR_HEIGHT / 2;

              // Driving physics.
              let driveSpin = 0;
              let slideSmoke = false;
              if (isDriving) {
                const { throttle: throttleKey, brake, gear, left, right, engineOn } = controls.current;
                // With the engine off (Space), the gas pedal does nothing.
                const throttle = throttleKey && engineOn;
                const top = GEAR_TOP_SPEED[gear] ?? GEAR_TOP_SPEED[3];
                let v = drive.speed;

                if (throttle && !brake) {
                  // Gas. Pushing against reverse brakes first.
                  v += (v < 0 ? BRAKE : ACCEL * (1 - Math.max(v, 0) / (top * 1.05))) * dt;
                } else if (brake && !throttle) {
                  // Brake while moving forward, then reverse.
                  v -= (v > 0 ? BRAKE : ACCEL * 0.7) * dt;
                } else if (!throttle && !brake) {
                  const drag = COAST * dt;
                  v = Math.abs(v) <= drag ? 0 : v - Math.sign(v) * drag;
                }
                // A lower gear also caps the speed, so shifting down slows the car.
                v = Math.min(v, top);
                v = Math.max(v, -MAX_REVERSE);

                // Steering works with speed, and flips when reversing.
                const steerInput = (left ? 1 : 0) - (right ? 1 : 0);
                const grip = Math.min(Math.abs(v) / 180, 1);
                const turnRate = MAX_TURN / (1 + Math.abs(v) / 900);
                drive.heading += steerInput * turnRate * grip * Math.sign(v) * dt;
                slideSmoke = steerInput !== 0 && Math.abs(v) > 420;

                // Forward on screen is (sin h, cos h) with y pointing down.
                drive.wx += Math.sin(drive.heading) * v * dt;
                drive.wy += Math.cos(drive.heading) * v * dt;

                // Walls: the car stays on the page and loses speed when it hits an edge.
                const docH = document.documentElement.scrollHeight;
                const minX = EDGE_MARGIN;
                const maxX = Math.max(window.innerWidth - EDGE_MARGIN, minX);
                const minY = EDGE_MARGIN;
                const maxY = Math.max(docH - EDGE_MARGIN, minY);
                // How head-on the hit is decides how much speed is lost, so a car scraping along an
                // edge keeps most of its speed and one driving straight into it stops quickly.
                let headOn = 0;
                if (drive.wx < minX) { drive.wx = minX; headOn = Math.max(headOn, Math.abs(Math.sin(drive.heading))); }
                if (drive.wx > maxX) { drive.wx = maxX; headOn = Math.max(headOn, Math.abs(Math.sin(drive.heading))); }
                if (drive.wy < minY) { drive.wy = minY; headOn = Math.max(headOn, Math.abs(Math.cos(drive.heading))); }
                if (drive.wy > maxY) { drive.wy = maxY; headOn = Math.max(headOn, Math.abs(Math.cos(drive.heading))); }
                if (headOn > 0) v *= 1 - Math.min(1, headOn * 4.5 * dt);
                drive.speed = v;

                // The page scrolls to keep the car in the middle band of the screen.
                const screenY = drive.wy - window.scrollY;
                const bandTop = window.innerHeight * 0.35;
                const bandBottom = window.innerHeight * 0.65;
                let scrollDelta = 0;
                if (screenY < bandTop) scrollDelta = screenY - bandTop;
                else if (screenY > bandBottom) scrollDelta = screenY - bandBottom;
                if (scrollDelta !== 0) {
                  window.scrollTo({ top: window.scrollY + scrollDelta * Math.min(1, dt * 8), behavior: "instant" });
                }

                // Wheels follow the ground speed (radians per second).
                driveSpin = v / (PX_PER_UNIT * WHEEL_RADIUS);
              } else {
                // Rolls to a stop if the car is parked mid-move.
                drive.speed = 0;
              }

              // Blend between the docked pose and the driving pose.
              const driveCx = drive.wx;
              const driveCy = drive.wy - window.scrollY;
              const cx = dockCx + (driveCx - dockCx) * b;
              const cy = dockCy + (driveCy - dockCy) * b;
              drive.lastCx = cx;
              drive.lastCy = cy;
              const scale = 1 + (DRIVE_SCALE - 1) * b;
              wrap.style.transform = `translate3d(${cx - CAR_WIDTH / 2}px, ${cy - CAR_HEIGHT / 2}px, 0) scale(${scale})`;
              carRoot.rotation.y = lerpAngle(dockRot, drive.heading, b);
              shadowMat.opacity = 0.5 * b;

              camPos.lerpVectors(dockCamPos, driveCamPos, b);
              camLook.lerpVectors(dockLook, driveLook, b);
              camera.position.copy(camPos);
              camera.lookAt(camLook);

              if (b > 0.01 && hudRef.current) {
                drive.hudTimer -= dt;
                if (drive.hudTimer <= 0) {
                  drive.hudTimer = 0.1;
                  const kmh = Math.round(Math.abs(drive.speed) * KMH_PER_PX);
                  const rpm = Math.round((750 + (sound ? sound.rpm : 0) * 6450) / 50) * 50;
                  hudRef.current.textContent = `${kmh} km/h  ·  gear ${controls.current.gear}  ·  ${rpm} rpm`;
                }
              }

              // Doors ease open and closed.
              const doorTarget = controls.current.doorsOpen ? 1 : 0;
              doorPivots.forEach((d: any) => {
                d.t += (doorTarget - d.t) * Math.min(1, dt * 4);
                d.pivot.rotation.y = d.sign * DOOR_OPEN_ANGLE * d.t;
              });

              // Wheels spin, and the rear tires smoke.
              // Docked, the car does a constant burnout. Driving, the wheels follow the ground speed,
              // and the rear tires only smoke when pulling away from a stop or sliding through a fast corner.
              const dockedSpin = reduceMotion ? 0 : WHEEL_SPEED;
              const spin = dockedSpin * (1 - b) + driveSpin * b;
              wheelPivots.forEach((w: any) => {
                w.rotation.x += spin * dt;
              });
              const { throttle: gassing, engineOn: engineRunning } = controls.current;
              const launchSmoke = isDriving && gassing && engineRunning && Math.abs(drive.speed) < 160;
              const smokeOn = isDriving ? !reduceMotion && (launchSmoke || slideSmoke) : !reduceMotion && b < 0.5;
              smoke.update(dt, smokeOn ? wheelPivots.filter((w: any) => w.rear) : []);

              // Engine and tire sound. In neutral the revs follow the pedal. While driving they follow the
              // speed and gear, and the brake and tire sounds read the same speed and steering.
              if (sound) {
                const { engineOn, throttle, brake, gear } = controls.current;
                sound.update(dt, {
                  engineOn,
                  throttle,
                  brake,
                  driving: isDriving,
                  speed: isDriving ? drive.speed : 0,
                  topSpeed: GEAR_TOP_SPEED[gear] ?? GEAR_TOP_SPEED[3],
                  slide: slideSmoke,
                });
              }

              renderer.render(scene, camera);
            };
            frame = requestAnimationFrame(animate);

            // Keys. Docked: D doors, Space engine, W gas, S brake, Q/E gears, G to start driving.
            // Driving: W/S or Up/Down for gas and brake, A/D or Left/Right to steer, F doors, Esc to park.
            const onKey = (e: KeyboardEvent) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              const target = e.target as HTMLElement | null;
              if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
              const key = e.key.toLowerCase();
              const isDriving = controls.current.driving;

              if (key === "g") {
                if (!e.repeat) setDrive(!isDriving);
                return;
              }
              if (key === "escape") {
                if (isDriving) setDrive(false);
                return;
              }

              // The arrow keys and space would scroll the page, so they are taken over while driving.
              if (isDriving && (key.startsWith("arrow") || key === " ")) e.preventDefault();

              const doorKey = isDriving ? key === "f" : key === "d" || key === "f";
              if (doorKey) {
                if (e.repeat) return;
                controls.current.doorsOpen = !controls.current.doorsOpen;
                ensureSound().door();
                return;
              }
              if (key === " ") {
                e.preventDefault();
                controls.current.engineOn = !controls.current.engineOn;
                ensureSound();
                return;
              }
              if (key === "q" || key === "e") {
                // Q shifts down, E shifts up, within gears 1 to 6.
                const next = controls.current.gear + (key === "e" ? 1 : -1);
                if (next >= 1 && next <= 6) {
                  const up = next > controls.current.gear;
                  controls.current.gear = next;
                  ensureSound().shift(up);
                }
                return;
              }
              if (key === "w" || key === "arrowup") {
                ensureSound();
                // In neutral, W starts the engine if it is off, so there is always something to rev.
                if (!isDriving && !controls.current.engineOn) controls.current.engineOn = true;
                controls.current.throttle = true;
                return;
              }
              if (key === "s" || key === "arrowdown") {
                // The brake sound comes from the physics (speed and braking), not from this key press.
                ensureSound();
                controls.current.brake = true;
                return;
              }
              if (isDriving) {
                if (key === "a" || key === "arrowleft") controls.current.left = true;
                if (key === "d" || key === "arrowright") controls.current.right = true;
              }
            };
            const onKeyUp = (e: KeyboardEvent) => {
              const key = e.key.toLowerCase();
              if (key === "w" || key === "arrowup") controls.current.throttle = false;
              if (key === "s" || key === "arrowdown") controls.current.brake = false;
              if (key === "a" || key === "arrowleft") controls.current.left = false;
              if (key === "d" || key === "arrowright") controls.current.right = false;
            };
            const onBlur = () => {
              controls.current.throttle = false;
              controls.current.brake = false;
              controls.current.left = false;
              controls.current.right = false;
            };
            window.addEventListener("keydown", onKey);
            window.addEventListener("keyup", onKeyUp);
            window.addEventListener("blur", onBlur);
            cleanups.push(() => window.removeEventListener("keydown", onKey));
            cleanups.push(() => window.removeEventListener("keyup", onKeyUp));
            cleanups.push(() => window.removeEventListener("blur", onBlur));
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
      driveApi.current = null;
      cancelAnimationFrame(frame);
      cleanups.forEach((c) => c());
      if (sound) {
        sound.dispose();
        sound = null;
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
    // The scene is built once. Reduced motion is read when the scene is set up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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

      {loaded && (
        <div className="fixed bottom-4 left-4 z-40 hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => driveApi.current?.toggle()}
            aria-pressed={driving}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-elevated backdrop-blur-md transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {driving ? <ParkingSquare className="h-4 w-4" /> : <Car className="h-4 w-4" />}
            {driving ? "Park" : "Drive the M2"}
            <kbd className="rounded border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {driving ? "Esc" : "G"}
            </kbd>
          </button>
          {driving && (
            <div className="rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground shadow-elevated backdrop-blur-md">
              <span ref={hudRef} className="font-medium tabular-nums text-foreground">
                0 km/h
              </span>
              <span className="ml-3 hidden xl:inline">W/S gas and brake · A/D steer · Q/E gears · F doors · Space engine</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function makeSmokeTexture(THREE: any) {
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
          // Short, slow puffs stay inside the render box so they fade out instead of being cut off.
          puff.vel.set((Math.random() - 0.5) * 0.12, 0.1 + Math.random() * 0.08, -0.3 - Math.random() * 0.25);
          puff.maxLife = 0.6 + Math.random() * 0.4;
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
        const s = 0.25 + age * 0.6;
        p.sprite.scale.set(s, s, 1);
        // Fade in quickly, then fade out, so no puff pops in or disappears with a hard edge.
        p.sprite.material.opacity = 0.45 * Math.min(age / 0.15, 1) * (1 - age);
      });
    },
  };
}
