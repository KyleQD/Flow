# Admin Dashboard Enhancement Implementation

> Mission: Deliver a calendar‑centric, task‑first, high‑performance admin dashboard that scales to large teams and complex operations.

---

## Refined Dashboard Plan (v2)

### Layout (above the fold)
- Center: Calendar window (month/week/day, Today, inline create)
- Left: Upcoming Tasks (Overdue / Today / Week buckets, bulk actions)
- Right: Group Messages snapshot (unread counts, Open, Broadcast)
- Row 2: Quick Access windows (Tours, Events, Artists, Venues, Ticketing, Logistics, Teams, Analytics)
- Row 3: KPIs (Revenue, Team load, Upcoming events, Tickets sold)

### Interaction model
- Command palette (⌘K): global search + create
- Keyboard: ←/→ date nav, M/W/D view, A assign, S status, Esc close
- Bulk actions: sticky bulk bar on selection
- Drawers for create/edit; optimistic updates

### Design essentials (harmonized)
- Single window shell `WindowCard` with icon chip, title, actions
- Dark surface gradient; soft card with 1px subtle border; rounded‑2xl
- Status/priorities via badges; left priority bars for tasks
- Calendar color keys: Events=blue, Tours=violet, Logistics=cyan, Tasks=amber
- Minimal motion (≤200ms), no continuous loops; respect reduced motion
- A11y: ARIA roles, focus rings, keyboard access across calendar/lists

---

## Component Contracts (APIs)

### Calendar (DashboardCalendar)
Props:
- `tours: Tour[]`
- `events: Event[]`
- `tasks: Task[]`
- `onItemClick?(item)`
- `onAddItem?(type)`

Emits:
- `create(type, dateRange)` → opens drawer
- `navigate(view, date)` → sync URL state (`nuqs`)

### Tasks window
- Input: `Task[]` with `{ id, title, priority, dueAt, assignee, progress, status }`
- Bulk handlers: `onAssign`, `onStatus`, `onShiftDates`

### Group messages snapshot
- Input: `Thread[]` with `{ id, groupName, lastMessage, unreadCount }`
- Actions: `onOpen(threadId)`, `onBroadcast(preset)`

### Quick access card
- Input: `{ title, href, icon, metric, sub }`
- Prefetch on hover; actions: Open, Manage, Create

---

## Data Sources & Endpoints (to wire)

- Calendar
  - GET `/api/admin/calendar?startDate&endDate` → `{ events: [...], tours: [...], tasks: [...] }`
- Tasks
  - GET `/api/admin/tasks?range=today|week|all`
  - PATCH `/api/admin/tasks/bulk` → assign/status/date‑shift
- Messages
  - GET `/api/admin/messages/threads?scope=groups`
  - POST `/api/admin/messages/broadcast` (with recipient presets)
- Metrics
  - GET `/api/admin/dashboard/stats` → KPIs, counts for quick access

Realtime (Supabase Channels)
- `ticket_sales`, `events`, `tours`, `staff_profiles`, `messages`
- Debounce UI updates 300–1000ms; label “Updated just now”

---

## Performance Budgets
- TTFMP (first meaningful paint): < 2s on mid‑tier hardware
- Interactions: < 100ms; list scroll 60fps; calendar nav < 150ms
- Hydrated JS on dashboard route: ≤ 100KB
- No continuous animations; transform‑only hovers

---

## Acceptance Criteria
- Above‑the‑fold provides: next 5 events, today’s tasks, unread group threads
- Calendar supports month/week/day, Today, inline create to drawer
- Tasks: bucketed view (Overdue/Today/Week), bulk actions, progress bars
- Messages: unread badges, Open and Broadcast CTAs, templates exposed
- Quick Access windows show key metric and 3 shortcuts (Open/Manage/Create)
- KPIs show deltas (trend arrows) and last updated labels
- All windows have loading skeletons, empty states with CTAs, and error with retry
- A11y: keyboard navigation and visible focus work across all interactive regions

---

## Phase 2 – Data Wiring & Realtime (Current)

Checklist
- [ ] URL state with `nuqs` for calendar `view` and `date`
- [ ] Server actions/routes for calendar aggregate (events/tours/tasks)
- [ ] Wire `DashboardCalendar` to server data with Suspense and skeletons
- [ ] Wire Tasks window to `/api/admin/tasks`; add bulk actions (assign/status/shift)
- [ ] Wire Group Messages snapshot to threads endpoint; add Broadcast drawer
- [ ] Wire Quick Access metrics to `/api/admin/dashboard/stats`
- [ ] Realtime subscriptions: tickets/events/tours/messages; debounce updates
- [ ] Standardized loading/empty/error states for all windows
- [ ] Prefetch frequent destinations; optimistic updates in drawers

Deliverables
- Functional calendar center, task left, messages right – all live data
- Quick Access metrics driven by API
- Realtime signals reflected in windows with “updated at” labels

---

## Phase 3 – Command Palette & Bulk Ops

- [ ] ⌘K palette: search, recent, create (event, task, broadcast)
- [ ] Bulk select in Tasks/Events with sticky bulk bar
- [ ] Keyboard shortcuts: M/W/D, ←/→, A, S, Esc

---

## Phase 4 – Personalization & Saved Views

- [ ] Role‑based default window order (admin/manager/coordinator)
- [ ] Draggable window order; persist in user prefs
- [ ] Density toggle (comfortable/compact)
- [ ] Saved filters/ranges per user

---

## Phase 5 – Analytics & Alerts

- [ ] KPI deltas (trend, period compare)
- [ ] Alerts strip with severity, snooze, assign owner

---

## Team Notes
- Coding standards: functional React/TS, named exports, RSC first, minimal client hydration
- Error handling: return-value modeling for expected outcomes; error boundaries for unexpected
- Security: RLS/RBAC; audit metadata (who/when) for mutations

---

## Today’s Implementation Targets
- [ ] Calendar API route scaffold with stubbed data
- [ ] Tasks GET + bulk PATCH stubs
- [ ] Messages threads GET + broadcast POST stubs
- [ ] Wire dashboard windows to stubs with Suspense + skeletons

Owner: TBD  |  Last Updated: [fill on commit] 