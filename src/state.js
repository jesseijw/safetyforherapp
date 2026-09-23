export const STORAGE_KEY = "safetrip.demo.v1";
export function initialState() {
  return {
    version: 1,
    profile: { name: "Morgan", allergies: "", notes: "", emergency: "" },
    contacts: [
      {
        id: "maya",
        name: "Maya",
        phone: "202-555-0101",
        trip: true,
        sos: true,
      },
      { id: "mom", name: "Mom", phone: "202-555-0102", trip: true, sos: true },
      {
        id: "jordan",
        name: "Jordan",
        phone: "202-555-0103",
        trip: false,
        sos: true,
      },
    ],
    settings: {
      dark: false,
      checkins: true,
      arrival: true,
      notices: true,
      location: true,
      sharing: true,
    },
    pin: "",
    reports: [],
    history: [],
    active: null,
  };
}
export function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: initialState(), available: true };
    const d = JSON.parse(raw);
    if (
      d.version !== 1 ||
      !Array.isArray(d.contacts) ||
      !Array.isArray(d.history) ||
      !Array.isArray(d.reports)
    )
      throw Error();
    const base = initialState();
    return {
      data: {
        ...base,
        ...d,
        profile: { ...base.profile, ...d.profile },
        settings: { ...base.settings, ...d.settings },
        active: d.active ? { ...d.active, paused: true } : null,
      },
      available: true,
    };
  } catch {
    return { data: initialState(), available: false };
  }
}
export function advanceTrip(trip) {
  if (!trip || trip.paused) return trip;
  return { ...trip, progress: Math.min(1, trip.progress + 1 / 90) };
}
export function completeTrip(state, status = "arrived") {
  if (!state.active) return state;
  return {
    ...state,
    active: null,
    history: [
      { ...state.active, status, finished: Date.now() },
      ...state.history,
    ],
  };
}
export function validPhone(value) {
  return (
    /^[+()\d\s.-]{7,25}$/.test(value) && value.replace(/\D/g, "").length >= 7
  );
}
