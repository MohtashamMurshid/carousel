import { hashString } from "./lib";
import {
  FRAME_IDS,
  type FrameId,
  type FrameSpec,
  type PlaneDef,
  type SafeArea,
} from "./types";

export const FRAMES: Record<FrameId, FrameSpec> = {
  "ig-portrait": { id: "ig-portrait", w: 1080, h: 1350, family: "ig", label: "IG portrait" },
  "ig-square": { id: "ig-square", w: 1080, h: 1080, family: "ig", label: "IG square" },
  "ig-story": { id: "ig-story", w: 1080, h: 1920, family: "ig", label: "IG story" },
  "li-carousel": { id: "li-carousel", w: 1080, h: 1350, family: "li", label: "LI carousel" },
  "li-square": { id: "li-square", w: 1080, h: 1080, family: "li", label: "LI square" },
  "li-landscape": { id: "li-landscape", w: 1920, h: 1080, family: "li", label: "LI landscape" },
};

export function isFrameId(value: string): value is FrameId {
  return (FRAME_IDS as readonly string[]).includes(value);
}

export function safeArea(frame: FrameId): SafeArea {
  return FRAMES[frame].family === "ig"
    ? { top: 0.06, bottom: 0.09, side: 0.055 }
    : { top: 0.05, bottom: 0.08, side: 0.05 };
}

export const NAMED_PLANES: PlaneDef[] = [
  { id: "mercury", group: "liquid", label: "Mercury", dark: false },
  { id: "chrome", group: "liquid", label: "Chrome", dark: false },
  { id: "pewter", group: "liquid", label: "Pewter", dark: true },
  { id: "bronze", group: "liquid", label: "Bronze", dark: true },
  { id: "steel", group: "liquid", label: "Steel", dark: true },
  { id: "dusk", group: "mesh", label: "Dusk", dark: true },
  { id: "dawn", group: "mesh", label: "Dawn", dark: false },
  { id: "midnight", group: "mesh", label: "Midnight", dark: true },
  { id: "aurora", group: "mesh", label: "Aurora", dark: true },
  { id: "ember", group: "mesh", label: "Ember", dark: true },
  { id: "ink", group: "flat", label: "Ink", dark: true },
  { id: "paper", group: "flat", label: "Paper", dark: false },
  { id: "slate", group: "flat", label: "Slate", dark: true },
  { id: "bone", group: "flat", label: "Bone", dark: false },
  { id: "void", group: "flat", label: "Void", dark: true },
  { id: "img-7", group: "photo", label: "Still 07", dark: true },
  { id: "img-12", group: "photo", label: "Still 12", dark: false },
  { id: "img-23", group: "photo", label: "Still 23", dark: true },
  { id: "img-30", group: "photo", label: "Still 30", dark: true },
];

export const CHART_SWATCHES = [
  { id: "white", hex: "#ffffff", label: "White" },
  { id: "cream", hex: "#efe6d2", label: "Cream" },
  { id: "ink", hex: "#171717", label: "Ink" },
  { id: "slate", hex: "#475569", label: "Slate" },
  { id: "blue", hex: "#3b82f6", label: "Blue" },
  { id: "amber", hex: "#d97706", label: "Amber" },
  { id: "green", hex: "#16a34a", label: "Green" },
  { id: "pink", hex: "#db2777", label: "Pink" },
  { id: "purple", hex: "#7c3aed", label: "Purple" },
  { id: "red", hex: "#dc2626", label: "Red" },
  { id: "teal", hex: "#0d9488", label: "Teal" },
] as const;

export function resolvePlane(id: string): PlaneDef {
  const named = NAMED_PLANES.find((plane) => plane.id === id);
  if (named) return named;
  if (id.startsWith("img-")) {
    const hue = hashString(id) % 360;
    return {
      id,
      group: "photo",
      label: `Still ${id.slice(4)}`,
      dark: hue < 40 || hue > 200,
    };
  }
  return NAMED_PLANES.find((plane) => plane.id === "dusk") ?? NAMED_PLANES[0]!;
}

export function planeDark(id: string): boolean {
  return resolvePlane(id).dark;
}

export interface PlanePaint {
  base: string;
  overlay?: string;
}

