import React, { useState } from "react";
import {
  IdCard,
  LockKeyhole,
  Users,
  Bell,
  ShieldCheck,
  SunMoon,
  RotateCcw,
  Phone,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Header,
  Section,
  Row,
  Toggle,
  Field,
  TextField,
  Empty,
  Modal,
  CheckRow,
} from "../components/UI";
import { validPhone } from "../state";
export default function ProfilePage({
  page,
  data,
  setData,
  go,
  notify,
  onReset,
}) {
  const [editing, setEditing] = useState(null),
    [error, setError] = useState(""),
    [unlocked, setUnlocked] = useState(false),
    [code, setCode] = useState(""),
    [newCode, setNewCode] = useState("");
  const updateSetting = (key, value) =>
    setData((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  const saveContact = (e) => {
    e.preventDefault();
    if (!editing.name.trim() || !validPhone(editing.phone)) {
      setError("Enter a name and a phone number with at least 7 digits.");
      return;
    }
    setData((s) => ({
      ...s,
      contacts: editing.id
        ? s.contacts.map((c) =>
            c.id === editing.id ? { ...editing, name: editing.name.trim() } : c,
          )
        : [
            ...s.contacts,
            { ...editing, id: crypto.randomUUID(), name: editing.name.trim() },
          ],
    }));
    setEditing(null);
    notify("Trusted contact saved on this browser.");
  };
  let body,
    title = "My safety profile";
  if (page === "contacts") {
    title = "Trusted contacts";
    body = (
      <>
        <div className="intro">
          <h2>
            Your people,
            <br />
            one tap away.
          </h2>
          <p>Choose who’s part of your safety circle.</p>
        </div>
        {data.contacts.length ? (
          <div className="card">
            {data.contacts.map((c) => (
              <div className="contact-row" key={c.id}>
                <div className="avatar">{c.name.charAt(0)}</div>
                <div className="row-copy">
                  <b>{c.name}</b>
                  <small>{c.phone}</small>
                  <small>
                    {[c.trip && "Trip updates", c.sos && "SOS"]
                      .filter(Boolean)
                      .join(" + ") || "No alerts selected"}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={"Edit " + c.name}
                  onClick={() => {
                    setEditing({ ...c });
                    setError("");
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-button danger-text"
                  aria-label={"Remove " + c.name}
                  onClick={() => setEditing({ remove: c })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Make room for your people">
            Add a trusted contact to preview sharing and SOS messages.
          </Empty>
        )}
        <button
          className="primary"
          onClick={() => {
            setEditing({ name: "", phone: "", trip: true, sos: true });
            setError("");
          }}
        >
          <Plus size={18} /> Add trusted contact
        </button>
        <p className="caption">
          Demo contacts only. Nothing is sent to these numbers.
        </p>
        {editing &&
          (editing.remove ? (
            <Modal title="Remove contact?" onClose={() => setEditing(null)}>
              <p className="muted">
                Remove {editing.remove.name} from your trusted contacts and
                active trip recipients?
              </p>
              <button
                className="primary"
                onClick={() => {
                  const id = editing.remove.id;
                  setData((s) => ({
                    ...s,
                    contacts: s.contacts.filter((c) => c.id !== id),
                    active: s.active
                      ? {
                          ...s.active,
                          recipients: s.active.recipients.filter(
                            (x) => x !== id,
                          ),
                        }
                      : null,
                  }));
                  setEditing(null);
                }}
              >
                Remove contact
              </button>
            </Modal>
          ) : (
            <Modal
              title={editing.id ? "Edit contact" : "Add trusted contact"}
              onClose={() => setEditing(null)}
            >
              <form onSubmit={saveContact}>
                <Field
                  label="Name"
                  required
                  maxLength={60}
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <Field
                  label="Phone number"
                  type="tel"
                  required
                  value={editing.phone}
                  onChange={(e) =>
                    setEditing({ ...editing, phone: e.target.value })
                  }
                />
                <CheckRow
                  checked={editing.trip}
                  onChange={(v) => setEditing({ ...editing, trip: v })}
                >
                  Trip updates
                </CheckRow>
                <CheckRow
                  checked={editing.sos}
                  onChange={(v) => setEditing({ ...editing, sos: v })}
                >
                  SOS messages
                </CheckRow>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button className="primary" type="submit">
                  Save contact
                </button>
              </form>
            </Modal>
          ))}
      </>
    );
  } else if (page === "emergency") {
    title = "Emergency card";
    body = (
      <>
        <p className="muted">
          A place for the details you would want close at hand. Use sample
          information in this demo.
        </p>
        {data.pin && !unlocked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code === data.pin) {
                setUnlocked(true);
                setError("");
              } else setError("That passcode doesn’t match.");
            }}
          >
            <Field
              label="Demo passcode"
              type="password"
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="primary">Unlock editing</button>
            <button
              type="button"
              className="text-button full"
              onClick={() => go("passcode")}
            >
              Manage or reset demo passcode
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setData((s) => ({
                ...s,
                profile: {
                  name: f.get("name").trim(),
                  allergies: f.get("allergies"),
                  notes: f.get("notes"),
                  emergency: f.get("emergency"),
                },
              }));
              notify("Emergency card saved on this browser.");
              go("profile");
            }}
          >
            <Field
              label="Your name"
              name="name"
              required
              maxLength={60}
              defaultValue={data.profile.name}
            />
            <Field
              label="Allergies"
              name="allergies"
              maxLength={200}
              placeholder="e.g. None known"
              defaultValue={data.profile.allergies}
            />
            <TextField
              label="Medical notes"
              name="notes"
              maxLength={500}
              defaultValue={data.profile.notes}
            />
            <TextField
              label="Emergency details"
              name="emergency"
              maxLength={500}
              defaultValue={data.profile.emergency}
            />
            <button className="primary">Save emergency card</button>
          </form>
        )}
        <p className="caption">
          Stored in this browser, without encryption. Demo passcode is an
          interaction preview, not a security feature.
        </p>
      </>
    );
  } else if (page === "passcode") {
    title = "Demo passcode";
    body = (
      <>
        <div className="demo-notice">
          This previews an editing lock. It does not secure or encrypt your
          information.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (data.pin && code !== data.pin) {
              setError("Current passcode doesn’t match.");
              return;
            }
            if (!/^\d{4}$/.test(newCode)) {
              setError("Use exactly 4 digits.");
              return;
            }
            setData((s) => ({ ...s, pin: newCode }));
            setCode("");
            setNewCode("");
            setError("");
            notify("Demo passcode saved.");
            go("profile");
          }}
        >
          {data.pin && (
            <Field
              label="Current passcode"
              type="password"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          )}
          <Field
            label={data.pin ? "New 4-digit passcode" : "Set a 4-digit passcode"}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary">
            {data.pin ? "Change passcode" : "Set passcode"}
          </button>
        </form>
        {data.pin && (
          <button
            className="text-button full danger-text"
            onClick={() => setEditing({ resetPin: true })}
          >
            Forgot code? Reset demo lock
          </button>
        )}
        {editing?.resetPin && (
          <Modal title="Reset demo lock?" onClose={() => setEditing(null)}>
            <p className="muted">
              Remove the demo passcode. Your sample emergency card will remain
              saved.
            </p>
            <button
              className="primary"
              onClick={() => {
                setData((s) => ({ ...s, pin: "" }));
                setEditing(null);
                notify("Demo lock removed.");
              }}
            >
              Reset demo lock
            </button>
          </Modal>
        )}
      </>
    );
  } else if (page === "notifications") {
    title = "Notification preferences";
    body = (
      <>
        <p className="muted">
          Choose which simulated updates appear during a demo trip.
        </p>
        <Section title="Trip updates">
          <Toggle
            label="Check-in reminders"
            detail="A reminder halfway through a demo trip"
            value={data.settings.checkins}
            onChange={(v) => updateSetting("checkins", v)}
          />
          <Toggle
            label="Arrival updates"
            detail="Show an arrival message when you finish"
            value={data.settings.arrival}
            onChange={(v) => updateSetting("arrival", v)}
          />
          <Toggle
            label="Safety notices"
            detail="Show sample neighborhood notices on the map"
            value={data.settings.notices}
            onChange={(v) => updateSetting("notices", v)}
          />
        </Section>
        <p className="caption">
          No device or push notifications are requested.
        </p>
      </>
    );
  } else if (page === "privacy") {
    title = "Privacy & permissions";
    body = (
      <>
        <div className="demo-notice">
          Your demo data stays in this browser. Live location and address book
          access are never requested.
        </div>
        <Section title="Your preferences">
          <Toggle
            label="Demo location controls"
            detail="Allow recentering on the sample location"
            value={data.settings.location}
            onChange={(v) => updateSetting("location", v)}
          />
          <Toggle
            label="Demo sharing"
            detail="Enable message and trip sharing previews"
            value={data.settings.sharing}
            onChange={(v) => {
              setData((s) => ({
                ...s,
                settings: { ...s.settings, sharing: v },
                active:
                  !v && s.active ? { ...s.active, recipients: [] } : s.active,
              }));
            }}
          />
        </Section>
        <Section title="Your information">
          <Row
            icon={RotateCcw}
            title="Reset all demo data"
            detail="Clear this browser’s data and restore samples"
            onClick={onReset}
            danger
          />
        </Section>
      </>
    );
  } else if (page === "appearance") {
    title = "Appearance";
    body = (
      <>
        <div className="appearance-preview">
          <SunMoon size={35} />
          <h2>A softer view.</h2>
          <p>Make SafeTrip feel comfortable for you.</p>
        </div>
        <Section title="Display">
          <Toggle
            label="Dark mode"
            detail="Use a darker palette throughout the app"
            value={data.settings.dark}
            onChange={(v) => updateSetting("dark", v)}
          />
        </Section>
      </>
    );
  } else {
    body = (
      <>
        <div className="profile-hero">
          <div className="avatar large">
            {data.profile.name.charAt(0) || "M"}
          </div>
          <h2>{data.profile.name}</h2>
          <p>Your safety circle starts with you.</p>
          <span className="local-badge">
            <ShieldCheck size={12} /> SAVED ON THIS BROWSER
          </span>
        </div>
        <Section title="Just in case">
          <Row
            icon={IdCard}
            title="Emergency card"
            detail="Your important details, together"
            onClick={() => go("emergency")}
          />
          <Row
            icon={LockKeyhole}
            title="Lock emergency info"
            detail={
              data.pin ? "Demo passcode is set" : "Set up a demo passcode"
            }
            onClick={() => go("passcode")}
          />
        </Section>
        <Section title="Your people & preferences">
          <Row
            icon={Users}
            title="Trusted contacts"
            detail={`${data.contacts.length} people in your circle`}
            onClick={() => go("contacts")}
          />
          <Row
            icon={Bell}
            title="Notifications"
            detail="Check-ins and arrival updates"
            onClick={() => go("notifications")}
          />
          <Row
            icon={Phone}
            title="Helpful numbers"
            detail="Explore sample support resources"
            onClick={() => go("hotlines")}
          />
        </Section>
        <Section title="Make it yours">
          <Row
            icon={ShieldCheck}
            title="Privacy & permissions"
            onClick={() => go("privacy")}
          />
          <Row
            icon={SunMoon}
            title="Appearance"
            detail={data.settings.dark ? "Dark mode" : "Light mode"}
            onClick={() => go("appearance")}
          />
          <Row icon={RotateCcw} title="Reset demo" onClick={onReset} />
        </Section>
        <p className="caption center">
          SafeTrip · A little more peace of mind.
          <br />
          Interactive preview · v1.0
        </p>
      </>
    );
  }
  return (
    <>
      <Header
        title={title}
        onBack={() => go(page === "profile" ? "home" : "profile")}
      />
      <div className="content">{body}</div>
    </>
  );
}
