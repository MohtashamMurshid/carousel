import { isFrameId } from "./catalogs";
import { DEFAULT_QUERY, DEFAULT_STATE } from "./defaults";
import { CHART_DEFAULT, POINT_DEFAULT, STAT_DEFAULT, TABLE_DEFAULT } from "./fixtures";
import {
  decodeDeck,
  encodeDeck,
  parseBool,
  parseNum,
  snap,
} from "./lib";
import { buildRecipe } from "./recipes";
import {
  CARD_STYLES,
  INKS,
  KPI_DESIGNS,
  MODES,
  PANELS,
  RECIPES,
  type RecipeId,
  type Slide,
  type StudioState,
} from "./types";

function inList<T extends string>(value: string, list: readonly T[], fallback: T): T {
  return (list as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function parseSearch(search: string): StudioState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const recipe = inList(params.get("recipe") ?? DEFAULT_STATE.recipe, RECIPES, DEFAULT_STATE.recipe);
  const decoded = params.get("d");
  const payload = decoded ? decodeDeck(decoded) : null;

  const slotsRaw = params.get("slots");
  const slots = slotsRaw
    ? slotsRaw
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [...DEFAULT_STATE.slots];

  const shotName = params.get("shot");

  return {
    recipe,
    payload: payload ?? buildRecipe(recipe),
    slots: slots.length > 0 ? slots : [...DEFAULT_STATE.slots],
    kpis: snap(parseNum(params.get("kpis"), DEFAULT_STATE.kpis), 1, 1, 6),
    style: inList(params.get("style") ?? DEFAULT_STATE.style, CARD_STYLES, DEFAULT_STATE.style),
    kpi: inList(params.get("kpi") ?? DEFAULT_STATE.kpi, KPI_DESIGNS, DEFAULT_STATE.kpi),
    panel: inList(params.get("panel") ?? DEFAULT_STATE.panel, PANELS, DEFAULT_STATE.panel),
    inset: snap(parseNum(params.get("inset"), DEFAULT_STATE.inset), 4, 0, 64),
    plane: params.get("plane") || DEFAULT_STATE.plane,
    blur: snap(parseNum(params.get("blur"), DEFAULT_STATE.blur), 1, 0, 40),
    radius: snap(parseNum(params.get("radius"), DEFAULT_STATE.radius), 1, 0, 80),
    fill: snap(parseNum(params.get("fill"), DEFAULT_STATE.fill), 0.05, 0.55, 1),
    chart: normalizeHex(params.get("chart"), DEFAULT_STATE.chart),
    text: normalizeHex(params.get("text"), ""),
    ink: inList(params.get("ink") ?? DEFAULT_STATE.ink, INKS, DEFAULT_STATE.ink),
    scrim: snap(parseNum(params.get("scrim"), DEFAULT_STATE.scrim), 1, 0, 100),
    scrimh: snap(parseNum(params.get("scrimh"), DEFAULT_STATE.scrimh), 1, 0, 100),
    shadow: snap(parseNum(params.get("shadow"), DEFAULT_STATE.shadow), 1, 0, 100),
    shadowb: snap(parseNum(params.get("shadowb"), DEFAULT_STATE.shadowb), 1, 0, 80),
    cpad: snap(parseNum(params.get("cpad"), DEFAULT_STATE.cpad), 1, 8, 64),
    mode: inList(params.get("mode") ?? DEFAULT_STATE.mode, MODES, DEFAULT_STATE.mode),
    flow: parseBool(params.get("flow"), DEFAULT_STATE.flow),
    frame: isFrameId(params.get("frame") ?? "") ? (params.get("frame") as StudioState["frame"]) : DEFAULT_STATE.frame,
    res: parseRes(params.get("res")),
    pad: snap(parseNum(params.get("pad"), DEFAULT_STATE.pad), 4, 0, 160),
    gap: snap(parseNum(params.get("gap"), DEFAULT_STATE.gap), 4, 0, 48),
    nums: parseBool(params.get("nums"), DEFAULT_STATE.nums),
    dots: parseBool(params.get("dots"), DEFAULT_STATE.dots),
    arrow: parseBool(params.get("arrow"), DEFAULT_STATE.arrow),
    safe: parseBool(params.get("safe"), DEFAULT_STATE.safe),
    shot: shotName === "fixture" ? "/fixture.svg" : null,
    shotName: shotName === "fixture" ? "fixture" : null,
  };
}

export function serializeSearch(state: StudioState): string {
  const params = new URLSearchParams();
  params.set("d", encodeDeck(state.payload));
  writeKnob(params, "recipe", state.recipe, DEFAULT_QUERY.recipe);
  writeKnob(params, "style", state.style, DEFAULT_QUERY.style);
  writeKnob(params, "kpi", state.kpi, DEFAULT_QUERY.kpi);
  writeKnob(params, "panel", state.panel, DEFAULT_QUERY.panel);
  writeKnob(params, "inset", String(state.inset), DEFAULT_QUERY.inset);
  writeKnob(params, "kpis", String(state.kpis), DEFAULT_QUERY.kpis);
  writeKnob(params, "slots", state.slots.join(","), DEFAULT_QUERY.slots);
  if (state.shotName) params.set("shot", state.shotName);
  writeKnob(params, "plane", state.plane, DEFAULT_QUERY.plane);
  writeKnob(params, "blur", String(state.blur), DEFAULT_QUERY.blur);
  if (state.radius !== 26) params.set("radius", String(state.radius));
  writeKnob(params, "frame", state.frame, DEFAULT_QUERY.frame);
  writeKnob(params, "res", String(state.res), DEFAULT_QUERY.res);
  writeKnob(params, "pad", String(state.pad), DEFAULT_QUERY.pad);
  writeKnob(params, "gap", String(state.gap), DEFAULT_QUERY.gap);
  writeKnob(params, "fill", String(state.fill), DEFAULT_QUERY.fill);
  writeKnob(params, "chart", state.chart, DEFAULT_QUERY.chart);
  if (state.text) params.set("text", state.text);
  writeKnob(params, "ink", state.ink, DEFAULT_QUERY.ink);
  writeKnob(params, "scrim", String(state.scrim), DEFAULT_QUERY.scrim);
  writeKnob(params, "scrimh", String(state.scrimh), DEFAULT_QUERY.scrimh);
  writeKnob(params, "shadow", String(state.shadow), DEFAULT_QUERY.shadow);
  writeKnob(params, "shadowb", String(state.shadowb), DEFAULT_QUERY.shadowb);
  writeKnob(params, "cpad", String(state.cpad), DEFAULT_QUERY.cpad);
  writeKnob(params, "mode", state.mode, DEFAULT_QUERY.mode);
  writeKnob(params, "flow", String(state.flow), DEFAULT_QUERY.flow);
  writeKnob(params, "nums", String(state.nums), DEFAULT_QUERY.nums);
  writeKnob(params, "dots", String(state.dots), DEFAULT_QUERY.dots);
  writeKnob(params, "arrow", String(state.arrow), DEFAULT_QUERY.arrow);
  writeKnob(params, "safe", String(state.safe), DEFAULT_QUERY.safe);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function parseRes(raw: string | null): 1 | 2 | 3 {
  const n = parseNum(raw, DEFAULT_STATE.res);
  if (n === 1) return 1;
  if (n === 3) return 3;
  return 2;
}

function writeKnob(params: URLSearchParams, key: string, value: string, fallback: string): void {
  if (value !== fallback) params.set(key, value);
}

function normalizeHex(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  const value = decodeURIComponent(raw).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value.toLowerCase()}`;
  return fallback;
}

export function replaceSearch(state: StudioState): void {
  const next = serializeSearch(state);
  const url = `${window.location.pathname}${next}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}

export function defaultSlide(kind: Slide["k"]): Slide {
  switch (kind) {
    case "cover":
      return {
        k: "cover",
        c: "Field notes",
        t: "A board you can swipe.",
        b: "Two cuts across the surface — then the full desk in one frame.",
      };
    case "overview":
      return {
        k: "overview",
        c: "The whole desk",
        t: "One pass, left to right",
        b: "Rail, hero plot, rows. Nothing parked below the fold.",
      };
    case "closeup":
      return { k: "closeup", f: "tl", c: "North-west", t: "Where the eye lands first" };
    case "cta":
      return {
        k: "cta",
        t: "Steal the layout, keep your numbers",
        b: "Build the next board with less chrome and more signal.",
      };
    case "point":
      return { ...POINT_DEFAULT };
    case "stat":
      return { ...STAT_DEFAULT };
    case "chart":
      return { ...CHART_DEFAULT };
    case "table":
      return { ...TABLE_DEFAULT };
    case "pan":
      return { k: "pan" };
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function randomizeStyle(prev: StudioState): StudioState {
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;
  const planes = ["dusk", "midnight", "aurora", "ember", "pewter", "bronze", "steel", "ink", "img-23", "img-7"];
  const hexes = ["#475569", "#64748b", "#94a3b8", "#d6c7a1", "#9aa4b2", "#c4b5a0"];
  return {
    ...prev,
    style: pick(CARD_STYLES),
    kpi: pick(KPI_DESIGNS),
    panel: pick(PANELS),
    plane: pick(planes),
    blur: snap(Math.floor(Math.random() * 18), 1, 0, 40),
    fill: snap(0.65 + Math.random() * 0.3, 0.05, 0.55, 1),
    chart: pick(hexes),
    ink: pick(INKS),
    mode: pick(MODES),
    scrim: snap(48 + Math.floor(Math.random() * 30), 1, 0, 100),
    scrimh: snap(50 + Math.floor(Math.random() * 30), 1, 0, 100),
    shadow: snap(25 + Math.floor(Math.random() * 50), 1, 0, 100),
    shadowb: snap(8 + Math.floor(Math.random() * 28), 1, 0, 80),
  };
}

export type StylePatch = Partial<
  Pick<
    StudioState,
    | "style"
    | "kpi"
    | "panel"
    | "inset"
    | "plane"
    | "blur"
    | "radius"
    | "fill"
    | "chart"
    | "text"
    | "ink"
    | "scrim"
    | "scrimh"
    | "shadow"
    | "shadowb"
    | "cpad"
    | "mode"
    | "flow"
    | "frame"
    | "res"
    | "pad"
    | "gap"
    | "nums"
    | "dots"
    | "arrow"
    | "safe"
    | "kpis"
    | "slots"
    | "recipe"
  >
>;

export { type RecipeId };
