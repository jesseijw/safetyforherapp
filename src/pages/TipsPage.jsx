import React from "react";
import {
  Headphones,
  Users,
  Sun,
  Store,
  ShieldCheck,
  Battery,
  ArrowUpRight,
} from "lucide-react";
import { Header, Section } from "../components/UI";
export default function TipsPage({ go }) {
  return (
    <>
      <Header title="A little preparation" onBack={() => go("home")} />
      <div className="content">
        <div className="tips-hero">
          <span className="eyebrow">EVERYDAY CONFIDENCE</span>
          <h2>
            Feel prepared,
            <br />
            not afraid.
          </h2>
          <p>Small habits for your everyday journeys.</p>
          <Sun size={44} />
        </div>
        <Section title="When you’re on your way">
          {[
            [
              Headphones,
              "Stay aware",
              "Keep audio low enough to hear what is happening around you.",
            ],
            [
              Sun,
              "Choose active routes",
              "Look for well-lit streets, open businesses, and people nearby.",
            ],
            [
              Users,
              "Keep someone in the loop",
              "Let a trusted person know your destination and ETA.",
            ],
          ].map(([Icon, title, copy]) => (
            <div className="tip" key={title}>
              <span className="row-icon">
                <Icon size={20} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </div>
          ))}
          <button className="text-button" onClick={() => go("routes")}>
            Plan a trip <ArrowUpRight size={15} />
          </button>
        </Section>
        <Section title="If something feels wrong">
          {[
            [
              Store,
              "Move toward people",
              "Look for a staffed business or public place.",
            ],
            [
              ShieldCheck,
              "Know where to find help",
              "The SOS tab keeps your emergency resources together.",
            ],
          ].map(([Icon, title, copy]) => (
            <div className="tip" key={title}>
              <span className="row-icon">
                <Icon size={20} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </div>
          ))}
          <button className="text-button" onClick={() => go("sos")}>
            Explore emergency help <ArrowUpRight size={15} />
          </button>
        </Section>
        <Section title="Before you leave">
          <div className="tip">
            <span className="row-icon">
              <Battery size={20} />
            </span>
            <div>
              <h3>Charge your phone</h3>
              <p>
                Leave enough battery for navigation, calls, and reaching your
                people.
              </p>
            </div>
          </div>
          <button className="text-button" onClick={() => go("contacts")}>
            Set up trusted contacts <ArrowUpRight size={15} />
          </button>
        </Section>
      </div>
    </>
  );
}
