import React, { useMemo, useState } from "react";
import { Flag, Info, ChevronDown } from "lucide-react";
import { Header, CheckRow, Empty, Modal } from "../components/UI";
import MapCanvas from "../components/MapCanvas";
import {
  sampleIncidents,
  filterIncidents,
  concentrationCells,
  incidentTypes,
  timeRanges,
  cutoffDate,
} from "../data/incidents";
export default function ActivityPage({ reports, onBack, onReport, onPoint }) {
  const [now] = useState(() => new Date()),
    [records] = useState(() => sampleIncidents(now)),
    [months, setMonths] = useState(6),
    [types, setTypes] = useState(incidentTypes),
    [mode, setMode] = useState("heat"),
    [personal, setPersonal] = useState(true),
    [filterOpen, setFilterOpen] = useState(false),
    [selectedCell, setSelectedCell] = useState(null);
  const visible = useMemo(
    () => filterIncidents(records, months, types, now),
    [records, months, types, now],
  );
  const cells = useMemo(() => concentrationCells(visible), [visible]);
  const updateMonths = (value) => {
    setMonths(value);
    setSelectedCell(null);
  };
  return (
    <>
      <Header title="Downtown Orlando" onBack={onBack} />
      <div className="content activity-content">
        <div className="eyebrow">NEIGHBORHOOD ACTIVITY</div>
        <h2 className="page-heading">See the bigger picture.</h2>
        <div className="sample-data-banner">
          <Info size={17} />
          <span>
            <b>Sample incidents only</b>
            <br />
            Invented for this preview. Not police records or a measure of actual
            safety.
          </span>
        </div>
        <div
          className="period-tabs"
          role="group"
          aria-label="Incident time period"
        >
          {timeRanges.map((t) => (
            <button
              key={t.id}
              aria-pressed={months === t.id}
              onClick={() => updateMonths(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="activity-toolbar">
          <button className="secondary" onClick={() => setFilterOpen(true)}>
            Incident types · {types.length}/4 <ChevronDown size={15} />
          </button>
          <span className="sample-count" role="status">
            <b>{visible.length}</b> sample incidents
          </span>
        </div>
        <div className="map-mode-tabs" role="group" aria-label="Map display">
          <button
            aria-pressed={mode === "heat"}
            onClick={() => setMode("heat")}
          >
            Concentration
          </button>
          <button
            aria-pressed={mode === "points"}
            onClick={() => setMode("points")}
          >
            Incident dots
          </button>
        </div>
        <div className="activity-map">
          <MapCanvas
            compact
            hideMarker
            incidents={visible}
            heatCells={mode === "heat" ? cells : []}
            showIncidents={mode === "points"}
            selectedCell={selectedCell}
            reports={personal ? reports : []}
            filters={{ reports: personal }}
            onPoint={onPoint}
          />
          <span className="activity-map-badge">ORLANDO · SAMPLE DATA</span>
        </div>
        <div className="heat-legend">
          <span>Fewer</span>
          <i />
          <span>More sample incidents</span>
        </div>
        <p className="caption">
          {cutoffDate(now, months).toLocaleDateString()} –{" "}
          {now.toLocaleDateString()} · Counts per equal map cell. Color scale:
          1–4, 5–9, 10–19, 20+. No population adjustment.
        </p>
        <CheckRow checked={personal} onChange={setPersonal}>
          Show my reported areas{" "}
          <small>
            {reports.length} personal report{reports.length === 1 ? "" : "s"} ·
            orange outlines
          </small>
        </CheckRow>
        <button className="primary" onClick={onReport}>
          <Flag size={17} /> Report an area
        </button>
        <section className="section">
          <h3 className="section-title">Highest sample concentrations</h3>
          {cells.length ? (
            <div className="card concentration-list">
              {cells.slice(0, 3).map((cell, i) => (
                <button
                  key={cell.id}
                  aria-pressed={selectedCell === cell.id}
                  onClick={() =>
                    setSelectedCell(selectedCell === cell.id ? null : cell.id)
                  }
                >
                  <span className="rank">{i + 1}</span>
                  <span>
                    {cell.label}
                    <small>
                      {Math.round((cell.count / visible.length) * 100)}% of
                      filtered sample incidents
                    </small>
                  </span>
                  <b>{cell.count}</b>
                </button>
              ))}
            </div>
          ) : (
            <Empty title="No matching sample incidents">
              Choose another incident type or time period.
            </Empty>
          )}
        </section>
        <p className="caption">
          Personal reports are not included in incident counts or concentration
          rankings. The schematic map is for exploring the demo, not navigation.
        </p>
        <a
          className="map-source"
          href="https://gis.orlando.gov/PDF_Docs/DowntownCRAMaps/DowntownPointsofInterest11x17.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Downtown street reference: City of Orlando ↗
        </a>
      </div>
      {filterOpen && (
        <Modal
          title="Filter incident types"
          onClose={() => setFilterOpen(false)}
        >
          <p className="muted">
            Choose which sample incidents contribute to the map and counts.
          </p>
          {incidentTypes.map((type) => (
            <CheckRow
              key={type}
              checked={types.includes(type)}
              onChange={(checked) => {
                setTypes((t) =>
                  checked ? [...t, type] : t.filter((x) => x !== type),
                );
                setSelectedCell(null);
              }}
            >
              {type}
            </CheckRow>
          ))}
          <button
            className="secondary full"
            onClick={() => {
              setTypes(incidentTypes);
              setSelectedCell(null);
            }}
          >
            Select all types
          </button>
          <button className="primary" onClick={() => setFilterOpen(false)}>
            Show results
          </button>
        </Modal>
      )}
    </>
  );
}
