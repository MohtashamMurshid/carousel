import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Aside } from "./components/Aside";
import { Filmstrip } from "./components/Filmstrip";
import { Header } from "./components/Header";
import { SlideView } from "./components/SlideView";
import { FRAMES } from "./catalogs";
import { canvasToBlob, downloadBlob, rasterizeNode, sliceCanvas, slideFilename } from "./export";
import { sleep, waitFrames } from "./lib";
import { resolveChrome, useStudio } from "./studio";
import type { FilmFrame } from "./types";

export default function App() {
  const api = useStudio();
  const { state, frames, selected, setSelected, chromeTheme, setChromeTheme } = api;
  const [tab, setTab] = useState<"deck" | "style" | "export">("deck");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avail, setAvail] = useState({ w: 960, h: 640 });
  const [exportFrame, setExportFrame] = useState<FilmFrame | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => resolveChrome(chromeTheme));
  const mainRef = useRef<HTMLElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef<((el: HTMLElement) => void) | null>(null);

  useEffect(() => {
    const apply = () => setResolvedTheme(resolveChrome(chromeTheme));
    apply();
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [chromeTheme]);

  useLayoutEffect(() => {
    const node = mainRef.current;
    if (!node) return;
    const read = () => {
      const box = node.getBoundingClientRect();
      setAvail({ w: Math.max(160, box.width - 48), h: Math.max(160, box.height - 88) });
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (exportFrame && exportRef.current && readyRef.current) {
      readyRef.current(exportRef.current);
    }
  }, [exportFrame]);

  const spec = FRAMES[state.frame];
  const scale = useMemo(() => {
    return Math.min(avail.w / spec.w, avail.h / spec.h, 1);
  }, [avail.h, avail.w, spec.h, spec.w]);

  const exportSlide = async (frame: FilmFrame) => {
    const node = await new Promise<HTMLElement>((resolve) => {
      readyRef.current = resolve;
      setExportFrame(frame);
    });
    await waitFrames(3);
    const slide = node.querySelector(".slide");
    if (!(slide instanceof HTMLElement)) throw new Error("Slide was not mounted");
    return slide;
  };

  const onExport = async () => {
    if (busy || frames.length === 0) return;
    setBusy(true);
    setError(null);
    let fileIndex = 0;
    try {
      const seenPan = new Set<number>();
      for (const frame of frames) {
        if (frame.slide.k === "pan" && frame.panCount >= 2) {
          if (seenPan.has(frame.slideIndex)) continue;
          seenPan.add(frame.slideIndex);
          setStatus(`Rasterizing pan · ${frame.panCount} slices`);
          const node = await exportSlide(frame);
          const wide = await rasterizeNode(node, spec.w * frame.panCount, spec.h, state.res);
          const slices = sliceCanvas(wide, frame.panCount);
          for (const slice of slices) {
            const blob = await canvasToBlob(slice);
            downloadBlob(blob, slideFilename(state, fileIndex));
            fileIndex += 1;
            await sleep(160);
          }
          continue;
        }
        setStatus(`Rasterizing ${String(fileIndex + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`);
        const node = await exportSlide(frame);
        const canvas = await rasterizeNode(node, spec.w, spec.h, state.res);
        downloadBlob(await canvasToBlob(canvas), slideFilename(state, fileIndex));
        fileIndex += 1;
        await sleep(160);
      }
      setStatus(`Saved ${fileIndex} PNGs`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      setStatus(null);
    } finally {
      setExportFrame(null);
      readyRef.current = null;
      setBusy(false);
      window.setTimeout(() => setStatus(null), 3200);
    }
  };

  const onSave = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setError("Could not copy the share link");
    }
  };

  return (
    <div className="studio" data-theme={resolvedTheme}>
      <Header
        theme={chromeTheme}
        onTheme={setChromeTheme}
        onSave={() => void onSave()}
        saved={saved}
        onExport={() => void onExport()}
        busy={busy}
        frames={frames.length}
      />
      <div className="workspace">
        <main className="stage" ref={mainRef}>
          {frames.length === 0 ? (
            <p className="empty">Deck is empty. Add a cover to start.</p>
          ) : (
            <Filmstrip
              state={state}
              frames={frames}
              selected={selected}
              onSelect={setSelected}
              onEdit={api.updateSlide}
              onHandle={api.setHandle}
              onShot={(file) => api.setShot(file)}
              scale={scale}
            />
          )}
          <footer className="status">
            <span>
              {frames.length} slides · frame {spec.w}×{spec.h} · shown at {Math.round(scale * 100)}% ·
              exports {spec.w * state.res}×{spec.h * state.res}
              {state.payload.p >= 2 ? ` · pan cut from one ${spec.w * state.res}px shot` : ""}
            </span>
            {status ? <strong>{status}</strong> : null}
            {error ? <strong className="err">{error}</strong> : null}
          </footer>
        </main>
        <Aside api={api} tab={tab} onTab={setTab} />
      </div>
      <div className="export-stage" ref={exportRef} aria-hidden>
        {exportFrame ? (
          <SlideView
            state={state}
            frame={exportFrame}
            total={frames.length}
            hideChrome={exportFrame.slide.k === "pan"}
          />
        ) : null}
      </div>
    </div>
  );
}
