import { toBlob } from "html-to-image";
import type { StudioState } from "./types";

export function exportFilter(node: HTMLElement): boolean {
  if (node.dataset?.exportHide === "" || node.dataset?.exportHide === "true") return false;
  return !node.closest?.("[data-export-hide]");
}

export async function rasterizeNode(
  node: HTMLElement,
  width: number,
  height: number,
  res: 1 | 2 | 3,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const blob = await toBlob(node, {
    width,
    height,
    pixelRatio: res,
    cacheBust: true,
    filter: (domNode) => {
      if (!(domNode instanceof HTMLElement)) return true;
      return exportFilter(domNode);
    },
    style: {
      transform: "none",
      margin: "0",
    },
  });
  if (!blob) throw new Error("Could not rasterize slide");
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width * res;
    canvas.height = height * res;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function sliceCanvas(source: HTMLCanvasElement, slices: number): HTMLCanvasElement[] {
  const sliceW = Math.round(source.width / slices);
  const out: HTMLCanvasElement[] = [];
  for (let i = 0; i < slices; i += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = sliceW;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    ctx.drawImage(source, i * sliceW, 0, sliceW, source.height, 0, 0, sliceW, source.height);
    out.push(canvas);
  }
  return out;
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((next) => resolve(next), "image/png");
  });
  if (!blob) throw new Error("Could not encode PNG");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function slideFilename(state: StudioState, index: number): string {
  const n = String(index + 1).padStart(2, "0");
  const scale = state.res === 1 ? "" : `@${state.res}x`;
  return `${n}-carousel-${state.recipe}-${state.frame}${scale}.png`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read raster"));
    image.src = src;
  });
}
