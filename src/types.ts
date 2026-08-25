export const SLIDE_KINDS = [
  "cover",
  "pan",
  "overview",
  "closeup",
  "stat",
  "chart",
  "table",
  "point",
  "cta",
] as const;

export type SlideKind = (typeof SLIDE_KINDS)[number];

export const ADDABLE_KINDS = [
  "cover",
  "point",
  "overview",
  "closeup",
  "cta",
] as const;

export const EXTRA_KINDS = ["stat", "chart", "table"] as const;

export type AddableKind = (typeof ADDABLE_KINDS)[number] | (typeof EXTRA_KINDS)[number];

export interface Slide {
  k: SlideKind;
  f?: string;
  c?: string;
  t?: string;
  b?: string;
}

export interface DeckPayload {
  p: number;
  h?: string;
  s: Slide[];
}

export const CARD_STYLES = ["solid", "liquid", "glass"] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

export const KPI_DESIGNS = [
  "compact",
  "stat",
  "minimal",
  "inline",
  "spark",
  "ring",
  "ring-inline",
  "rule",
  "track",
  "section",
] as const;
export type KpiDesign = (typeof KPI_DESIGNS)[number];

export const PANELS = ["panel", "flush", "sunken", "raised", "outline"] as const;
export type PanelStyle = (typeof PANELS)[number];

export const FRAME_IDS = [
  "ig-portrait",
  "ig-square",
  "ig-story",
  "li-carousel",
  "li-square",
  "li-landscape",
] as const;
export type FrameId = (typeof FRAME_IDS)[number];

export const INKS = ["scrim", "shadow", "none"] as const;
export type Ink = (typeof INKS)[number];

export const MODES = ["auto", "light", "dark"] as const;
export type Mode = (typeof MODES)[number];

export const RECIPES = ["wide-pan"] as const;
export type RecipeId = (typeof RECIPES)[number];

export interface StudioState {
  recipe: RecipeId;
  payload: DeckPayload;
  slots: string[];
  kpis: number;
  style: CardStyle;
  kpi: KpiDesign;
  panel: PanelStyle;
  inset: number;
  plane: string;
  blur: number;
  radius: number;
  fill: number;
  chart: string;
  text: string;
  ink: Ink;
  scrim: number;
  scrimh: number;
  shadow: number;
  shadowb: number;
  cpad: number;
  mode: Mode;
  flow: boolean;
  frame: FrameId;
  res: 1 | 2 | 3;
  pad: number;
  gap: number;
  nums: boolean;
  dots: boolean;
  arrow: boolean;
  safe: boolean;
  shot: string | null;
  shotName: string | null;
}

export interface FrameSpec {
  id: FrameId;
  w: number;
  h: number;
  family: "ig" | "li";
  label: string;
}

export interface SafeArea {
  top: number;
  bottom: number;
  side: number;
}

export interface PlaneDef {
  id: string;
  group: "liquid" | "mesh" | "flat" | "photo";
  label: string;
  dark: boolean;
}

export interface FilmFrame {
  slideIndex: number;
  slide: Slide;
  frameIndex: number;
  panIndex: number | null;
  panCount: number;
}

export interface KpiDatum {
  id: string;
  label: string;
  value: string;
  delta: string;
  up: boolean;
  progress: number;
  spark: number[];
}

export interface TableRow {
  name: string;
  volume: string;
  rate: number;
  state: string;
}

export interface ChartSeries {
  id: string;
  label: string;
  unit: string;
  values: number[];
}
