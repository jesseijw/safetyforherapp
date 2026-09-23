import React, { useState } from "react";
import {
  Cross,
  ShieldCheck,
  Coffee,
  Flag,
  Navigation,
  LocateFixed,
  Layers,
  Plus,
  Minus,
} from "lucide-react";
import {
  helpPoints,
  routePoints,
  positionAt,
  destinations,
} from "../data/mockRoutes";
export default function MapCanvas({
  destination = "union",
  route = "safe",
  showRoute = false,
  progress = 0,
  reports = [],
  filters = { hospital: true, police: true, safe: true, reports: true },
  onPoint = () => {},
  onFilters,
  onReport,
  locateEnabled = true,
  compact = false,
  incidents = [],
  heatCells = [],
  showIncidents = false,
  selectedCell = null,
  hideMarker = false,
}) {
  const [zoom, setZoom] = useState(1);
  const points = routePoints(destination, route);
  const pos = positionAt(points, progress);
  const dest =
    destinations.find((d) => d.id === destination) || destinations[0];
  return (
    <div className={"map-canvas " + (compact ? "compact" : "")}>
      <div className="map-drawing" style={{ transform: `scale(${zoom})` }}>
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 390 650"
          role="img"
          aria-label="Schematic map of downtown Orlando"
        >
          <defs>
            <pattern
              id="blocks"
              width="90"
              height="95"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="8"
                y="8"
                width="73"
                height="78"
                rx="9"
                fill="var(--map-block)"
              />
              <path
                d="M20 24h45M20 31h45"
                stroke="var(--map-detail)"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="390" height="650" fill="var(--map-bg)" />
          <rect width="390" height="650" fill="url(#blocks)" />
          <path d="M70 0L48 650" stroke="var(--road-edge)" strokeWidth="25" />
          <path
            d="M150 0V650M215 0V650M280 0V650M0 150H390M0 300H390M0 370H390M0 460H390M0 550H390"
            stroke="var(--road-edge)"
            strokeWidth="20"
          />
          <path
            d="M150 0V650M215 0V650M280 0V650M0 150H390M0 300H390M0 370H390M0 460H390M0 550H390"
            stroke="var(--road)"
            strokeWidth="15"
          />
          <rect
            x="295"
            y="160"
            width="90"
            height="128"
            rx="27"
            fill="var(--park)"
          />
          <ellipse cx="345" cy="220" rx="35" ry="48" fill="var(--water)" />
          <ellipse cx="215" cy="612" rx="45" ry="28" fill="var(--water)" />
          <g
            fill="var(--map-text)"
            fontSize="10"
            fontFamily="inherit"
            letterSpacing=".5"
          >
            <text x="313" y="215">
              LAKE EOLA
            </text>
            <text x="328" y="230">
              PARK
            </text>
            <text x="177" y="615">
              LAKE LUCERNE
            </text>
            <text x="230" y="143">
              ROBINSON ST
            </text>
            <text x="220" y="292">
              CENTRAL BLVD
            </text>
            <text x="70" y="362">
              CHURCH ST
            </text>
            <text x="225" y="452">
              SOUTH ST
            </text>
            <text x="75" y="542">
              ANDERSON ST
            </text>
            <text x="143" y="22" transform="rotate(90 143 22)">
              ORANGE AVE
            </text>
            <text x="208" y="22" transform="rotate(90 208 22)">
              MAGNOLIA AVE
            </text>
            <text x="273" y="22" transform="rotate(90 273 22)">
              ROSALIND AVE
            </text>
            <text x="47" y="100">
              I-4
            </text>
          </g>
          {heatCells.map((cell) => (
            <rect
              key={cell.id}
              x={cell.x + 2}
              y={cell.y + 2}
              width="93.5"
              height="126"
              rx="12"
              fill={
                cell.count >= 20
                  ? "#b23446"
                  : cell.count >= 10
                    ? "#dc714b"
                    : cell.count >= 5
                      ? "#e9ad56"
                      : "#ecd18a"
              }
              fillOpacity={selectedCell === cell.id ? 0.7 : 0.38}
              stroke={selectedCell === cell.id ? "var(--ink)" : "none"}
              strokeWidth="3"
            >
              <title>
                {cell.label}: {cell.count} sample incidents
              </title>
            </rect>
          ))}
          {filters.reports &&
            reports
              .filter((r) => Number.isFinite(r.x) && Number.isFinite(r.y))
              .map((r) => (
                <circle
                  key={r.id}
                  className="reported-area"
                  cx={r.x}
                  cy={r.y}
                  r={r.radius || 45}
                />
              ))}
          {showRoute && (
            <>
              <polyline
                points={points.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="var(--panel)"
                strokeWidth="12"
                strokeLinejoin="round"
              />
              <polyline
                points={points.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="var(--coral)"
                strokeWidth="6"
                strokeLinejoin="round"
                strokeDasharray={route === "transit" ? "10 6" : undefined}
              />
              <circle
                cx={dest.x}
                cy={dest.y}
                r="8"
                fill="var(--coral)"
                stroke="white"
                strokeWidth="3"
              />
            </>
          )}
        </svg>
        {showIncidents &&
          incidents.map((incident) => (
            <button
              key={incident.id}
              className="incident-dot"
              style={{
                left: (incident.x / 390) * 100 + "%",
                top: (incident.y / 650) * 100 + "%",
              }}
              aria-label={`Sample ${incident.type}, ${new Date(incident.occurredAt).toLocaleDateString()}`}
              onClick={() =>
                onPoint({
                  ...incident,
                  name: `Sample ${incident.type}`,
                  note: `Invented incident · ${new Date(incident.occurredAt).toLocaleDateString()}`,
                  sampleIncident: true,
                })
              }
            />
          ))}
        {helpPoints
          .filter((p) => filters[p.type])
          .map((p) => (
            <button
              key={p.id}
              className={"map-pin " + p.type}
              style={{
                left: (p.x / 390) * 100 + "%",
                top: (p.y / 650) * 100 + "%",
              }}
              aria-label={p.name}
              onClick={() => onPoint(p)}
            >
              {p.type === "hospital" ? (
                <Cross size={16} />
              ) : p.type === "police" ? (
                <ShieldCheck size={17} />
              ) : (
                <Coffee size={17} />
              )}
            </button>
          ))}
        {filters.reports &&
          reports.map((r, i) => (
            <button
              key={r.id}
              className="map-pin report-pin"
              style={{
                left: ((r.x ?? 120 + (i % 3) * 40) / 390) * 100 + "%",
                top: ((r.y ?? 330 + (i % 4) * 22) / 650) * 100 + "%",
              }}
              onClick={() =>
                onPoint({
                  ...r,
                  name: r.type,
                  note: r.description || "Locally saved demo report",
                })
              }
              aria-label={`Your report: ${r.type}`}
            >
              <Flag size={14} />
            </button>
          ))}
        {!hideMarker && (
          <div
            className="you-marker"
            style={{
              left: (pos[0] / 390) * 100 + "%",
              top: (pos[1] / 650) * 100 + "%",
            }}
          >
            <Navigation size={14} fill="currentColor" />
          </div>
        )}
      </div>
      <span className="map-label">DOWNTOWN ORLANDO · DEMO</span>
      {!compact && (
        <>
          <div className="map-controls">
            <button aria-label="Map filters" onClick={onFilters}>
              <Layers size={19} />
            </button>
            <button
              aria-label="Zoom in"
              disabled={zoom >= 1.6}
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}
            >
              <Plus size={19} />
            </button>
            <button
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            >
              <Minus size={19} />
            </button>
          </div>
          <button className="map-report" onClick={onReport}>
            <Flag size={17} /> Report
          </button>
          <button
            className="map-locate"
            aria-label="Recenter demo location"
            disabled={!locateEnabled}
            onClick={() => setZoom(1)}
          >
            <LocateFixed size={21} />
          </button>
        </>
      )}
    </div>
  );
}
