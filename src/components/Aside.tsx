import type { ReactNode } from "react";
import { CHART_SWATCHES, FRAMES, NAMED_PLANES, PLANE_GROUPS } from "../catalogs";
import { frameCount, KIND_LABEL, MAX_FRAMES, slideCost, slideFrameSpan } from "../lib";
import type { StudioApi } from "../studio";
import { ADDABLE_KINDS, EXTRA_KINDS, FRAME_IDS, KPI_DESIGNS, PANELS } from "../types";

type Tab = "deck" | "style" | "export";

interface AsideProps {
  api: StudioApi;
  tab: Tab;
  onTab: (tab: Tab) => void;
}

export function Aside({ api, tab, onTab }: AsideProps) {
  const { state, frames, selected } = api;
  const current = frames[selected];
  const used = frameCount(state.payload);

  return (
    <aside className="aside">
      <nav className="tabs">
        {(["deck", "style", "export"] as const).map((id) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => onTab(id)}>
            {id}
          </button>
        ))}
      </nav>

      {tab === "deck" ? (
        <div className="pane">
          <Field label="Recipe">
            <select value={state.recipe} onChange={() => api.patch({ recipe: "wide-pan" })}>
              <option value="wide-pan">Wide pan + reveal</option>
            </select>
          </Field>

          <Field label="Screenshot">
            <label className="upload">
              <UploadIcon />
              Upload screenshot
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  api.setShot(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="hint">
              1600 × 1200 · 4:3 aspect ratio. What the pan scrolls across and the overview pulls back
              from — a screenshot of your product.
            </p>
            <div className="row">
              <button type="button" className="ghost" onClick={() => api.setShot(null)}>
                Clear
              </button>
              <button type="button" className="ghost" onClick={api.useFixtureShot}>
                Fixture
              </button>
              <button type="button" className="ghost" onClick={api.useSlotBoard}>
                Slot board
              </button>
            </div>
          </Field>

          <Field label="Pan run">
            <div className="seg">
              {([0, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={state.payload.p === n ? "on" : ""}
                  onClick={() => api.setPan(n)}
                >
                  {n === 0 ? "Off" : n}
                </button>
              ))}
            </div>
            <p className="hint">
              Slices cut from one wide shot of the product. {state.payload.p || 2} holds the board at
              its own 4:3 on this frame.
            </p>
          </Field>

          <Field label={`Slides · ${used} of ${MAX_FRAMES}`}>
            <ol className="slide-list">
              {state.payload.s.map((slide, i) => {
                const span = slideFrameSpan(state.payload, i);
                const label =
                  span.start === span.end ? `${span.start} ${KIND_LABEL[slide.k]}` : `${span.start}–${span.end} ${KIND_LABEL[slide.k]}`;
                return (
                  <li key={`${slide.k}-${i}`} className={current?.slideIndex === i ? "on" : ""}>
                    <button
                      type="button"
                      className="pick"
                      onClick={() => {
                        const hit = frames.find((frame) => frame.slideIndex === i);
                        if (hit) api.setSelected(hit.frameIndex);
                      }}
                    >
                      <b>{label}</b>
                      <span>{slide.t ?? slide.c ?? ""}</span>
                    </button>
                    <span className="ops">
                      <button type="button" onClick={() => api.moveSlide(i, -1)} aria-label="Move up">
                        ↑
                      </button>
                      <button type="button" onClick={() => api.moveSlide(i, 1)} aria-label="Move down">
                        ↓
                      </button>
                      <button type="button" onClick={() => api.removeSlide(i)} aria-label="Remove">
                        <TrashIcon />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="hint">Order is the argument. Drag is not needed — the arrows move a slide one step.</p>
          </Field>

          <Field label="Add a slide">
            <div className="add-row">
              {ADDABLE_KINDS.map((kind) => {
                const disabled = used + slideCost(kind, state.payload.p) > MAX_FRAMES;
                return (
                  <button key={kind} type="button" disabled={disabled} onClick={() => api.addSlide(kind)}>
                    + {KIND_LABEL[kind]}
                  </button>
                );
              })}
            </div>
            <div className="add-row quiet">
              {EXTRA_KINDS.map((kind) => {
                const disabled = used + slideCost(kind, state.payload.p) > MAX_FRAMES;
                return (
                  <button key={kind} type="button" disabled={disabled} onClick={() => api.addSlide(kind)}>
                    + {KIND_LABEL[kind]}
                  </button>
                );
              })}
            </div>
            <p className="hint">Lands after the one selected.</p>
          </Field>

          {current?.slide.k === "closeup" ? (
            <Field label="Close-up fill">
              <div className="seg wrap">
                {(["tl", "tr", "center", "bl", "br"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={(current.slide.f ?? "tl") === id ? "on" : ""}
                    onClick={() => api.updateSlide(current.slideIndex, { f: id })}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </Field>
          ) : null}

          <label className="check">
            <input
              type="checkbox"
              checked={state.safe}
              onChange={(e) => api.patch({ safe: e.target.checked })}
            />
            Safe-area guides
          </label>
        </div>
      ) : null}

      {tab === "style" ? (
        <div className="pane">
          <button type="button" className="wide" onClick={api.randomize}>
            Randomize style
          </button>

          <Field label="Plane">
            <select value={state.plane} onChange={(e) => api.patch({ plane: e.target.value })}>
              {PLANE_GROUPS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {NAMED_PLANES.filter((plane) => plane.group === group.id).map((plane) => (
                    <option key={plane.id} value={plane.id}>
                      {plane.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <label className="check">
            <input
              type="checkbox"
              checked={state.flow}
              onChange={(e) => api.patch({ flow: e.target.checked })}
            />
            Plane flow
          </label>

          <Slider label="Blur" min={0} max={40} step={1} value={state.blur} onChange={(v) => api.patch({ blur: v })} />
          <Slider
            label="Board fill"
            min={0.55}
            max={1}
            step={0.05}
            value={state.fill}
            onChange={(v) => api.patch({ fill: v })}
          />

          <Field label="Card style">
            <div className="seg">
              {(["solid", "liquid", "glass"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={state.style === id ? "on" : ""}
                  onClick={() => api.patch({ style: id })}
                >
                  {id}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Panel">
            <select
              value={state.panel}
              onChange={(e) => api.patch({ panel: e.target.value as (typeof PANELS)[number] })}
            >
              {PANELS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="KPI">
            <select
              value={state.kpi}
              onChange={(e) => api.patch({ kpi: e.target.value as (typeof KPI_DESIGNS)[number] })}
            >
              {KPI_DESIGNS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mode">
            <div className="seg">
              {(["auto", "light", "dark"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={state.mode === id ? "on" : ""}
                  onClick={() => api.patch({ mode: id })}
                >
                  {id}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Chart colour">
            <div className="swatches">
              {CHART_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  className={state.chart === swatch.hex ? "on" : ""}
                  style={{ background: swatch.hex }}
                  title={swatch.label}
                  aria-label={swatch.label}
                  onClick={() => api.patch({ chart: swatch.hex })}
                />
              ))}
              <label className="swatch-custom" title="Custom">
                <input type="color" value={state.chart} onChange={(e) => api.patch({ chart: e.target.value })} />
              </label>
            </div>
          </Field>

          <Field label="Text color">
            <div className="row">
              <input
                type="color"
                value={state.text || (state.mode === "light" ? "#161513" : "#f6f4ef")}
                onChange={(e) => api.patch({ text: e.target.value })}
              />
              <button type="button" className="ghost" onClick={() => api.patch({ text: "" })}>
                Auto
              </button>
            </div>
          </Field>

          <Field label="Ink">
            <div className="seg">
              {(["scrim", "shadow", "none"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={state.ink === id ? "on" : ""}
                  onClick={() => api.patch({ ink: id })}
                >
                  {id}
                </button>
              ))}
            </div>
          </Field>
          {state.ink === "scrim" ? (
            <>
              <Slider label="Scrim" min={0} max={100} step={1} value={state.scrim} onChange={(v) => api.patch({ scrim: v })} />
              <Slider
                label="Scrim height"
                min={0}
                max={100}
                step={1}
                value={state.scrimh}
                onChange={(v) => api.patch({ scrimh: v })}
              />
            </>
          ) : null}
          {state.ink === "shadow" ? (
            <>
              <Slider
                label="Shadow"
                min={0}
                max={100}
                step={1}
                value={state.shadow}
                onChange={(v) => api.patch({ shadow: v })}
              />
              <Slider
                label="Shadow blur"
                min={0}
                max={80}
                step={1}
                value={state.shadowb}
                onChange={(v) => api.patch({ shadowb: v })}
              />
            </>
          ) : null}

          <Field label="Slots">
            <input
              value={state.slots.join(",")}
              onChange={(e) =>
                api.patch({
                  slots: e.target.value
                    .split(",")
                    .map((part) => part.trim())
                    .filter(Boolean),
                })
              }
            />
            <label className="inline">
              KPI count
              <input
                type="number"
                min={1}
                max={6}
                value={state.kpis}
                onChange={(e) => api.patch({ kpis: Number(e.target.value) })}
              />
            </label>
          </Field>
        </div>
      ) : null}

      {tab === "export" ? (
        <div className="pane">
          <Field label="Frame">
            <select
              value={state.frame}
              onChange={(e) => api.patch({ frame: e.target.value as (typeof FRAME_IDS)[number] })}
            >
              {FRAME_IDS.map((id) => (
                <option key={id} value={id}>
                  {FRAMES[id].label} · {FRAMES[id].w}×{FRAMES[id].h}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Resolution">
            <div className="seg">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={state.res === n ? "on" : ""}
                  onClick={() => api.patch({ res: n })}
                >
                  {n}×
                </button>
              ))}
            </div>
          </Field>
          <label className="check">
            <input type="checkbox" checked={state.nums} onChange={(e) => api.patch({ nums: e.target.checked })} />
            Numbers
          </label>
          <label className="check">
            <input type="checkbox" checked={state.dots} onChange={(e) => api.patch({ dots: e.target.checked })} />
            Dots
          </label>
          <label className="check">
            <input type="checkbox" checked={state.arrow} onChange={(e) => api.patch({ arrow: e.target.checked })} />
            Arrow
          </label>
          <Slider label="Padding" min={0} max={160} step={4} value={state.pad} onChange={(v) => api.patch({ pad: v })} />
          <Slider label="Gap" min={0} max={48} step={4} value={state.gap} onChange={(v) => api.patch({ gap: v })} />
          <Slider label="Inset" min={0} max={64} step={4} value={state.inset} onChange={(v) => api.patch({ inset: v })} />
          <Slider
            label="Overview radius"
            min={0}
            max={80}
            step={1}
            value={state.radius}
            onChange={(v) => api.patch({ radius: v })}
          />
          <p className="hint">
            Files download locally as 01-carousel-{state.recipe}-{state.frame}
            {state.res === 1 ? "" : `@${state.res}x`}.png. Pan is one wide raster, then sliced.
          </p>
        </div>
      ) : null}
    </aside>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <span>{label}</span>
      {children}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field slider">
      <span>
        {label}
        <em>{value}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 16V5M7 9l5-5 5 5M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7h14M10 7V5h4v2M8 7l.8 12h6.4L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
