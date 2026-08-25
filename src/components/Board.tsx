import type { CSSProperties } from "react";
import { slotsChart, slotsKpis, slotsTable } from "../fixtures";
import { BOARD_H, BOARD_W } from "../lib";
import { cardBorder, cardFill, muteColor, typeColor } from "../theme";
import type { ChartSeries, KpiDatum, StudioState, TableRow } from "../types";

interface BoardProps {
  state: StudioState;
  dark: boolean;
}

export function Board({ state, dark }: BoardProps) {
  const ink = typeColor(state, dark);
  const mute = muteColor(dark);
  const kpis = slotsKpis(state.slots, state.kpis);
  const chart = slotsChart(state.slots);
  const table = slotsTable(state.slots);

  if (state.shot) {
    return (
      <div className="board-shot">
        <img src={state.shot} alt="" width={BOARD_W} height={BOARD_H} />
      </div>
    );
  }

  return (
    <div
      className={`board-synth panel-${state.panel}`}
      style={
        {
          "--ink": ink,
          "--mute": mute,
          "--accent": state.chart,
          "--card": cardFill("solid", dark),
          "--line": cardBorder("solid", dark),
        } as CSSProperties
      }
    >
      <header className="board-rail">
        <div>
          <p className="board-kicker">Desk / this week</p>
          <h3>Pipeline desk</h3>
        </div>
        <span className="board-chip">Live fixture</span>
      </header>
      <div className="board-kpis" style={{ gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))` }}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} design={state.kpi} accent={state.chart} />
        ))}
      </div>
      <div className="board-plot">
        <div className="plot-head">
          <div>
            <p className="board-kicker">{chart.label}</p>
            <strong>
              {chart.values[chart.values.length - 1]}
              {chart.unit}
            </strong>
          </div>
          <span>12 weeks</span>
        </div>
        <AreaChart series={chart} accent={state.chart} dark={dark} />
      </div>
      <BoardTable rows={table.rows} design={table.id} />
    </div>
  );
}

function KpiCard({
  kpi,
  design,
  accent,
}: {
  kpi: KpiDatum;
  design: StudioState["kpi"];
  accent: string;
}) {
  const spark = (
    <svg className="spark" viewBox="0 0 80 24" aria-hidden>
      <polyline
        fill="none"
        stroke={accent}
        strokeWidth="2"
        points={kpi.spark
          .map((value, i) => {
            const max = Math.max(...kpi.spark);
            const min = Math.min(...kpi.spark);
            const x = (i / Math.max(kpi.spark.length - 1, 1)) * 80;
            const y = 20 - ((value - min) / Math.max(max - min, 1)) * 16;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );

  const ring = (
    <svg className="ring" viewBox="0 0 36 36" aria-hidden>
      <circle cx="18" cy="18" r="14" />
      <circle
        cx="18"
        cy="18"
        r="14"
        style={{
          stroke: accent,
          strokeDasharray: `${kpi.progress * 88} 88`,
        }}
      />
    </svg>
  );

  switch (design) {
    case "compact":
      return (
        <article className="kpi kpi-compact">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
        </article>
      );
    case "stat":
      return (
        <article className="kpi kpi-stat">
          <strong>{kpi.value}</strong>
          <span>{kpi.label}</span>
          <em className={kpi.up ? "up" : "down"}>{kpi.delta}</em>
        </article>
      );
    case "minimal":
      return (
        <article className="kpi kpi-minimal">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
        </article>
      );
    case "inline":
      return (
        <article className="kpi kpi-inline">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <em className={kpi.up ? "up" : "down"}>{kpi.delta}</em>
        </article>
      );
    case "spark":
      return (
        <article className="kpi kpi-spark">
          <div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
          {spark}
        </article>
      );
    case "ring":
      return (
        <article className="kpi kpi-ring">
          {ring}
          <div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
        </article>
      );
    case "ring-inline":
      return (
        <article className="kpi kpi-ring-inline">
          {ring}
          <strong>{kpi.value}</strong>
          <span>{kpi.label}</span>
        </article>
      );
    case "rule":
      return (
        <article className="kpi kpi-rule">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <i style={{ background: accent }} />
        </article>
      );
    case "track":
      return (
        <article className="kpi kpi-track">
          <div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
          <div className="track">
            <b style={{ width: `${kpi.progress * 100}%`, background: accent }} />
          </div>
        </article>
      );
    case "section":
      return (
        <article className="kpi kpi-section">
          <span>{kpi.label}</span>
          <strong>{kpi.value}</strong>
          <em className={kpi.up ? "up" : "down"}>{kpi.delta}</em>
        </article>
      );
    default: {
      const _never: never = design;
      return _never;
    }
  }
}

function AreaChart({
  series,
  accent,
  dark,
}: {
  series: ChartSeries;
  accent: string;
  dark: boolean;
}) {
  const max = Math.max(...series.values);
  const min = Math.min(...series.values) * 0.72;
  const w = 980;
  const h = 220;
  const points = series.values.map((value, i) => {
    const x = (i / Math.max(series.values.length - 1, 1)) * w;
    const y = h - ((value - min) / Math.max(max - min, 1)) * (h - 16);
    return { x, y };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg className="area" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <line
          key={i}
          x1="0"
          x2={w}
          y1={(h / 4) * i}
          y2={(h / 4) * i}
          stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
        />
      ))}
      <polygon points={area} fill={accent} opacity="0.22" />
      <polyline points={line} fill="none" stroke={accent} strokeWidth="3" />
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="3.5" fill={accent} />
      ))}
    </svg>
  );
}

function BoardTable({ rows, design }: { rows: TableRow[]; design: string }) {
  return (
    <table className={`board-table ${design}`}>
      <thead>
        <tr>
          <th>Desk</th>
          <th>Vol</th>
          <th>Hit</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.volume}</td>
            <td>
              {design === "table-meters" || design === "table-matrix" ? (
                <span className="meter">
                  <b style={{ width: `${row.rate}%` }} />
                  <em>{row.rate}%</em>
                </span>
              ) : (
                `${row.rate}%`
              )}
            </td>
            <td>{row.state}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { AreaChart };
