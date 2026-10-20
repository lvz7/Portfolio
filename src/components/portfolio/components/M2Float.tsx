import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// The car lives on the right edge of the screen. It moves up and down with the page and turns as you scroll.
const MODEL_SRC = "/models/bmw-m2-g87.glb";
const MODEL_VIEWER_SCRIPT = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.4.0/dist/model-viewer.min.js";
const CAR_WIDTH = 480;
const CAR_HEIGHT = 300;
const RIGHT_MARGIN = 24;
const TOP_OFFSET = 96; // Keeps the car below the sticky header.
const BOTTOM_OFFSET = 24;

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

  // Fade the car in only once the model has actually loaded.
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

  // Move the car down the right side as the page scrolls, and turn it one full rotation over the page.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      const car = carRef.current;
      if (!wrap || !car) return;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      const x = Math.max(window.innerWidth - CAR_WIDTH - RIGHT_MARGIN, 0);
      const freeHeight = Math.max(window.innerHeight - CAR_HEIGHT - TOP_OFFSET - BOTTOM_OFFSET, 0);
      const y = TOP_OFFSET + freeHeight * p;
      wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      car.setAttribute("camera-orbit", `${Math.round(p * 360)}deg 75deg 110%`);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    // With reduced motion on, the car stays at its starting position and does not follow scroll.
    if (reduceMotion) {
      return () => {
        if (frame) cancelAnimationFrame(frame);
      };
    }
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
      className="pointer-events-none fixed left-0 top-0 z-30 hidden lg:block"
      style={{
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        // Keep the viewer in the layout so it can load, and fade it in once the model is ready.
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <model-viewer
        ref={carRef}
        src={MODEL_SRC}
        alt="BMW M2 G87 in Voodoo Blue"
        camera-orbit="0deg 75deg 110%"
        environment-image="neutral"
        tone-mapping="neutral"
        exposure="1.1"
        shadow-intensity="0.6"
        disable-zoom
        disable-pan
        interaction-prompt="none"
        style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
      />
    </div>
  );
}
