import type { CSSProperties } from "react";
import { planePaint } from "../catalogs";

interface PlaneProps {
  id: string;
  blur: number;
  width: number;
  height: number;
  offsetX?: number;
  planeWidth?: number;
}

export function Plane({ id, blur, width, height, offsetX = 0, planeWidth }: PlaneProps) {
  const paint = planePaint(id);
  const wide = planeWidth ?? width;
  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  };
  return (
    <div className="plane" style={style} aria-hidden>
      <div
        className="plane-shift"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: wide,
          height,
          transform: `translateX(${-offsetX}px)`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        <div className="plane-base" style={{ background: paint.base }} />
        {paint.overlay ? <div className="plane-wash" style={{ background: paint.overlay }} /> : null}
        <div className={`plane-grain ${id.startsWith("img-") ? "is-photo" : ""}`} />
        {id.startsWith("img-") ? <div className="plane-photo-veil" /> : null}
      </div>
    </div>
  );
}
