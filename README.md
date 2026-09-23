# SafeTrip

A mobile-first React preview based on the supplied SafeTrip HTML mockup. Desktop displays a phone-sized app; mobile uses the full viewport.

## Run

Use Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`; run `npm run preview` to serve it. `npm test` runs the focused interaction and state tests. Tests disable Node's experimental global Web Storage so jsdom can supply browser storage.

## Demo capabilities

- Search four downtown Orlando destinations, compare simulated routes, and filter sample help points.
- Run a 90-second simulated trip with pause/resume, check-ins, message previews, arrival/cancellation, and history.
- Add, edit, and remove trusted contacts; edit the emergency card.
- Preview SOS with a tap or a 1.1-second hold. Calls and messages are never sent.
- Configure notifications, demo privacy preferences, a demo passcode, and dark mode.
- Pick, size, describe, edit, and delete personal areas of concern on the local map.
- Explore downtown Orlando sample incidents using 1-, 6-, and 12-month calendar filters, incident-type filters, a concentration grid, incident dots, and ranked sample concentrations.
- Reset all sample data.

Data is saved only in this browser under `safetrip.demo.v1`. Refreshed active trips resume paused. The passcode is an interaction preview, not encryption or access control. Use sample personal information. No account, live geolocation, routing API, phone/SMS integration, or production safety scoring is included.

## Structure

`src/App.jsx` owns navigation and shared state; `src/pages` contains the main screens. `src/components` contains shared UI and the schematic map. `src/state.js` handles persistence and trip transitions; `src/data/mockRoutes.js` contains sample places and geometry. All routes use URL hashes for static-host compatibility.

The original HTML stays ignored in `.local-reference/`. Its logo is extracted into `public/logo.png`. The Sites manifest declares a private static deployment from `dist`; the GitHub origin is preserved.

## Validation

Focused jsdom tests cover trip planning/completion, contact editing, dark-mode persistence, SOS gesture timing, privacy restrictions, storage recovery, and route interpolation. Dialog accessibility uses native HTML dialog behavior (focus containment, Escape, focus restoration). Browser visual QA was not performed.

An optional `stage_demo_trip` WebMCP tool stages a known destination and route through the same UI state. Its valid/invalid input contract is tested in jsdom; an actual browser WebMCP context has not been verified.

## Orlando map and sample incidents

The schematic downtown map uses street and landmark names from the [City of Orlando downtown map](https://gis.orlando.gov/PDF_Docs/DowntownCRAMaps/DowntownPointsofInterest11x17.pdf). Geometry is approximate and not suitable for navigation. Help points, route scores, and routes remain illustrative.

`src/data/incidents.js` generates deterministic synthetic incidents dated relative to the current day. No police records are downloaded. Calendar filtering includes the cutoff date through the end of today; month-end cutoffs are clamped to the final valid date. The same filtered records drive dots, totals, equal-sized grid cells, and rankings. The fixed color buckets are 1–4, 5–9, 10–19, and 20+ incidents per cell. Concentrations are counts, not population-adjusted rates or safety scores. Personal reports never contribute to these counts.

Personal reports retain normalized schematic x/y coordinates and area size. Existing legacy reports still render with their old fallback positions until edited. Tests cover time boundaries, type filtering, total consistency, empty filters, and report placement/editing/deletion.
