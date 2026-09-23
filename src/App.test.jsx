// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  within,
} from "@testing-library/react";
import App from "./App";
import {
  initialState,
  loadState,
  STORAGE_KEY,
  advanceTrip,
  completeTrip,
  validPhone,
} from "./state";
import { positionAt, routePoints } from "./data/mockRoutes";
beforeEach(() => {
  window.PointerEvent = MouseEvent;
  localStorage.clear();
  location.hash = "";
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.modelContext;
});
const click = (name) =>
  fireEvent.click(screen.getByRole("button", { name, exact: true }));
describe("trip state", () => {
  it("pauses a persisted trip on restore", () => {
    const s = initialState();
    s.active = { id: "t", progress: 0.3, paused: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    expect(loadState(localStorage).data.active).toMatchObject({
      progress: 0.3,
      paused: true,
    });
  });
  it("handles blocked or malformed storage", () => {
    expect(
      loadState({
        getItem() {
          throw Error();
        },
      }).available,
    ).toBe(false);
    localStorage.setItem(STORAGE_KEY, "broken");
    expect(loadState(localStorage).data.contacts).toHaveLength(3);
  });
  it("advances only running trips and records a single completion", () => {
    expect(advanceTrip({ paused: true, progress: 0.2 }).progress).toBe(0.2);
    expect(advanceTrip({ paused: false, progress: 0.999 }).progress).toBe(1);
    const s = initialState();
    s.active = { id: "t" };
    const done = completeTrip(s);
    expect(done.active).toBeNull();
    expect(completeTrip(done).history).toHaveLength(1);
  });
  it("uses complete route endpoints and validates contact numbers", () => {
    const points = routePoints("library");
    expect(positionAt(points, 0)).toEqual(points[0]);
    expect(positionAt(points, 1)).toEqual(points.at(-1));
    expect(validPhone("abc")).toBe(false);
    expect(validPhone("+1 202-555-0102")).toBe(true);
  });
});
describe("complete demo journeys", () => {
  it("searches, selects, starts and completes a trip", () => {
    render(<App />);
    click("Choose a destination Compare routes and nearby help points");
    fireEvent.change(screen.getByPlaceholderText("Search demo destinations"), {
      target: { value: "Library" },
    });
    click("Orlando Public Library Library");
    fireEvent.click(screen.getByRole("radio", { name: /Fastest route/ }));
    click("Start fastest route");
    expect(
      screen.getByRole("heading", { name: "Orlando Public Library" }),
    ).toBeTruthy();
    click("I’m okay · Check in");
    click("Finish demo trip");
    expect(screen.getByRole("dialog", { name: "You made it." })).toBeTruthy();
    click("View recent journeys");
    expect(screen.getByText(/Arrived/)).toBeTruthy();
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(s.history[0]).toMatchObject({
      destination: "library",
      route: "fast",
      status: "arrived",
    });
    expect(s.history[0].checkins).toHaveLength(1);
  });
  it("adds a contact and persists preferences", () => {
    render(<App />);
    click("Profile");
    click("Trusted contacts 3 people in your circle");
    click("Add trusted contact");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "202-555-0199" },
    });
    click("Save contact");
    expect(screen.getByText("Alex")).toBeTruthy();
    click("Go back");
    click("Appearance Light mode");
    fireEvent.click(screen.getByRole("switch", { name: /Dark mode/ }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).contacts).toHaveLength(
      4,
    );
  });
  it("handles SOS short tap, hold and canceled hold without calling", () => {
    vi.useFakeTimers();
    render(<App />);
    const sos = screen.getByRole("button", { name: /SOS. Tap/ });
    fireEvent.pointerDown(sos, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerUp(sos);
    expect(
      screen.getByRole("heading", { name: "Emergency & help" }),
    ).toBeTruthy();
    fireEvent.pointerDown(sos, { button: 0, pointerId: 1 });
    act(() => vi.advanceTimersByTime(1100));
    fireEvent.pointerUp(sos);
    expect(screen.getByRole("dialog", { name: "Call 911?" })).toBeTruthy();
    click("Cancel");
    fireEvent.pointerDown(sos, { button: 0, pointerId: 1 });
    fireEvent.pointerCancel(sos);
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("disables sharing when privacy is off", () => {
    const s = initialState();
    s.settings.sharing = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    location.hash = "sos";
    render(<App />);
    click("Text your people Prepare an emergency message");
    expect(
      screen.getByText("Demo sharing is off in your privacy preferences."),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Simulate message" }),
    ).toBeNull();
  });
  it("validates the WebMCP stage-trip contract with shared UI state", async () => {
    const registered = [];
    document.modelContext = { registerTool: (tool) => registered.push(tool) };
    render(<App />);
    expect(registered[0].name).toBe("stage_demo_trip");
    await act(async () => {
      await registered[0].execute({ destination: "station", route: "transit" });
    });
    expect(
      screen
        .getByRole("radio", { name: /Public transit/ })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.getByText("Church Street Station")).toBeTruthy();
    await expect(
      registered[0].execute({ destination: "unknown", route: "safe" }),
    ).rejects.toThrow();
  });
});

describe("personal map reports", () => {
  it("requires a location, saves an area and note, and renders it at that location", () => {
    render(<App />);
    click("Report");
    expect(
      screen.getByRole("button", { name: "Save my report" }).disabled,
    ).toBe(true);
    const picker = screen.getByRole("button", {
      name: /Choose report location/,
    });
    fireEvent.keyDown(picker, { key: "ArrowRight" });
    fireEvent.change(screen.getByLabelText("Area size"), {
      target: { value: "75" },
    });
    fireEvent.change(screen.getByLabelText("Details (optional)"), {
      target: { value: "Very dark around this corner after sunset." },
    });
    click("Save my report");
    const report = JSON.parse(localStorage.getItem(STORAGE_KEY)).reports[0];
    expect(report).toMatchObject({
      x: 205,
      y: 325,
      radius: 75,
      description: "Very dark around this corner after sunset.",
    });
    const marker = screen.getByRole("button", {
      name: "Your report: Poor lighting",
    });
    expect(marker.style.left).toBe(`${(205 / 390) * 100}%`);
    fireEvent.click(marker);
    expect(screen.getByText(report.description)).toBeTruthy();
    click("Delete this report");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).reports).toHaveLength(
      0,
    );
  });
});

