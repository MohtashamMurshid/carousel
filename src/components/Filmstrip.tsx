import { FRAMES } from "../catalogs";
import type { FilmFrame, Slide, StudioState } from "../types";
import { SlideView } from "./SlideView";

interface FilmstripProps {
  state: StudioState;
  frames: FilmFrame[];
  selected: number;
  onSelect: (index: number) => void;
  onEdit: (slideIndex: number, partial: Partial<Slide>) => void;
  onHandle: (value: string) => void;
  onShot: (file: File) => void;
  scale: number;
}

export function Filmstrip({
  state,
  frames,
  selected,
  onSelect,
  onEdit,
  onHandle,
  onShot,
  scale,
}: FilmstripProps) {
  const spec = FRAMES[state.frame];
  const gap = Math.max(8, state.gap * scale);

  return (
    <div className="filmstrip" style={{ gap }}>
      {frames.map((frame) => {
        const clipW = spec.w;
        const clipH = spec.h;
        return (
          <div
            key={`${frame.slideIndex}-${frame.frameIndex}`}
            className={`frame-btn ${selected === frame.frameIndex ? "is-on" : ""}`}
            style={{ width: clipW * scale, height: clipH * scale }}
            onClick={() => onSelect(frame.frameIndex)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(frame.frameIndex);
              }
            }}
            aria-label={`Slide ${frame.frameIndex + 1}`}
          >
            <div
              className="frame-scale"
              style={{
                width: clipW,
                height: clipH,
                transform: `scale(${scale})`,
              }}
            >
              <SlideView
                state={state}
                frame={frame}
                total={frames.length}
                editable={selected === frame.frameIndex}
                onEdit={(partial) => onEdit(frame.slideIndex, partial)}
                onHandle={onHandle}
                onShot={onShot}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
