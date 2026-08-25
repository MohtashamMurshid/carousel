import type { ChromeTheme } from "../studio";

interface HeaderProps {
  theme: ChromeTheme;
  onTheme: (theme: ChromeTheme) => void;
  onSave: () => void;
  saved: boolean;
  onExport: () => void;
  busy: boolean;
  frames: number;
}

export function Header({ theme, onTheme, onSave, saved, onExport, busy, frames }: HeaderProps) {
  return (
    <header className="topbar">
      <h1>Carousel studio</h1>
      <div className="top-actions">
        <button type="button" className="save" onClick={onSave}>
          <HeartIcon />
          {saved ? "Copied" : "Save"}
        </button>
        <div className="theme-seg" role="radiogroup" aria-label="Theme">
          <button
            type="button"
            role="radio"
            aria-checked={theme === "light"}
            className={theme === "light" ? "on" : ""}
            onClick={() => onTheme("light")}
          >
            <SunIcon />
            Light
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={theme === "dark"}
            className={theme === "dark" ? "on" : ""}
            onClick={() => onTheme("dark")}
          >
            <MoonIcon />
            Dark
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={theme === "system"}
            className={theme === "system" ? "on" : ""}
            onClick={() => onTheme("system")}
          >
            <SystemIcon />
            System
          </button>
        </div>
        <button type="button" className="export" onClick={onExport} disabled={busy}>
          <DownloadIcon />
          {busy ? "Exporting…" : `Export ${frames} frames`}
        </button>
      </div>
    </header>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-9.2-8.2C1 8.6 2.4 5 6.2 5c2 0 3.3 1.1 3.8 2.2C10.5 6.1 11.8 5 13.8 5c3.8 0 5.2 3.6 3.4 6.8C19 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 13.5A6.5 6.5 0 1 1 10.5 4 5.2 5.2 0 0 0 16 13.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