describe("Orlando sample activity map", () => {
  it("filters counts, switches to incident dots, and handles no matching types", () => {
    location.hash = "activity";
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Downtown Orlando" }),
    ).toBeTruthy();
    const getCount = () =>
      Number(screen.getByRole("status").querySelector("b").textContent);
    const six = getCount();
    click("Last year");
    expect(getCount()).toBeGreaterThan(six);
    click("Last month");
    expect(getCount()).toBeLessThan(six);
    click("Incident dots");
    expect(
      screen.getAllByRole("button", {
        name: /^Sample (Theft|Burglary|Assault|Vandalism),/,
      }),
    ).toHaveLength(getCount());
    click("Incident types · 4/4");
    for (const type of ["Theft", "Burglary", "Assault", "Vandalism"])
      fireEvent.click(screen.getByRole("checkbox", { name: type }));
    click("Show results");
    expect(getCount()).toBe(0);
    expect(screen.getByText("No matching sample incidents")).toBeTruthy();
  });
  it("edits a personal area without duplicating it or affecting incident counts", () => {
    const data = initialState();
    data.reports = [
      {
        id: "r1",
        type: "Poor lighting",
        description: "Before",
        x: 100,
        y: 300,
        radius: 25,
        created: Date.now(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    location.hash = "activity";
    render(<App />);
    const before = screen.getByRole("status").textContent;
    click("Your report: Poor lighting");
    click("Edit my report");
    fireEvent.change(screen.getByLabelText("Details (optional)"), {
      target: { value: "After" },
    });
    click("Save my report");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)).reports;
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: "r1",
      description: "After",
      x: 100,
      y: 300,
    });
    expect(
      screen.getAllByRole("status").some((s) => s.textContent === before),
    ).toBe(true);
  });
});