export function planePaint(id: string): PlanePaint {
  switch (id) {
    case "mercury":
      return {
        base: "linear-gradient(145deg, #f4f4f6 0%, #9a9aa3 26%, #ffffff 40%, #6f6f78 70%, #d4d4da 100%)",
      };
    case "chrome":
      return {
        base: "linear-gradient(160deg, #ececf0 0%, #b8b8c0 22%, #ffffff 38%, #7a7a84 62%, #cfd0d6 88%)",
      };
    case "pewter":
      return {
        base: "linear-gradient(150deg, #2a2b30 0%, #6d6f76 34%, #1c1d21 58%, #8a8c93 78%, #121316 100%)",
      };
    case "bronze":
      return {
        base: "linear-gradient(152deg, #3a2416 0%, #b06a32 28%, #6a3b1c 52%, #e0b27a 74%, #24140c 100%)",
      };
    case "steel":
      return {
        base: "linear-gradient(168deg, #1a222b 0%, #4a5b6c 30%, #0f141a 55%, #7f93a6 78%, #10151b 100%)",
      };
    case "dusk":
      return {
        base: [
          "radial-gradient(70% 55% at 18% 18%, rgba(92, 64, 160, 0.55) 0%, transparent 58%)",
          "radial-gradient(55% 45% at 82% 12%, rgba(28, 78, 120, 0.5) 0%, transparent 52%)",
          "radial-gradient(48% 42% at 72% 84%, rgba(140, 48, 72, 0.38) 0%, transparent 55%)",
          "linear-gradient(165deg, #0b0c14 0%, #16101c 52%, #0a0a10 100%)",
        ].join(", "),
      };
    case "dawn":
      return {
        base: [
          "radial-gradient(60% 50% at 20% 80%, rgba(255, 176, 120, 0.7) 0%, transparent 55%)",
          "radial-gradient(50% 40% at 80% 20%, rgba(255, 214, 170, 0.55) 0%, transparent 50%)",
          "linear-gradient(180deg, #f3d3c2 0%, #d7b3b8 48%, #8ea4c4 100%)",
        ].join(", "),
      };
    case "midnight":
      return {
        base: [
          "radial-gradient(50% 40% at 30% 20%, rgba(40, 70, 140, 0.45) 0%, transparent 60%)",
          "linear-gradient(180deg, #07080e 0%, #101428 60%, #05060a 100%)",
        ].join(", "),
      };
    case "aurora":
      return {
        base: [
          "radial-gradient(45% 40% at 20% 70%, rgba(40, 200, 170, 0.4) 0%, transparent 60%)",
          "radial-gradient(40% 35% at 78% 28%, rgba(120, 80, 220, 0.45) 0%, transparent 55%)",
          "linear-gradient(165deg, #071016 0%, #12202a 100%)",
        ].join(", "),
      };
    case "ember":
      return {
        base: [
          "radial-gradient(50% 45% at 70% 80%, rgba(220, 80, 40, 0.45) 0%, transparent 60%)",
          "linear-gradient(160deg, #140806 0%, #2a1210 50%, #0c0706 100%)",
        ].join(", "),
      };
    case "ink":
      return { base: "linear-gradient(180deg, #111113 0%, #0a0a0c 100%)" };
    case "paper":
      return { base: "linear-gradient(180deg, #f4efe6 0%, #e6dfd2 100%)" };
    case "slate":
      return { base: "linear-gradient(180deg, #2a3038 0%, #1a1e24 100%)" };
    case "bone":
      return { base: "linear-gradient(180deg, #ebe6dc 0%, #d8d0c4 100%)" };
    case "void":
      return { base: "linear-gradient(180deg, #050506 0%, #09090b 100%)" };
    case "img-7":
      return photoPlane(210, 18, 10);
    case "img-12":
      return photoPlane(32, 72, 62);
    case "img-23":
      return photoPlane(18, 28, 14);
    case "img-30":
      return photoPlane(268, 16, 12);
    default:
      if (id.startsWith("img-")) {
        const h = hashString(id);
        return photoPlane(h % 360, 16 + (h % 20), 8 + ((h >> 8) % 16));
      }
      return planePaint("dusk");
  }
}

function photoPlane(hue: number, sat: number, lit: number): PlanePaint {
  const a = `hsl(${hue} ${sat}% ${lit}%)`;
  const b = `hsl(${(hue + 28) % 360} ${sat + 8}% ${lit + 10}%)`;
  const c = `hsl(${(hue + 190) % 360} ${sat - 4}% ${lit + 6}%)`;
  const d = `hsl(${(hue + 8) % 360} ${sat + 4}% ${Math.min(lit + 22, 40)}%)`;
  return {
    base: [
      `radial-gradient(70% 55% at 18% 22%, ${d} 0%, transparent 58%)`,
      `radial-gradient(55% 48% at 82% 78%, ${c} 0%, transparent 56%)`,
      `linear-gradient(168deg, ${a} 0%, ${b} 46%, ${a} 100%)`,
    ].join(", "),
    overlay:
      "radial-gradient(120% 80% at 50% 20%, rgba(255,255,255,0.14), transparent 42%), radial-gradient(80% 60% at 60% 90%, rgba(0,0,0,0.35), transparent 50%)",
  };
}

export const PLANE_GROUPS: { id: PlaneDef["group"]; label: string }[] = [
  { id: "liquid", label: "Liquid metal" },
  { id: "mesh", label: "Mesh" },
  { id: "flat", label: "Flat" },
  { id: "photo", label: "Generated stills" },
];
