import React from "react";
import {
  Phone,
  MessageCircle,
  LocateFixed,
  ShieldCheck,
  HeartPulse,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { Header, Section, Row } from "../components/UI";
export default function SOSPage({ go, onCall, onShare, hotlines = false }) {
  return (
    <>
      <Header
        title={hotlines ? "Helpful numbers" : "Emergency & help"}
        onBack={() => go("home")}
      />
      <div className="content">
        <div className="demo-notice">
          <ShieldCheck size={16} />
          <span>Demo only. Calls and messages are simulated.</span>
        </div>
        {!hotlines && (
          <>
            <div className="sos-heading">
              <span className="eyebrow">HELP, CLOSE AT HAND</span>
              <h2>
                You don’t have to
                <br />
                do this alone.
              </h2>
            </div>
            <button className="emergency-button" onClick={() => onCall("911")}>
              <Phone size={27} />
              <strong>911</strong>
              <span>EMERGENCY CALL</span>
            </button>
            <p className="caption center">
              Tap to preview the call flow.
              <br />
              You can also hold SOS in the bottom bar.
            </p>
            <div className="quick-grid">
              <button onClick={() => onShare("emergency")}>
                <MessageCircle size={23} />
                <b>Text your people</b>
                <small>Prepare an emergency message</small>
              </button>
              <button onClick={() => onShare("location")}>
                <LocateFixed size={23} />
                <b>Share location</b>
                <small>Preview a location update</small>
              </button>
            </div>
          </>
        )}
        <Section title="Other ways to get help">
          {[
            [ShieldCheck, "Police non-emergency", "For non-urgent situations"],
            [HeartPulse, "Medical help line", "Care and health guidance"],
            [Building2, "Community safety", "Your local support resource"],
          ].map(([Icon, title, detail]) => (
            <Row
              key={title}
              icon={Icon}
              title={title}
              detail={detail}
              onClick={() => onCall(title)}
            />
          ))}
        </Section>
        <p className="caption">
          These are sample resources. No local phone numbers are configured.
        </p>
        <button className="secondary full" onClick={() => go("contacts")}>
          Manage trusted contacts <ArrowUpRight size={16} />
        </button>
        <button className="text-button full" onClick={() => go("tips")}>
          Everyday safety tips <ArrowUpRight size={16} />
        </button>
      </div>
    </>
  );
}
