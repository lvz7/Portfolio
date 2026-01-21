import type { CSSProperties, MouseEvent, PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";

type GlowFieldProps = PropsWithChildren<{
  className?: string;
  sheen?: boolean;
}>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function GlowField({ children, className, sheen }: GlowFieldProps) {
  const [pos, setPos] = useState({ x: 30, y: 20 });

  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  }, []);

  const style = useMemo(
    () =>
      ({
        // CSS vars consumed by --gradient-hero in the design system
        "--mx": `${pos.x}%`,
        "--my": `${pos.y}%`,
      }) as CSSProperties,
    [pos.x, pos.y],
  );

  return (
    <section
      id="top"
      className={className}
      onMouseMove={onMove}
      style={style}
      data-sheen={sheen ? "on" : "off"}
    >
      {children}
    </section>
  );
}
