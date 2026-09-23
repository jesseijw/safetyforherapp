import React from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  Bus,
  MapPin,
  Clock,
  Check,
  Pause,
  Play,
  Users,
  ChevronRight,
} from "lucide-react";
import { Header, Empty, CheckRow } from "../components/UI";
import MapCanvas from "../components/MapCanvas";
import { destinations, routes } from "../data/mockRoutes";
export default function TripsPage({
  data,
  setData,
  destination,
  route,
  setRoute,
  onSearch,
  onBack,
  onStart,
  onFinish,
  onCancel,
  onShare,
  notify,
  recipients,
  setRecipients,
}) {
  const d = destinations.find((x) => x.id === destination) || destinations[0],
    r = routes.find((x) => x.id === route) || routes[0],
    a = data.active;
  if (a) {
    const ar = routes.find((x) => x.id === a.route),
      ad = destinations.find((x) => x.id === a.destination);
    return (
      <>
        <Header title="Your safe trip" onBack={onBack} />
        <div className="content">
          <div className="trip-live-heading">
            <span className="eyebrow">
              {a.paused ? "TRIP PAUSED" : "ON YOUR WAY"}
            </span>
            <span className="demo-pill">Simulation</span>
          </div>
          <h2 className="page-heading">{ad.name}</h2>
          <p className="muted">One step closer to where you want to be.</p>
          <div className="trip-map">
            <MapCanvas
              compact
              showRoute
              destination={a.destination}
              route={a.route}
              progress={a.progress}
            />
          </div>
          <div className="eta-card">
            <div>
              <strong>
                {Math.ceil(ar.minutes * (1 - a.progress))}
                <small> min</small>
              </strong>
              <span>remaining · simulated</span>
            </div>
            <span className="score">
              <ShieldCheck size={14} /> {ar.score}
            </span>
          </div>
          <div className="progress-track">
            <div style={{ width: a.progress * 100 + "%" }} />
          </div>
          <div className="between muted small">
            <span>{Math.round(a.progress * 100)}% of the way</span>
            <span>{ar.distance} mi total</span>
          </div>
          <div className="inline-note">
            <Users size={17} />
            <span>
              {a.recipients.length
                ? `Demo updates for ${a.recipients.length} trusted contact${a.recipients.length > 1 ? "s" : ""}`
                : "No contacts selected for this trip"}
            </span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setData((s) => ({
                ...s,
                active: {
                  ...s.active,
                  checkins: [...(s.active.checkins || []), Date.now()],
                },
              }));
              notify("Check-in saved. No message was sent.");
            }}
          >
            <Check size={18} /> I’m okay · Check in
          </button>
          {a.checkins?.length > 0 && (
            <p className="small muted center">
              Last check-in{" "}
              {new Date(a.checkins.at(-1)).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
          <div className="button-pair">
            <button
              className="secondary"
              onClick={() =>
                setData((s) => ({
                  ...s,
                  active: { ...s.active, paused: !s.active.paused },
                }))
              }
            >
              {a.paused ? <Play size={16} /> : <Pause size={16} />}{" "}
              {a.paused ? "Resume" : "Pause"}
            </button>
            <button className="secondary" onClick={onShare}>
              <Users size={16} /> Share trip
            </button>
          </div>
          <button className="secondary full" onClick={onFinish}>
            Finish demo trip <ArrowUpRight size={16} />
          </button>
          <button className="text-button danger-text full" onClick={onCancel}>
            Cancel trip
          </button>
          <p className="caption center">
            This journey runs in 90 seconds. No live navigation or messages.
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <Header title="Plan your trip" onBack={onBack} />
      <div className="content">
        <div className="route-addresses">
          <div>
            <span className="origin-dot" />
            Demo current location
          </div>
          <button onClick={onSearch}>
            <MapPin size={16} />
            <b>{d.name}</b>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="trip-map">
          <MapCanvas
            compact
            showRoute
            destination={destination}
            route={route}
          />
        </div>
        <div className="between">
          <h2 className="section-title">A route that feels right</h2>
          <span className="demo-pill">Sample routes</span>
        </div>
        <div
          className="route-options"
          role="radiogroup"
          aria-label="Choose a route"
        >
          {routes.map((item) => {
            const Icon =
              item.id === "safe"
                ? ShieldCheck
                : item.id === "transit"
                  ? Bus
                  : ArrowUpRight;
            return (
              <button
                key={item.id}
                role="radio"
                aria-checked={route === item.id}
                className={
                  "route-card " + (route === item.id ? "selected" : "")
                }
                onClick={() => setRoute(item.id)}
              >
                <span className="route-symbol">
                  <Icon size={20} />
                </span>
                <span className="route-copy">
                  <b>{item.name}</b>
                  <small>{item.note}</small>
                  <span className="score-mini">
                    Sample safety score {item.score}
                  </span>
                </span>
                <span className="route-time">
                  <b>
                    {item.minutes}
                    <small> min</small>
                  </b>
                  <small>{item.distance} mi</small>
                </span>
                {route === item.id && (
                  <span className="selected-tick">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="caption">
          Scores illustrate the design. They do not measure actual safety.
        </p>
        <div className="section">
          <h2 className="section-title">Keep your people close</h2>
          <div className="card">
            {data.contacts.filter((c) => c.trip).length ? (
              data.contacts
                .filter((c) => c.trip)
                .map((c) => (
                  <CheckRow
                    key={c.id}
                    checked={recipients.includes(c.id)}
                    onChange={(v) =>
                      setRecipients((ids) =>
                        v ? [...ids, c.id] : ids.filter((id) => id !== c.id),
                      )
                    }
                  >
                    <b>{c.name}</b>
                    <small>Demo trip updates</small>
                  </CheckRow>
                ))
            ) : (
              <p className="muted small">
                No trip contacts yet. You can still start a trip.
              </p>
            )}
          </div>
          {!data.settings.sharing && (
            <p className="caption">
              Sharing is off in Privacy. This trip will not have recipients.
            </p>
          )}
        </div>
        <button className="primary" onClick={onStart}>
          Start {r.name.toLowerCase()} <ArrowUpRight size={18} />
        </button>
        <div className="section">
          <h2 className="section-title">Recent journeys</h2>
          {data.history.length ? (
            <div className="card">
              {data.history.map((t) => (
                <div className="history-row" key={t.id}>
                  <span className="row-icon">
                    {t.status === "arrived" ? (
                      <Check size={17} />
                    ) : (
                      <Clock size={17} />
                    )}
                  </span>
                  <span>
                    <b>
                      {destinations.find((x) => x.id === t.destination)?.name}
                    </b>
                    <small>
                      {new Date(t.finished).toLocaleDateString()} ·{" "}
                      {t.status === "arrived" ? "Arrived" : "Canceled"}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Your next journey starts here">
              Completed and canceled trips will appear here.
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
