import React from "react";
import MapCanvas from "./MapCanvas";

export default function ReportLocation({ value, onChange, radius }) {
  function pick(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    onChange({
      x: Math.round(
        Math.max(
          0,
          Math.min(390, ((event.clientX - bounds.left) / bounds.width) * 390),
        ),
      ),
      y: Math.round(
        Math.max(
          0,
          Math.min(650, ((event.clientY - bounds.top) / bounds.height) * 650),
        ),
      ),
    });
  }
  function move(event) {
    const steps = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -15],
      ArrowDown: [0, 15],
    };
    if (!steps[event.key]) return;
    event.preventDefault();
    const [dx, dy] = steps[event.key],
      p = value || { x: 195, y: 325 };
    onChange({
      x: Math.max(0, Math.min(390, p.x + dx)),
      y: Math.max(0, Math.min(650, p.y + dy)),
    });
  }
  return (
    <div className="report-location">
      <div className="report-picker-map">
        <MapCanvas compact filters={{}} />
        <button
          type="button"
          className="report-picker-target"
          aria-label="Choose report location. Click the map or use arrow keys to move the marker."
          onClick={pick}
          onKeyDown={move}
        >
          {value && (
            <svg
              viewBox="0 0 390 650"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <circle
                cx={value.x}
                cy={value.y}
                r={radius}
                className="reported-area"
              />
              <circle
                cx={value.x}
                cy={value.y}
                r="9"
                fill="var(--red)"
                stroke="white"
                strokeWidth="3"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="caption" role="status">
        {value
          ? "Area selected. Tap again to move it."
          : "Tap the map to mark the area, or focus the map and use arrow keys."}
      </p>
    </div>
  );
}
