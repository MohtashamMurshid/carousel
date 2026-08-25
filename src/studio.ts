import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultSlide, parseSearch, randomizeStyle, replaceSearch, type StylePatch } from "./codec";
import { DEFAULT_SLOTS } from "./fixtures";
import { expandFrames, frameCount, MAX_FRAMES, normalizePayload, slideCost } from "./lib";
import { buildRecipe } from "./recipes";
import type { AddableKind, Slide, StudioState } from "./types";

export type ChromeTheme = "light" | "dark" | "system";

const THEME_KEY = "carousel-chrome-theme";

function readTheme(): ChromeTheme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "dark";
}

export function resolveChrome(theme: ChromeTheme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useStudio() {
  const [state, setState] = useState<StudioState>(() =>
    parseSearch(typeof window === "undefined" ? "" : window.location.search),
  );
  const [selected, setSelected] = useState(0);
  const [chromeTheme, setChromeThemeState] = useState<ChromeTheme>(readTheme);

  const frames = useMemo(() => expandFrames(state), [state]);

  useEffect(() => {
    const onPop = () => {
      setState(parseSearch(window.location.search));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (selected >= frames.length) setSelected(Math.max(0, frames.length - 1));
  }, [frames.length, selected]);

  const setChromeTheme = useCallback((theme: ChromeTheme) => {
    setChromeThemeState(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, []);

  const commit = useCallback((next: StudioState) => {
    const normalized: StudioState = {
      ...next,
      payload: normalizePayload(next.payload),
    };
    setState(normalized);
    replaceSearch(normalized);
  }, []);

  const patch = useCallback(
    (partial: StylePatch) => {
      const next = { ...state, ...partial };
      if (partial.recipe) {
        next.payload = buildRecipe(partial.recipe);
      }
      commit(next);
    },
    [commit, state],
  );

  const setPayload = useCallback(
    (updater: (prev: StudioState["payload"]) => StudioState["payload"]) => {
      commit({ ...state, payload: normalizePayload(updater(state.payload)) });
    },
    [commit, state],
  );

  const setPan = useCallback(
    (p: 0 | 2 | 3 | 4) => {
      setPayload((prev) => {
        const slides = prev.s.filter((slide) => slide.k !== "pan");
        if (p === 0) return { ...prev, p: 0, s: slides };
        const insertAt = slides.length === 0 ? 0 : 1;
        slides.splice(insertAt, 0, { k: "pan" });
        return { ...prev, p, s: slides };
      });
    },
    [setPayload],
  );

  const updateSlide = useCallback(
    (index: number, partial: Partial<Slide>) => {
      setPayload((prev) => ({
        ...prev,
        s: prev.s.map((slide, i) => (i === index ? { ...slide, ...partial } : slide)),
      }));
    },
    [setPayload],
  );

  const moveSlide = useCallback(
    (index: number, dir: -1 | 1) => {
      setPayload((prev) => {
        const target = index + dir;
        if (target < 0 || target >= prev.s.length) return prev;
        const s = [...prev.s];
        const current = s[index];
        const other = s[target];
        if (!current || !other) return prev;
        s[index] = other;
        s[target] = current;
        return { ...prev, s };
      });
    },
    [setPayload],
  );

  const removeSlide = useCallback(
    (index: number) => {
      setPayload((prev) => {
        if (prev.s.length <= 1) return prev;
        const s = prev.s.filter((_, i) => i !== index);
        const p = s.some((slide) => slide.k === "pan") ? prev.p : 0;
        return { ...prev, p, s };
      });
    },
    [setPayload],
  );

  const addSlide = useCallback(
    (kind: AddableKind) => {
      const cost = slideCost(kind, state.payload.p);
      if (frameCount(state.payload) + cost > MAX_FRAMES) return false;
      const after = frames[selected]?.slideIndex ?? state.payload.s.length - 1;
      setPayload((prev) => {
        const s = [...prev.s];
        s.splice(after + 1, 0, defaultSlide(kind));
        return { ...prev, s };
      });
      return true;
    },
    [frames, selected, setPayload, state.payload],
  );

  const setHandle = useCallback(
    (h: string) => {
      setPayload((prev) => ({ ...prev, h }));
    },
    [setPayload],
  );

  const setShot = useCallback(
    (file: File | null) => {
      if (state.shot && state.shot.startsWith("blob:")) {
        URL.revokeObjectURL(state.shot);
      }
      if (!file) {
        commit({ ...state, shot: null, shotName: null });
        return;
      }
      commit({
        ...state,
        shot: URL.createObjectURL(file),
        shotName: null,
      });
    },
    [commit, state],
  );

  const useFixtureShot = useCallback(() => {
    if (state.shot && state.shot.startsWith("blob:")) {
      URL.revokeObjectURL(state.shot);
    }
    commit({ ...state, shot: "/fixture.svg", shotName: "fixture" });
  }, [commit, state]);

  const useSlotBoard = useCallback(() => {
    if (state.shot && state.shot.startsWith("blob:")) {
      URL.revokeObjectURL(state.shot);
    }
    commit({ ...state, shot: null, shotName: "slots" });
  }, [commit, state]);

  const randomize = useCallback(() => {
    commit(randomizeStyle(state));
  }, [commit, state]);

  const resetSlots = useCallback(() => {
    commit({ ...state, slots: [...DEFAULT_SLOTS], kpis: 3 });
  }, [commit, state]);

  return {
    state,
    frames,
    selected,
    setSelected,
    chromeTheme,
    setChromeTheme,
    patch,
    setPan,
    updateSlide,
    moveSlide,
    removeSlide,
    addSlide,
    setHandle,
    setShot,
    useFixtureShot,
    useSlotBoard,
    randomize,
    resetSlots,
  };
}

export type StudioApi = ReturnType<typeof useStudio>;
