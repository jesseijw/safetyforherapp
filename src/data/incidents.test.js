import { describe, it, expect } from "vitest";
import {
  sampleIncidents,
  filterIncidents,
  concentrationCells,
  cutoffDate,
  incidentTypes,
} from "./incidents";
describe("sample incident filtering", () => {
  const now = new Date(2026, 8, 23, 10);
  it("narrows calendar periods and types together without including old or future records", () => {
    const records = [
      {
        id: "boundary",
        type: "Theft",
        occurredAt: new Date(2026, 2, 23).toISOString(),
      },
      {
        id: "old",
        type: "Theft",
        occurredAt: new Date(2026, 2, 22).toISOString(),
      },
      { id: "other", type: "Assault", occurredAt: now.toISOString() },
      {
        id: "future",
        type: "Theft",
        occurredAt: new Date(2026, 8, 24).toISOString(),
      },
    ];
    expect(
      filterIncidents(records, 6, ["Theft"], now).map((r) => r.id),
    ).toEqual(["boundary"]);
    expect(filterIncidents(records, 6, [], now)).toEqual([]);
    expect(cutoffDate(new Date(2026, 2, 31), 1).getDate()).toBe(28);
  });
  it("keeps totals consistent across concentration cells and period filters", () => {
    const records = sampleIncidents(now),
      month = filterIncidents(records, 1, incidentTypes, now),
      six = filterIncidents(records, 6, incidentTypes, now),
      year = filterIncidents(records, 12, incidentTypes, now);
    expect(month.length).toBeLessThan(six.length);
    expect(six.length).toBeLessThan(year.length);
    const cells = concentrationCells(six);
    expect(cells.reduce((n, c) => n + c.count, 0)).toBe(six.length);
    expect(cells[0].count).toBeGreaterThanOrEqual(cells.at(-1).count);
  });
});
