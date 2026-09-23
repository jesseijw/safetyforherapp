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
          aria-label="Fictional neighborhood map with sample help points"
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
          <path
            d="M-25 60Q85 130 38 280T45 680"
            stroke="var(--water)"
            strokeWidth="52"
            fill="none"
          />
          <path
            d="M65 0L65 650M0 180H390M0 300H390M0 410H390M185 0V650M300 0V650M0 490H390"
            stroke="var(--road-edge)"
            strokeWidth="20"
          />
          <path
            d="M65 0L65 650M0 180H390M0 300H390M0 410H390M185 0V650M300 0V650M0 490H390"
            stroke="var(--road)"
            strokeWidth="16"
          />
          <rect
            x="202"
            y="199"
            width="80"
            height="82"
            rx="18"
            fill="var(--park)"
          />
          <rect
            x="88"
            y="325"
            width="73"
            height="65"
            rx="16"
            fill="var(--park)"
          />
          <g
            fill="var(--map-text)"
            fontSize="9"
            fontFamily="inherit"
            letterSpacing="1"
          >
            <text x="206" y="242">
              JUNIPER
            </text>
            <text x="216" y="254">
              GARDENS
            </text>
            <text x="99" y="355">
              RIVER
            </text>
            <text x="101" y="367">
              PARK
            </text>
            <text x="200" y="173">
              MARKET STREET
            </text>
            <text x="195" y="402">
              RIVERSIDE AVENUE
            </text>
            <text x="77" y="480">
              5TH STREET
            </text>
            <text x="309" y="115" transform="rotate(90 309 115)">
              UNION AVENUE
            </text>
          </g>
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
                left: ((120 + (i % 3) * 40) / 390) * 100 + "%",
                top: ((330 + (i % 4) * 22) / 650) * 100 + "%",
              }}
              onClick={() =>
                onPoint({
                  ...r,
                  name: r.type,
                  note: r.description || "Locally saved demo report",
                })
              }
              aria-label={r.type}
            >
              <Flag size={14} />
            </button>
          ))}
        <div
          className="you-marker"
          style={{
            left: (pos[0] / 390) * 100 + "%",
            top: (pos[1] / 650) * 100 + "%",
          }}
        >
          <Navigation size={14} fill="currentColor" />
        </div>
      </div>
      <span className="map-label">DEMO NEIGHBORHOOD</span>
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
