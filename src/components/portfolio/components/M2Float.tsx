import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Drop the model file at public/models/bmw-m2-g87.glb to show the car.
// Until that file exists the element stays hidden.
const MODEL_SRC = "/models/bmw-m2-g87.glb";
const MODEL_VIEWER_SCRIPT = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.4.0/dist/model-viewer.min.js";
const CAR_WIDTH = 320;
const CAR_HEIGHT = 200;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export default function M2Float() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const carRef = useRef<HTMLElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  // Load the viewer script once, only when this component mounts.
  useEffect(() => {
    if (!customElements.get("model-viewer") && !document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = MODEL_VIEWER_SCRIPT;
      document.head.appendChild(script);
    }
  }, []);

  // Show the car only once the model has actually loaded.
  useEffect(() => {
    const car = carRef.current;
    if (!car) return;
    const onLoad = () => setLoaded(true);
    const onError = () => setLoaded(false);
    car.addEventListener("load", onLoad);
    car.addEventListener("error", onError);
    return () => {
      car.removeEventListener("load", onLoad);
      car.removeEventListener("error", onError);
    };
  }, []);

  // Move the car across the screen and turn it as the page scrolls.
  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      const car = carRef.current;
      if (!wrap || !car) return;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      // Drift left and right as you scroll, and move down the screen with the page.
      const freeWidth = Math.max(window.innerWidth - CAR_WIDTH, 0);
      const freeHeight = Math.max(window.innerHeight - CAR_HEIGHT, 0);
      const x = freeWidth * (0.5 + 0.45 * Math.sin(p * Math.PI * 4));
      const y = freeHeight * p;
      wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // Turn the car one full rotation over the length of the page.
      car.setAttribute("camera-orbit", `${Math.round(p * 360)}deg 75deg 105%`);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
      style={{ width: CAR_WIDTH, height: CAR_HEIGHT, display: loaded ? undefined : "none" }}
    >
      <model-viewer
        ref={carRef}
        src={MODEL_SRC}
        alt="BMW M2 G87"
        camera-orbit="0deg 75deg 105%"
        disable-zoom
        disable-pan
        interaction-prompt="none"
        shadow-intensity="1"
        exposure="1"
        style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      />
      {loaded && (
        <p className="absolute bottom-0 left-0 text-[10px] text-muted-foreground/60">
          Model: Black Snow (BlackSnow02), CC BY 4.0, via Sketchfab
        </p>
      )}
    </div>
  );
}
