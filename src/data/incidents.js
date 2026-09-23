// Entirely synthetic fixtures. These are not Orlando Police Department records.
export const incidentTypes = ["Theft", "Burglary", "Assault", "Vandalism"];
export const timeRanges = [
  { id: 1, label: "Last month" },
  { id: 6, label: "Last 6 months" },
  { id: 12, label: "Last year" },
];
export function sampleIncidents(now = new Date()) {
  const anchors = [
    [155, 355],
    [260, 275],
    [130, 160],
    [240, 480],
    [330, 410],
  ];
  return Array.from({ length: 156 }, (_, i) => {
    const cluster =
      i % 11 < 5 ? 0 : i % 11 < 8 ? 1 : i % 11 < 9 ? 2 : i % 11 < 10 ? 3 : 4;
    const [x, y] = anchors[cluster];
    const date = new Date(now);
    date.setDate(date.getDate() - ((i * 37) % 400));
    date.setHours(12, 0, 0, 0);
    return {
      id: `sample-${i}`,
      type: incidentTypes[(i * 7) % 4],
      occurredAt: date.toISOString(),
      x: x + ((i * 19) % 61) - 30,
      y: y + ((i * 23) % 81) - 40,
      source: "Synthetic demo data",
    };
  });
}
export function cutoffDate(now, months) {
  const d = new Date(now);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() - months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  d.setHours(0, 0, 0, 0);
  return d;
}
export function filterIncidents(records, months, types, now = new Date()) {
  const start = cutoffDate(now, months).getTime();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return records.filter(
    (r) =>
      types.includes(r.type) &&
      new Date(r.occurredAt).getTime() >= start &&
      new Date(r.occurredAt).getTime() <= end.getTime(),
  );
}
export function concentrationCells(records) {
  const cells = new Map();
  for (const r of records) {
    const col = Math.min(3, Math.max(0, Math.floor(r.x / 97.5))),
      row = Math.min(4, Math.max(0, Math.floor(r.y / 130))),
      id = `${col}-${row}`;
    if (!cells.has(id))
      cells.set(id, {
        id,
        col,
        row,
        x: col * 97.5,
        y: row * 130,
        count: 0,
        label: `${["West", "Orange Ave", "Magnolia Ave", "East"][col]} · ${["north", "Robinson St", "Central Blvd", "South St", "south"][row]}`,
      });
    cells.get(id).count++;
  }
  return [...cells.values()].sort(
    (a, b) => b.count - a.count || a.id.localeCompare(b.id),
  );
}
