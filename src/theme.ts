import { planeDark } from "./catalogs";
import type { StudioState } from "./types";

export function slideIsDark(state: StudioState): boolean {
  if (state.mode === "dark") return true;
  if (state.mode === "light") return false;
  return planeDark(state.plane);
}

export function typeColor(state: StudioState, dark: boolean): string {
  if (state.text) return state.text;
  return dark ? "#f6f4ef" : "#161513";
}

export function muteColor(dark: boolean): string {
  return dark ? "rgba(246,244,239,0.62)" : "rgba(22,21,19,0.58)";
}

export function cardFill(style: StudioState["style"], dark: boolean): string {
  if (style === "solid") return dark ? "rgba(18,18,20,0.88)" : "rgba(255,252,247,0.92)";
  if (style === "liquid") return dark ? "rgba(20,20,24,0.38)" : "rgba(255,255,255,0.28)";
  return dark ? "rgba(16,16,18,0.42)" : "rgba(255,255,255,0.36)";
}

export function cardBorder(style: StudioState["style"], dark: boolean): string {
  if (style === "solid") return dark ? "rgba(255,255,255,0.12)" : "rgba(20,18,16,0.12)";
  if (style === "liquid") return dark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.55)";
  return dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.4)";
}
