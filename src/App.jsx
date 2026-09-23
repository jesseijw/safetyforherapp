import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Lightbulb,
  UserRound,
  Search,
  Check,
  Users,
  Flag,
  Navigation,
  X,
} from "lucide-react";
import MapCanvas from "./components/MapCanvas";
import {
  Modal,
  Field,
  TextField,
  CheckRow,
  Toggle,
  Empty,
} from "./components/UI";
import TripsPage from "./pages/TripsPage";
import TipsPage from "./pages/TipsPage";
import ProfilePage from "./pages/ProfilePage";
import SOSPage from "./pages/SOSPage";
import { destinations, routes } from "./data/mockRoutes";
import {
  STORAGE_KEY,
  initialState,
  loadState,
  advanceTrip,
  completeTrip,
} from "./state";
const pages = [
  "home",
  "routes",
  "sos",
  "tips",
  "profile",
  "contacts",
  "emergency",
  "passcode",
  "notifications",
  "privacy",
  "appearance",
  "hotlines",
];
const readPage = () =>
  pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";
export default function App() {
  const [loaded] = useState(() => {
      try {
        return loadState(localStorage);
      } catch {
        return { data: initialState(), available: false };
      }
    }),
    [data, setData] = useState(loaded.data),
    [storageOK, setStorageOK] = useState(loaded.available);
  const [page, setPage] = useState(readPage),
    [destination, setDestination] = useState("union"),
    [route, setRoute] = useState("safe"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [query, setQuery] = useState(""),
    [filters, setFilters] = useState({
      hospital: true,
      police: true,
      safe: true,
      reports: true,
    }),
    [recipients, setRecipients] = useState(() =>
      loaded.data.contacts.filter((c) => c.trip).map((c) => c.id),
    );
  const [shareRecipients, setShareRecipients] = useState([]),
    [reportType, setReportType] = useState("Poor lighting"),
    [reportText, setReportText] = useState("");
  const timer = useRef(),
    holdTimer = useRef(),
    held = useRef(false),
    suppressClick = useRef(false),
    screen = useRef();
  const notify = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(""), 4200);
  }, []);
  const go = useCallback((id) => {
    location.hash = id;
    setPage(id);
    setModal(null);
    screen.current?.scrollTo?.(0, 0);
  }, []);
  useEffect(() => {
    const fn = () => {
      setPage(readPage());
      setModal(null);
      screen.current?.scrollTo?.(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setStorageOK(false);
    }
  }, [data]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.settings.dark);
    return () => document.documentElement.classList.remove("dark");
  }, [data.settings.dark]);
  useEffect(() => {
    const t = setInterval(
      () =>
        setData((s) =>
          s.active && !s.active.paused
            ? { ...s, active: advanceTrip(s.active) }
            : s,
        ),
      1000,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (data.active?.progress >= 1) {
      setData((s) => completeTrip(s));
      setModal({ type: "arrived" });
      if (data.settings.arrival)
        notify("You’ve arrived. Your demo journey is complete.");
    } else if (
      data.active?.progress >= 0.5 &&
      !data.active.reminded &&
      data.settings.checkins
    ) {
      setData((s) => ({ ...s, active: { ...s.active, reminded: true } }));
      notify("Halfway there. Take a moment to check in.");
    }
  }, [
    data.active?.progress,
    data.settings.arrival,
    data.settings.checkins,
    notify,
  ]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(holdTimer.current);
    },
    [],
  );
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "stage_demo_trip",
            description:
              "Choose a sample destination and route, then open the trip planning screen. Does not start the trip.",
            inputSchema: {
              type: "object",
              properties: {
                destination: {
                  type: "string",
                  enum: destinations.map((d) => d.id),
                },
                route: { type: "string", enum: routes.map((r) => r.id) },
              },
              required: ["destination", "route"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute: async (input) => {
              if (
                !input ||
                !destinations.some((d) => d.id === input.destination) ||
                !routes.some((r) => r.id === input.route)
              )
                throw Error("Choose a known demo destination and route.");
              setDestination(input.destination);
              setRoute(input.route);
              go("routes");
              await new Promise((r) => requestAnimationFrame(r));
              return {
                status: "staged",
                destination: input.destination,
                route: input.route,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [go]);
  const startTrip = () => {
    setData((s) => ({
      ...s,
      active: {
        id: crypto.randomUUID(),
        destination,
        route,
        recipients: s.settings.sharing
          ? recipients.filter((id) =>
              s.contacts.some((c) => c.id === id && c.trip),
            )
          : [],
        progress: 0,
        paused: false,
        started: Date.now(),
        checkins: [],
      },
    }));
    notify("Demo trip started. No messages were sent.");
  };
  const finishTrip = () => {
    setData((s) => completeTrip(s));
    setModal({ type: "arrived" });
    if (data.settings.arrival)
      notify("Arrival update simulated. Nothing was sent.");
  };
  const openShare = (kind = "trip") => {
    setShareRecipients(
      data.contacts
        .filter((c) => (kind === "emergency" ? c.sos : c.trip))
        .map((c) => c.id),
    );
    setModal({ type: "share", kind });
  };
  const openSearch = () => {
    setQuery("");
    setModal({ type: "search" });
  };
  const startHold = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    held.current = false;
    suppressClick.current = false;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      held.current = true;
      setModal({ type: "call", name: "911" });
    }, 1100);
  };
  const endHold = () => {
    clearTimeout(holdTimer.current);
    suppressClick.current = true;
    if (!held.current) go("sos");
  };
  const cancelHold = () => {
    clearTimeout(holdTimer.current);
    held.current = false;
    suppressClick.current = true;
  };
  const navActive =
    page === "home"
      ? "home"
      : page === "routes"
        ? "routes"
        : page === "sos" || page === "hotlines"
          ? "sos"
          : page === "tips"
            ? "tips"
            : "profile";
  const selectedDest = destinations.find(
    (d) => d.id === (data.active?.destination || destination),
  );
  return (
    <div className="desktop-stage">
      <aside className="desktop-brand">
        <img src="/logo.png" alt="S.H.E." />
        <span>SAFETY FOR HER EMPOWERMENT</span>
        <h1>
          A little more
          <br />
          peace of mind.
        </h1>
        <p>
          Your people. Your route.
          <br />A safer way to get there.
        </p>
        <div className="desktop-note">
          SafeTrip <span>INTERACTIVE PREVIEW</span>
        </div>
      </aside>
      <div className="phone-shell">
        <div className="device-status">
          <b>9:41</b>
          <span>●●● ▰</span>
        </div>
        <main
          ref={screen}
          className={"screen " + (page === "home" ? "home-screen" : "")}
          key={page}
        >
          {!storageOK && (
            <div className="storage-notice" role="status">
              Browser storage unavailable. Changes last for this session only.
            </div>
          )}
          {page === "home" ? (
            <>
              <MapCanvas
                destination={data.active?.destination || destination}
                route={data.active?.route || route}
                showRoute={!!data.active}
                progress={data.active?.progress || 0}
                reports={data.reports}
                filters={filters}
                onFilters={() => setModal({ type: "filters" })}
                onReport={() => setModal({ type: "report" })}
                locateEnabled={data.settings.location}
                onPoint={(point) => setModal({ type: "point", point })}
              />
              <div className="search-float">
                <img src="/logo.png" alt="S.H.E." />
                <button className="search-trigger" onClick={openSearch}>
                  <span>Where are you going?</span>
                </button>
                <button
                  className="profile-shortcut"
                  aria-label="Open profile"
                  onClick={() => go("profile")}
                >
                  {data.profile.name.charAt(0) || "M"}
                </button>
              </div>
              {data.settings.notices && (
                <button
                  className="map-notice"
                  onClick={() => setModal({ type: "notice" })}
                >
                  <span className="notice-dot" /> A little busier around Market
                  St <span>›</span>
                </button>
              )}
              <section className="home-sheet">
                <div className="sheet-handle" />
                <div className="eyebrow">
                  {data.active
                    ? "YOUR JOURNEY IS UNDERWAY"
                    : "LET’S GET YOU THERE"}
                </div>
                <h2>
                  {data.active
                    ? "Your people. Your route."
                    : "Start a safe trip."}
                </h2>
                <p>
                  {data.active
                    ? "Pick up where you left off."
                    : "A thoughtful route. Your people close by."}
                </p>
                <button
                  className="destination-button"
                  onClick={data.active ? () => go("routes") : openSearch}
                >
                  <MapPin size={21} />
                  <span>
                    {data.active ? selectedDest.name : "Choose a destination"}
                    <small>
                      {data.active
                        ? `${Math.round(data.active.progress * 100)}% complete · simulated trip`
                        : "Compare routes and nearby help points"}
                    </small>
                  </span>
                  <ArrowUpRight size={19} />
                </button>
                <button className="primary" onClick={() => go("routes")}>
                  {data.active ? "Return to your trip" : "Explore safe routes"}{" "}
                  <ArrowUpRight size={18} />
                </button>
              </section>
            </>
          ) : page === "routes" ? (
            <TripsPage
              data={data}
              setData={setData}
              destination={destination}
              route={route}
              setRoute={setRoute}
              onSearch={openSearch}
              onBack={() => go("home")}
              onStart={startTrip}
              onFinish={finishTrip}
              onCancel={() => setModal({ type: "cancel" })}
              onShare={() => openShare("trip")}
              notify={notify}
              recipients={recipients}
              setRecipients={setRecipients}
            />
          ) : page === "tips" ? (
            <TipsPage go={go} />
          ) : page === "sos" || page === "hotlines" ? (
            <SOSPage
              go={go}
              hotlines={page === "hotlines"}
              onCall={(name) => setModal({ type: "call", name })}
              onShare={openShare}
            />
          ) : (
            <ProfilePage
              key={page}
              page={page}
              data={data}
              setData={setData}
              go={go}
              notify={notify}
              onReset={() => setModal({ type: "reset" })}
            />
          )}
        </main>
        <nav className="bottom-nav" aria-label="Main navigation">
          {[
            [MapPin, "Map", "home"],
            [ArrowUpRight, "Trips", "routes"],
            [ShieldCheck, "SOS", "sos"],
            [Lightbulb, "Tips", "tips"],
            [UserRound, "Profile", "profile"],
          ].map(([Icon, name, id]) =>
            id === "sos" ? (
              <button
                key={id}
                className="sos-tab"
                aria-label="SOS. Tap for help or hold to preview emergency call"
                aria-current={navActive === id ? "page" : undefined}
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerCancel={cancelHold}
                onLostPointerCapture={() => clearTimeout(holdTimer.current)}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  go("sos");
                }}
              >
                <Icon size={21} />
                <span>{name}</span>
              </button>
            ) : (
              <button
                key={id}
                aria-current={navActive === id ? "page" : undefined}
                className={navActive === id ? "active" : ""}
                onClick={() => go(id)}
              >
                <Icon size={21} />
                <span>{name}</span>
              </button>
            ),
          )}
        </nav>
        {toast && (
          <div className="toast" role="status">
            <Check size={17} />
            <span>{toast}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="desktop-foot">
        Made for your everyday journeys.
        <span>Demo only · No live emergency services</span>
      </div>
      {modal && (
        <Modal
          title={
            {
              search: "Where are you heading?",
              filters: "Your map, your way",
              report: "Report a concern",
              point: modal.point?.name,
              notice: "Around the neighborhood",
              call: `${modal.name === "911" ? "Call 911?" : modal.name}`,
              share: "Keep your people close",
              sent: "Preview complete",
              arrived: "You made it.",
              cancel: "End this trip?",
              reset: "Start fresh?",
            }[modal.type]
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "search" && (
            <>
              <label className="search-input">
                <Search size={18} />
                <input
                  autoFocus
                  placeholder="Search demo destinations"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <p className="caption">
                Explore our fictional demo neighborhood.
              </p>
              <div className="search-results">
                {destinations
                  .filter((d) =>
                    d.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDestination(d.id);
                        go("routes");
                      }}
                    >
                      <span className="row-icon">
                        <MapPin size={18} />
                      </span>
                      <span>
                        <b>{d.name}</b>
                        <small>{d.kind}</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                {!destinations.some((d) =>
                  d.name.toLowerCase().includes(query.toLowerCase()),
                ) && (
                  <Empty title="No places found">
                    Try “Union”, “Library”, “Café”, or “Station”.
                  </Empty>
                )}
              </div>
            </>
          )}
          {modal.type === "filters" && (
            <>
              <p className="muted">
                Choose the sample help points you’d like to see.
              </p>
              {[
                ["hospital", "Medical help"],
                ["police", "Police stations"],
                ["safe", "Community spaces"],
                ["reports", "Your reports"],
              ].map(([key, label]) => (
                <Toggle
                  key={key}
                  label={label}
                  value={filters[key]}
                  onChange={(v) => setFilters((s) => ({ ...s, [key]: v }))}
                />
              ))}
            </>
          )}
          {modal.type === "report" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setData((s) => ({
                  ...s,
                  reports: [
                    ...s.reports,
                    {
                      id: crypto.randomUUID(),
                      type: reportType,
                      description: reportText,
                      created: Date.now(),
                    },
                  ],
                }));
                setReportText("");
                setFilters((s) => ({ ...s, reports: true }));
                setModal(null);
                notify(
                  "Report saved to your demo map. Not submitted publicly.",
                );
              }}
            >
              <p className="muted">
                Add a sample concern at the demo location. Reports stay in this
                browser.
              </p>
              <label className="field">
                <span>Concern</span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option>Poor lighting</option>
                  <option>Blocked walkway</option>
                  <option>Uncomfortable encounter</option>
                  <option>Other concern</option>
                </select>
              </label>
              <TextField
                label="Details (optional)"
                maxLength={300}
                placeholder="What would you like to note?"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
              <button className="primary">Save demo report</button>
            </form>
          )}
          {modal.type === "point" && (
            <>
              <div className="point-symbol">
                <MapPin size={28} />
              </div>
              <p className="muted">{modal.point.note}</p>
              <p className="caption">
                Fictional location for this preview. Availability is not live.
              </p>
              {modal.point.created && (
                <button
                  className="text-button danger-text"
                  onClick={() => {
                    setData((s) => ({
                      ...s,
                      reports: s.reports.filter((r) => r.id !== modal.point.id),
                    }));
                    setModal(null);
                  }}
                >
                  Delete this report
                </button>
              )}
              <button className="primary" onClick={() => setModal(null)}>
                Back to map
              </button>
            </>
          )}
          {modal.type === "notice" && (
            <>
              <p className="muted">
                The demo route passes a busy stretch of Market Street with open
                businesses and nearby help points.
              </p>
              <p className="caption">
                Sample notice, not a live neighborhood report.
              </p>
              <button className="primary" onClick={() => go("routes")}>
                Compare sample routes
              </button>
            </>
          )}
          {modal.type === "call" && (
            <>
              <div className="demo-notice">No call will be placed.</div>
              <p className="muted">
                This previews the confirmation you would see before opening{" "}
                {modal.name === "911"
                  ? "an emergency call"
                  : `a call to ${modal.name}`}
                . This demo does not connect to emergency services.
              </p>
              <button
                className="primary emergency-action"
                onClick={() => {
                  setModal({
                    type: "sent",
                    message: `${modal.name} call simulated. No call was placed.`,
                  });
                }}
              >
                Simulate call
              </button>
              <button className="secondary full" onClick={() => setModal(null)}>
                Cancel
              </button>
            </>
          )}
          {modal.type === "share" && (
            <>
              <p className="muted">
                {modal.kind === "emergency"
                  ? "Prepare an emergency message for your trusted contacts."
                  : "Choose who receives this demo update."}
              </p>
              {!data.settings.sharing ? (
                <>
                  <div className="demo-notice">
                    Demo sharing is off in your privacy preferences.
                  </div>
                  <button className="primary" onClick={() => go("privacy")}>
                    Open privacy settings
                  </button>
                </>
              ) : (
                <>
                  {data.contacts.length ? (
                    <div className="share-list">
                      {data.contacts.map((c) => (
                        <CheckRow
                          key={c.id}
                          checked={shareRecipients.includes(c.id)}
                          onChange={(v) =>
                            setShareRecipients((ids) =>
                              v
                                ? [...ids, c.id]
                                : ids.filter((id) => id !== c.id),
                            )
                          }
                        >
                          <b>{c.name}</b>
                          <small>{c.phone}</small>
                        </CheckRow>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Empty title="Add someone you trust">
                        You need a contact to preview this message.
                      </Empty>
                      <button
                        className="secondary full"
                        onClick={() => go("contacts")}
                      >
                        Add a trusted contact
                      </button>
                    </>
                  )}
                  <div className="message-preview">
                    <span className="eyebrow">MESSAGE PREVIEW</span>
                    <p>
                      {modal.kind === "emergency"
                        ? "I need help. My demo location is near Riverside Avenue. Please check in with me."
                        : modal.kind === "location"
                          ? "Here’s my demo location: near Riverside Avenue, SafeTrip demo neighborhood."
                          : `I’m on my way to ${selectedDest.name}. Follow along with my SafeTrip demo journey.`}
                    </p>
                  </div>
                  <button
                    className="primary"
                    disabled={!shareRecipients.length}
                    onClick={() => {
                      if (modal.kind === "trip" && data.active)
                        setData((s) => ({
                          ...s,
                          active: { ...s.active, recipients: shareRecipients },
                        }));
                      setModal({
                        type: "sent",
                        message: `Message simulated for ${shareRecipients
                          .map(
                            (id) =>
                              data.contacts.find((c) => c.id === id)?.name,
                          )
                          .filter(Boolean)
                          .join(", ")}. Nothing was sent.`,
                      });
                    }}
                  >
                    Simulate{" "}
                    {modal.kind === "location" ? "location sharing" : "message"}
                  </button>
                </>
              )}
            </>
          )}
          {modal.type === "sent" && (
            <>
              <div className="success-icon">
                <Check size={32} />
              </div>
              <p className="muted center">{modal.message}</p>
              <button className="primary" onClick={() => setModal(null)}>
                Done
              </button>
            </>
          )}
          {modal.type === "arrived" && (
            <>
              <div className="success-icon">
                <Check size={32} />
              </div>
              <p className="muted center">
                Your demo trip is complete and saved to your recent journeys.
              </p>
              <button className="primary" onClick={() => go("routes")}>
                View recent journeys
              </button>
              <button className="text-button full" onClick={() => go("home")}>
                Back to map
              </button>
            </>
          )}
          {modal.type === "cancel" && (
            <>
              <p className="muted">
                Your trip will be saved as canceled. No notification will be
                sent.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setData((s) => completeTrip(s, "canceled"));
                  setModal(null);
                }}
              >
                End demo trip
              </button>
              <button className="secondary full" onClick={() => setModal(null)}>
                Keep going
              </button>
            </>
          )}
          {modal.type === "reset" && (
            <>
              <p className="muted">
                Clear saved trips, reports, contacts, profile information, and
                preferences from this demo. Restore the sample contacts and
                light theme.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setData(initialState());
                  setRecipients(["maya", "mom"]);
                  setDestination("union");
                  setRoute("safe");
                  setFilters({
                    hospital: true,
                    police: true,
                    safe: true,
                    reports: true,
                  });
                  go("home");
                  notify("Your demo has a fresh start.");
                }}
              >
                Reset demo data
              </button>
              <button className="secondary full" onClick={() => setModal(null)}>
                Keep my data
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
