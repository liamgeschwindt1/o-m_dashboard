// ── Org & Instructor ───────────────────────────────────────────────────────────
export const ORG = {
  name: "ClearPath Mobility",
  code: "CPM-001",
};

export const INSTRUCTOR = {
  name: "Sarah Mitchell",
  email: "sarah@clearpathmobility.org",
  initials: "SM",
};

// ── Fake VI clients ────────────────────────────────────────────────────────────
export const CLIENTS = [
  {
    id: "c-001",
    name: "Marcus Webb",
    age: 34,
    condition: "Retinitis Pigmentosa",
    routesAssigned: 3,
    lastActive: "2026-04-29",
    status: "active",
    notes: "Prefers tactile landmarks. Morning sessions only.",
    viewCounts: { "r-demo-1": 12, "r-demo-2": 5 },
  },
  {
    id: "c-002",
    name: "Diane Okafor",
    age: 52,
    condition: "Total Congenital Blindness",
    routesAssigned: 2,
    lastActive: "2026-04-27",
    status: "active",
    notes: "Uses long cane. Experienced traveller.",
    viewCounts: { "r-demo-3": 8 },
  },
  {
    id: "c-003",
    name: "Tyler Nguyen",
    age: 21,
    condition: "Glaucoma (Advanced)",
    routesAssigned: 1,
    lastActive: "2026-04-15",
    status: "active",
    notes: "Recently onboarded. Short routes preferred for now.",
    viewCounts: { "r-demo-2": 3 },
  },
  {
    id: "c-004",
    name: "Rosa Espinoza",
    age: 68,
    condition: "Macular Degeneration",
    routesAssigned: 2,
    lastActive: "2026-03-30",
    status: "inactive",
    notes: "On medical leave. Resume sessions in June.",
    viewCounts: {},
  },
  {
    id: "c-005",
    name: "James Thorn",
    age: 45,
    condition: "Diabetic Retinopathy",
    routesAssigned: 4,
    lastActive: "2026-04-30",
    status: "active",
    notes: "Highly motivated. Ready for complex routes.",
    viewCounts: { "r-demo-1": 7, "r-demo-3": 11, "r-demo-4": 4 },
  },
];

// ── Recent activity feed ───────────────────────────────────────────────────────
export const ACTIVITY = [
  { id: "a-1", type: "route_created",  text: "New route created",              detail: "Civic Center Loop",   time: "2 hours ago" },
  { id: "a-2", type: "route_shared",   text: "Route shared with client",       detail: "Marcus Webb",         time: "3 hours ago" },
  { id: "a-3", type: "route_viewed",   text: "Client viewed route",            detail: "James Thorn × 2",     time: "5 hours ago" },
  { id: "a-4", type: "client_added",   text: "New client onboarded",           detail: "Tyler Nguyen",        time: "Yesterday" },
  { id: "a-5", type: "route_shared",   text: "Route shared with client",       detail: "Diane Okafor",        time: "2 days ago" },
  { id: "a-6", type: "route_viewed",   text: "Client viewed route",            detail: "Diane Okafor × 8",    time: "2 days ago" },
];

// ── Weekly views (chart data) ─────────────────────────────────────────────────
export const WEEKLY_VIEWS = [
  { day: "Mon", views: 4 },
  { day: "Tue", views: 7 },
  { day: "Wed", views: 3 },
  { day: "Thu", views: 9 },
  { day: "Fri", views: 12 },
  { day: "Sat", views: 5 },
  { day: "Sun", views: 8 },
];
