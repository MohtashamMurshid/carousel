import { SLIDE_KINDS, type DeckPayload, type FilmFrame, type Slide, type StudioState } from "./types";

export const BOARD_W = 1600;
export const BOARD_H = 1200;
export const MAX_FRAMES = 10;
export const BODY_MAX = 240;

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function snap(n: number, step: number, min: number, max: number): number {
  const snapped = Math.round(n / step) * step;
  const rounded = Number(snapped.toFixed(6));
  return clamp(rounded, min, max);
}

export function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback;
  const v = raw.toLowerCase();
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return fallback;
}

export function parseNum(raw: string | null, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function isSlideKind(value: string): value is Slide["k"] {
  return (SLIDE_KINDS as readonly string[]).includes(value);
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function frameCount(payload: DeckPayload): number {
  const pan = payload.p >= 2 ? payload.p : 0;
  return payload.s.reduce((sum, slide) => sum + (slide.k === "pan" ? Math.max(pan, 2) : 1), 0);
}

export function slideCost(kind: Slide["k"], pan: number): number {
  return kind === "pan" ? Math.max(pan, 2) : 1;
}

export function normalizePayload(input: DeckPayload): DeckPayload {
  let p = Math.round(input.p);
  if (p === 1) p = 0;
  if (p < 0) p = 0;
  if (p > 4) p = 4;

  const slides: Slide[] = [];
  let sawPan = false;
  for (const slide of input.s) {
    if (!isSlideKind(slide.k)) continue;
    if (slide.k === "pan") {
      if (sawPan) continue;
      sawPan = true;
    }
    slides.push(trimSlide(slide));
  }

  if (sawPan && p < 2) p = 2;
  if (!sawPan && p >= 2) {
    const insertAt = slides.length === 0 ? 0 : 1;
    slides.splice(insertAt, 0, { k: "pan" });
    sawPan = true;
  }

  if (slides.length === 0) {
    slides.push({ k: "cover" });
  }

  while (frameCount({ p, s: slides }) > MAX_FRAMES) {
    if (slides.length <= 1) {
      if (p > 2) {
        p -= 1;
        continue;
      }
      const withoutPan = slides.filter((slide) => slide.k !== "pan");
      if (withoutPan.length === 0) {
        return { p: 0, h: input.h?.trim() || undefined, s: [{ k: "cover" }] };
      }
      return { p: 0, h: input.h?.trim() || undefined, s: withoutPan };
    }
    slides.pop();
  }

  const handle = input.h?.trim();
  return {
    p: sawPan ? p : 0,
    h: handle ? handle.slice(0, 48) : undefined,
    s: slides,
  };
}

function trimSlide(slide: Slide): Slide {
  const next: Slide = { k: slide.k };
  if (slide.f) next.f = slide.f.slice(0, 48);
  if (slide.c) next.c = slide.c.slice(0, 80);
  if (slide.t) next.t = slide.t.slice(0, 160);
  if (slide.b) next.b = slide.b.slice(0, BODY_MAX);
  return next;
}

export function expandFrames(state: StudioState): FilmFrame[] {
  const frames: FilmFrame[] = [];
  const pan = state.payload.p >= 2 ? state.payload.p : 0;
  let frameIndex = 0;
  state.payload.s.forEach((slide, slideIndex) => {
    if (slide.k === "pan" && pan >= 2) {
      for (let i = 0; i < pan; i += 1) {
        frames.push({
          slideIndex,
          slide,
          frameIndex,
          panIndex: i,
          panCount: pan,
        });
        frameIndex += 1;
      }
      return;
    }
    if (slide.k === "pan") return;
    frames.push({
      slideIndex,
      slide,
      frameIndex,
      panIndex: null,
      panCount: 0,
    });
    frameIndex += 1;
  });
  return frames;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(raw: string): Uint8Array {
  const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const bin = atob(padded + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export function encodeDeck(payload: DeckPayload): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodeDeck(raw: string): DeckPayload | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(raw));
    const data: unknown = JSON.parse(json);
    if (!data || typeof data !== "object") return null;
    const rec = data as Record<string, unknown>;
    const p = typeof rec.p === "number" ? rec.p : 0;
    const h = typeof rec.h === "string" ? rec.h : undefined;
    const s = Array.isArray(rec.s) ? rec.s : [];
    const slides: Slide[] = [];
    for (const item of s) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      if (typeof row.k !== "string") continue;
      const slide: Slide = { k: row.k as Slide["k"] };
      if (typeof row.f === "string") slide.f = row.f;
      if (typeof row.c === "string") slide.c = row.c;
      if (typeof row.t === "string") slide.t = row.t;
      if (typeof row.b === "string") slide.b = row.b;
      slides.push(slide);
    }
    return normalizePayload({ p, h, s: slides });
  } catch {
    return null;
  }
}

export function parseCloseup(fill: string | undefined): {
  zoom: number;
  x: number;
  y: number;
  named: "tl" | "tr" | "bl" | "br" | "center" | null;
} {
  const raw = (fill ?? "tl").trim().toLowerCase();
  if (raw === "tl") return { zoom: 2, x: 0, y: 0, named: "tl" };
  if (raw === "tr") return { zoom: 2, x: 1, y: 0, named: "tr" };
  if (raw === "bl") return { zoom: 2, x: 0, y: 1, named: "bl" };
  if (raw === "br") return { zoom: 2, x: 1, y: 1, named: "br" };
  if (raw === "center" || raw === "c") return { zoom: 2, x: 0.5, y: 0.5, named: "center" };

  const parts = raw.split(",").map((part) => part.trim());
  const start = parts[0] === "zoom" ? 1 : 0;
  const nums = parts.slice(start).map((part) => Number(part));
  if (nums.length >= 3 && nums.every((n) => Number.isFinite(n))) {
    return {
      zoom: clamp(nums[0] ?? 2, 1.2, 3.2),
      x: clamp(nums[1] ?? 0.5, 0, 1),
      y: clamp(nums[2] ?? 0.5, 0, 1),
      named: null,
    };
  }
  if (nums.length === 2 && nums.every((n) => Number.isFinite(n))) {
    return {
      zoom: 2,
      x: clamp(nums[0] ?? 0.5, 0, 1),
      y: clamp(nums[1] ?? 0.5, 0, 1),
      named: null,
    };
  }
  return { zoom: 2, x: 0, y: 0, named: "tl" };
}

export const KIND_LABEL: Record<Slide["k"], string> = {
  cover: "Cover",
  pan: "Pan",
  overview: "Overview",
  closeup: "Close-up",
  cta: "Close",
  point: "Point",
  stat: "Stat",
  chart: "Chart",
  table: "Table",
};

export function slideFrameSpan(
  payload: DeckPayload,
  index: number,
): { start: number; end: number } {
  let cursor = 1;
  for (let i = 0; i < payload.s.length; i += 1) {
    const slide = payload.s[i];
    const cost = slide?.k === "pan" && payload.p >= 2 ? payload.p : 1;
    if (i === index) return { start: cursor, end: cursor + cost - 1 };
    cursor += cost;
  }
  return { start: cursor, end: cursor };
}

export function formatIndex(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => step(left - 1));
    };
    step(count);
  });
}
