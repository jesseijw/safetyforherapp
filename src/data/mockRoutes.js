export const destinations = [
  { id: "union", name: "Lake Eola Park", kind: "Park", x: 305, y: 270 },
  {
    id: "library",
    name: "Orlando Public Library",
    kind: "Library",
    x: 260,
    y: 320,
  },
  { id: "cafe", name: "City Hall", kind: "Civic building", x: 180, y: 500 },
  {
    id: "station",
    name: "Church Street Station",
    kind: "Transit station",
    x: 115,
    y: 370,
  },
];
export const routes = [
  {
    id: "safe",
    name: "Safest route",
    minutes: 18,
    distance: "1.4",
    score: 92,
    icon: "shield",
    note: "Well-lit streets · 2 help points",
    detail:
      "A little more peace of mind. Pass open businesses and two nearby help points.",
  },
  {
    id: "fast",
    name: "Fastest route",
    minutes: 14,
    distance: "1.1",
    score: 74,
    icon: "arrow",
    note: "Direct route · 1 sample report",
    detail: "A shorter walk through a quieter stretch of the neighborhood.",
  },
  {
    id: "transit",
    name: "Public transit",
    minutes: 23,
    distance: "1.8",
    score: 88,
    icon: "bus",
    note: "Bus + 6-minute walk",
    detail: "Walk to Church Street, then take the demo Route 12 bus.",
  },
];
export const helpPoints = [
  {
    id: "hospital",
    name: "Demo medical help point",
    type: "hospital",
    x: 100,
    y: 235,
    note: "Sample medical help point",
  },
  {
    id: "police",
    name: "Demo police help point",
    type: "police",
    x: 320,
    y: 410,
    note: "Sample police help point",
  },
  {
    id: "safe",
    name: "Demo community help point",
    type: "safe",
    x: 300,
    y: 300,
    note: "Sample staffed community space",
  },
];
export function routePoints(destination, route = "safe") {
  const d = destinations.find((x) => x.id === destination) || destinations[0];
  return route === "fast"
    ? [
        [185, 490],
        [220, 350],
        [d.x, d.y],
      ]
    : route === "transit"
      ? [
          [185, 490],
          [90, 490],
          [90, 385],
          [d.x, 385],
          [d.x, d.y],
        ]
      : [
          [185, 490],
          [185, 410],
          [300, 410],
          [300, 300],
          [d.x, d.y],
        ];
}
export function positionAt(points, progress) {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance =
    lengths.reduce((a, b) => a + b, 0) * Math.min(1, Math.max(0, progress));
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] && lengths[i] > 0) {
      const t = distance / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ];
    }
    distance -= lengths[i];
  }
  return points.at(-1);
}
