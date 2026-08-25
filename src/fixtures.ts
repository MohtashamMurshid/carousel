import type { ChartSeries, KpiDatum, Slide, TableRow } from "./types";

export const DEFAULT_HANDLE = "@studio";

export const DEFAULT_SLOTS = [
  "kpi-leads",
  "kpi-conversion-rate",
  "kpi-deals-won",
  "revenue-over-time",
  "table-rows",
] as const;

export const RECIPE_SLIDES: Slide[] = [
  {
    k: "cover",
    c: "Field notes",
    t: "A board you can swipe.",
    b: "Two cuts across the surface — then the full desk in one frame.",
  },
  { k: "pan" },
  {
    k: "overview",
    c: "The whole desk",
    t: "One pass, left to right",
    b: "Rail, hero plot, rows. Nothing parked below the fold.",
  },
  {
    k: "closeup",
    f: "tl",
    c: "North-west",
    t: "Where the eye lands first",
  },
  {
    k: "cta",
    t: "Steal the layout, keep your numbers",
    b: "Build the next board with less chrome and more signal.",
  },
];

export const POINT_DEFAULT: Slide = {
  k: "point",
  c: "Note",
  t: "If it needs a second screen, it is not a board.",
  b: "Cut the footer. Keep the plot. Let the rail carry the pulse.",
};

export const STAT_DEFAULT: Slide = {
  k: "stat",
  c: "Pulse",
  t: "Leads are the loudest tile",
};

export const CHART_DEFAULT: Slide = {
  k: "chart",
  c: "Plot",
  t: "Twelve weeks of booked revenue",
};

export const TABLE_DEFAULT: Slide = {
  k: "table",
  c: "Rows",
  t: "Who is still in the pipe",
};

export const KPI_FIXTURES: Record<string, KpiDatum> = {
  "kpi-leads": {
    id: "kpi-leads",
    label: "Leads",
    value: "2,416",
    delta: "+18%",
    up: true,
    progress: 0.72,
    spark: [18, 22, 19, 28, 26, 31, 29, 36, 34, 41],
  },
  "kpi-conversion-rate": {
    id: "kpi-conversion-rate",
    label: "Conversion",
    value: "6.2%",
    delta: "+0.8pt",
    up: true,
    progress: 0.62,
    spark: [4.1, 4.4, 4.0, 4.8, 5.1, 5.0, 5.6, 5.8, 6.0, 6.2],
  },
  "kpi-deals-won": {
    id: "kpi-deals-won",
    label: "Deals won",
    value: "51",
    delta: "+9",
    up: true,
    progress: 0.81,
    spark: [22, 24, 21, 29, 31, 28, 36, 40, 44, 51],
  },
  "kpi-cycle": {
    id: "kpi-cycle",
    label: "Cycle",
    value: "19d",
    delta: "−3d",
    up: true,
    progress: 0.58,
    spark: [28, 26, 27, 24, 23, 22, 21, 20, 19, 19],
  },
  "kpi-pipeline": {
    id: "kpi-pipeline",
    label: "Pipeline",
    value: "$1.8M",
    delta: "+11%",
    up: true,
    progress: 0.66,
    spark: [1.1, 1.2, 1.15, 1.3, 1.4, 1.35, 1.5, 1.6, 1.7, 1.8],
  },
};

export const CHART_FIXTURES: Record<string, ChartSeries> = {
  "revenue-over-time": {
    id: "revenue-over-time",
    label: "Booked revenue",
    unit: "k",
    values: [42, 55, 48, 71, 63, 88, 79, 94, 86, 110, 102, 124],
  },
  "leads-over-time": {
    id: "leads-over-time",
    label: "Inbound leads",
    unit: "",
    values: [120, 132, 128, 149, 161, 155, 178, 190, 186, 204, 198, 221],
  },
};

export const TABLE_FIXTURES: Record<string, TableRow[]> = {
  "table-rows": [
    { name: "Northbound", volume: "184", rate: 72, state: "Open" },
    { name: "Keel", volume: "96", rate: 54, state: "Held" },
    { name: "Drift", volume: "61", rate: 41, state: "Risk" },
    { name: "Harbor", volume: "143", rate: 81, state: "Open" },
    { name: "Quill", volume: "38", rate: 29, state: "Lost" },
  ],
  "table-roomy": [
    { name: "Atlas desk", volume: "72", rate: 64, state: "Open" },
    { name: "Marlow", volume: "41", rate: 48, state: "Held" },
    { name: "Vesper", volume: "55", rate: 77, state: "Open" },
  ],
  "table-dense": [
    { name: "A1 inbound", volume: "312", rate: 44, state: "Open" },
    { name: "A2 partner", volume: "88", rate: 61, state: "Open" },
    { name: "B1 renewals", volume: "140", rate: 83, state: "Held" },
    { name: "B2 expansion", volume: "67", rate: 39, state: "Risk" },
    { name: "C1 events", volume: "24", rate: 22, state: "Lost" },
    { name: "C2 outbound", volume: "91", rate: 51, state: "Open" },
  ],
  "table-meters": [
    { name: "West rail", volume: "210", rate: 86, state: "Open" },
    { name: "East dock", volume: "154", rate: 63, state: "Held" },
    { name: "South yard", volume: "99", rate: 47, state: "Risk" },
  ],
  "table-matrix": [
    { name: "Q1", volume: "38", rate: 52, state: "—" },
    { name: "Q2", volume: "51", rate: 61, state: "—" },
    { name: "Q3", volume: "47", rate: 58, state: "—" },
    { name: "Q4", volume: "64", rate: 74, state: "—" },
  ],
  "table-bare": [
    { name: "Intro", volume: "12", rate: 90, state: "Open" },
    { name: "Scope", volume: "9", rate: 70, state: "Held" },
    { name: "Close", volume: "4", rate: 40, state: "Risk" },
  ],
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function slotsKpis(slots: string[], count: number): KpiDatum[] {
  const fromSlots = slots
    .map((id) => KPI_FIXTURES[id])
    .filter((row): row is KpiDatum => Boolean(row));
  const extras = Object.values(KPI_FIXTURES);
  const pool = fromSlots.length > 0 ? fromSlots : extras;
  const out: KpiDatum[] = [];
  for (let i = 0; i < Math.max(1, count); i += 1) {
    out.push(pool[i % pool.length] ?? extras[0]!);
  }
  return out;
}

export function slotsChart(slots: string[]): ChartSeries {
  const found = slots.map((id) => CHART_FIXTURES[id]).find((row) => row);
  return found ?? CHART_FIXTURES["revenue-over-time"]!;
}

export function slotsTable(slots: string[]): { id: string; rows: TableRow[] } {
  const found = slots.find((id) => TABLE_FIXTURES[id]);
  const id = found ?? "table-rows";
  return { id, rows: TABLE_FIXTURES[id] ?? TABLE_FIXTURES["table-rows"]! };
}
