import { useRef, type CSSProperties, type ReactNode } from "react";
import { FRAMES, safeArea } from "../catalogs";
import { slotsChart, slotsTable } from "../fixtures";
import { BOARD_H, BOARD_W, formatIndex, parseCloseup } from "../lib";
import { cardBorder, cardFill, muteColor, slideIsDark, typeColor } from "../theme";
import type { FilmFrame, Slide, StudioState } from "../types";
import { AreaChart, Board } from "./Board";
import { Editable } from "./Editable";
import { Plane } from "./Plane";

interface SlideViewProps {
  state: StudioState;
  frame: FilmFrame;
  total: number;
  hideChrome?: boolean;
  editable?: boolean;
  onEdit?: (partial: Partial<Slide>) => void;
  onHandle?: (value: string) => void;
  onShot?: (file: File) => void;
}

export function SlideView({
  state,
  frame,
  total,
  hideChrome,
  editable,
  onEdit,
  onHandle,
  onShot,
}: SlideViewProps) {
  const spec = FRAMES[state.frame];
  const dark = slideIsDark(state);
  const ink = typeColor(state, dark);
  const mute = muteColor(dark);
  const isPan = frame.slide.k === "pan" && frame.panCount >= 2;
  const contentW = isPan ? spec.w * frame.panCount : spec.w;
  const viewW = hideChrome && isPan ? contentW : spec.w;
  const height = spec.h;
  const shift = isPan && !hideChrome ? -(frame.panIndex ?? 0) * spec.w : 0;
  const planeWidth = state.flow ? spec.w * Math.max(total, 1) : contentW;
  const planeOffset = state.flow
    ? spec.w * (hideChrome && isPan ? frame.frameIndex - (frame.panIndex ?? 0) : frame.frameIndex)
    : 0;
  const safe = safeArea(state.frame);
  const canEdit = Boolean(editable && onEdit && !hideChrome);

  return (
    <div
      className={`slide tone-${dark ? "dark" : "light"} style-${state.style}`}
      style={
        {
          width: viewW,
          height,
          "--ink": ink,
          "--mute": mute,
          "--accent": state.chart,
          color: ink,
        } as CSSProperties
      }
    >
      <div
        className="slide-shift"
        style={{
          width: contentW,
          height,
          transform: shift ? `translateX(${shift}px)` : undefined,
        }}
      >
        <Plane
          id={state.plane}
          blur={state.blur}
          width={contentW}
          height={height}
          offsetX={planeOffset}
          planeWidth={planeWidth}
        />
        {state.ink === "scrim" ? (
          <div
            className="ink-scrim"
            style={{
              height: `${state.scrimh}%`,
              background: `linear-gradient(180deg, transparent 0%, rgba(${
                dark ? "6,6,8" : "20,16,12"
              }, ${state.scrim / 100}) 100%)`,
            }}
          />
        ) : null}
        {isPan
          ? Array.from({ length: frame.panCount - 1 }, (_, i) => (
              <div
                key={i}
                className="pan-cut"
                data-export-hide
                style={{ left: spec.w * (i + 1) }}
              />
            ))
          : null}
        <div
          className="slide-pad"
          style={{
            padding: state.pad,
            textShadow:
              state.ink === "shadow"
                ? `0 ${Math.max(1, state.shadowb / 8)}px ${state.shadowb}px rgba(0,0,0,${state.shadow / 100})`
                : undefined,
          }}
        >
          <SlideBody
            state={state}
            frame={frame}
            dark={dark}
            editable={canEdit}
            onEdit={onEdit}
            onShot={onShot}
          />
        </div>
      </div>
      {state.safe && !hideChrome ? (
        <div
          className="safe-rect"
          data-export-hide
          style={{
            top: `${safe.top * 100}%`,
            bottom: `${safe.bottom * 100}%`,
            left: `${safe.side * 100}%`,
            right: `${safe.side * 100}%`,
          }}
        />
      ) : null}
      {!hideChrome ? (
        <div className="slide-chrome">
          {state.nums ? <span className="slide-num">{formatIndex(frame.frameIndex, total)}</span> : null}
          {state.payload.h || canEdit ? (
            <div className="slide-handle">
              <Editable
                className="handle"
                value={state.payload.h ?? ""}
                enabled={canEdit && Boolean(onHandle)}
                placeholder="@handle"
                onChange={(value) => onHandle?.(value)}
              />
            </div>
          ) : null}
          <div className="slide-nav">
            {state.dots ? (
              <div className="slide-dots">
                {Array.from({ length: total }, (_, i) => (
                  <i key={i} className={i === frame.frameIndex ? "on" : ""} />
                ))}
              </div>
            ) : null}
            {state.arrow && frame.frameIndex < total - 1 ? <span className="slide-arrow">›</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SlideBody({
  state,
  frame,
  dark,
  editable,
  onEdit,
  onShot,
}: {
  state: StudioState;
  frame: FilmFrame;
  dark: boolean;
  editable?: boolean;
  onEdit?: (partial: Partial<Slide>) => void;
  onShot?: (file: File) => void;
}) {
  const slide = frame.slide;
  switch (slide.k) {
    case "cover":
    case "point":
    case "cta":
    case "stat":
      return (
        <div className={`layout ${slide.k}`}>
          <CopyBlock slide={slide} editable={editable} onEdit={onEdit} />
        </div>
      );
    case "pan":
      return (
        <div className="layout pan">
          <BoardWindow state={state} dark={dark} mode="letterbox" onShot={onShot} />
        </div>
      );
    case "overview":
    case "closeup":
      return (
        <div className={`layout ${slide.k}`}>
          <BoardWindow
            state={state}
            dark={dark}
            mode={slide.k === "closeup" ? "closeup" : "letterbox"}
            fill={slide.f}
            onShot={onShot}
          />
          <CopyBlock slide={slide} editable={editable} onEdit={onEdit} compact />
        </div>
      );
    case "chart": {
      const chart = slotsChart(state.slots);
      return (
        <div className="layout chart">
          <CopyBlock slide={slide} editable={editable} onEdit={onEdit} compact />
          <div className="hero-widget" style={widgetStyle(state, dark)}>
            <AreaChart series={chart} accent={state.chart} dark={dark} />
          </div>
        </div>
      );
    }
    case "table": {
      const table = slotsTable(state.slots);
      return (
        <div className="layout table">
          <CopyBlock slide={slide} editable={editable} onEdit={onEdit} compact />
          <div className="hero-widget" style={widgetStyle(state, dark)}>
            <table className={`board-table ${table.id}`}>
              <thead>
                <tr>
                  <th>Desk</th>
                  <th>Vol</th>
                  <th>Hit</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.volume}</td>
                    <td>{row.rate}%</td>
                    <td>{row.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    default: {
      const _never: never = slide.k;
      return _never;
    }
  }
}

function CopyBlock({
  slide,
  editable,
  onEdit,
  compact,
}: {
  slide: Slide;
  editable?: boolean;
  onEdit?: (partial: Partial<Slide>) => void;
  compact?: boolean;
}) {
  const enabled = Boolean(editable && onEdit);
  return (
    <article className={`copy-overlay ${compact ? "compact" : ""}`}>
      <Editable
        className="kicker"
        value={slide.c ?? ""}
        enabled={enabled}
        placeholder="Kicker"
        onChange={(c) => onEdit?.({ c })}
      />
      <Editable
        className="headline"
        value={slide.t ?? ""}
        enabled={enabled}
        placeholder="Headline"
        multiline
        onChange={(t) => onEdit?.({ t })}
      />
      <Editable
        className="body"
        value={slide.b ?? ""}
        enabled={enabled}
        placeholder="Body"
        multiline
        maxLength={240}
        onChange={(b) => onEdit?.({ b })}
      />
    </article>
  );
}

function widgetStyle(state: StudioState, dark: boolean): CSSProperties {
  return {
    background: cardFill(state.style, dark),
    border: `1px solid ${cardBorder(state.style, dark)}`,
    borderRadius: state.radius,
    padding: state.cpad,
  };
}

function ShotDrop({ onFile }: { onFile: (file: File | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="shot-drop"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="shot-drop-btn"
        onClick={(event) => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        <strong>Upload a dashboard screenshot</strong>
        <span>1600 × 1200 · 4:3 aspect ratio</span>
      </button>
    </div>
  );
}

function BoardWindow({
  state,
  dark,
  mode,
  fill,
  onShot,
}: {
  state: StudioState;
  dark: boolean;
  mode: "letterbox" | "closeup";
  fill?: string;
  onShot?: (file: File) => void;
}) {
  const spec = FRAMES[state.frame];
  const targetH = spec.h * state.fill;
  const targetW = targetH * (BOARD_W / BOARD_H);
  const radius = state.radius;
  const crop = mode === "closeup" ? parseCloseup(fill) : null;
  const showBoard = Boolean(state.shot || state.shotName === "slots");

  const takeFile = (file: File | undefined) => {
    if (file) onShot?.(file);
  };

  let inner: ReactNode;
  if (!showBoard) {
    inner = <ShotDrop onFile={takeFile} />;
  } else if (crop) {
    inner = (
      <div className="board-crop" style={{ width: targetW, height: targetH, borderRadius: radius }}>
        <div
          className="board-scale"
          style={{
            width: BOARD_W,
            height: BOARD_H,
            transform: `scale(${(targetW / BOARD_W) * crop.zoom})`,
            transformOrigin: `${crop.x * 100}% ${crop.y * 100}%`,
          }}
        >
          <Board state={state} dark={dark} />
        </div>
      </div>
    );
  } else {
    inner = (
      <div className="board-crop" style={{ width: targetW, height: targetH, borderRadius: radius }}>
        <div
          className="board-scale"
          style={{
            width: BOARD_W,
            height: BOARD_H,
            transform: `scale(${targetW / BOARD_W})`,
            transformOrigin: "top left",
          }}
        >
          <Board state={state} dark={dark} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`board-window panel-${state.panel}`}
      style={{
        width: targetW,
        height: targetH,
        borderRadius: radius,
        margin: state.inset,
      }}
    >
      {inner}
    </div>
  );
}
