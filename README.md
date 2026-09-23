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

- Search four fictional destinations, compare sample routes, and filter help points.
- Run a 90-second simulated trip with pause/resume, check-ins, message previews, arrival/cancellation, and history.
- Add, edit, and remove trusted contacts; edit the emergency card.
- Preview SOS with a tap or a 1.1-second hold. Calls and messages are never sent.
- Configure notifications, demo privacy preferences, a demo passcode, and dark mode.
- Save reports to the local demo map and reset all sample data.

Data is saved only in this browser under `safetrip.demo.v1`. Refreshed active trips resume paused. The passcode is an interaction preview, not encryption or access control. Use sample personal information. No account, live geolocation, routing API, phone/SMS integration, or production safety scoring is included.

## Structure

`src/App.jsx` owns navigation and shared state; `src/pages` contains the main screens. `src/components` contains shared UI and the schematic map. `src/state.js` handles persistence and trip transitions; `src/data/mockRoutes.js` contains sample places and geometry. All routes use URL hashes for static-host compatibility.

The original HTML stays ignored in `.local-reference/`. Its logo is extracted into `public/logo.png`. The Sites manifest declares a private static deployment from `dist`; the GitHub origin is preserved.

## Validation

Focused jsdom tests cover trip planning/completion, contact editing, dark-mode persistence, SOS gesture timing, privacy restrictions, storage recovery, and route interpolation. Dialog accessibility uses native HTML dialog behavior (focus containment, Escape, focus restoration). Browser visual QA was not performed.

An optional `stage_demo_trip` WebMCP tool stages a known destination and route through the same UI state. Its valid/invalid input contract is tested in jsdom; an actual browser WebMCP context has not been verified.
