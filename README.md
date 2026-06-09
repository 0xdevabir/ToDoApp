# FlowDo — Advanced Interactive Todo

A premium, 100% client-side todo app. **No backend, no account, no tracking** — everything lives in your browser's `localStorage` and travels with you.

Built with the latest stable stack:

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config)
- [Zustand 5](https://zustand.docs.pmnd.rs/) with `persist` middleware
- [Framer Motion](https://www.framer.com/motion/) · [dnd-kit](https://dndkit.com) · [recharts](https://recharts.org) · [lucide](https://lucide.dev) · [date-fns](https://date-fns.org) · [sonner](https://sonner.emilkowal.ski)

## Features

- **Smart views** — Today, Upcoming (30 days), Inbox, All, Completed.
- **Kanban** with drag & drop across To Do / In Progress / Done.
- **Calendar** — month grid with quick per-day task list.
- **Analytics** — activity, focus minutes, priority breakdown, list health.
- **Pomodoro** — focus / short / long phases, task linking, focus mode, daily streak.
- **Tasks** — title, description, due date, priority, status, recurrence, subtasks, tags, pomodoros planned, attachments-ready schema.
- **Lists & tags** — colored, emoji-iconed, with smart counts in the sidebar.
- **Filters** — multi-select priority, status, list, tag, due window, with full-text search and 6 sort modes.
- **Theming** — light / dark / system, 8 accent colors, density.
- **PWA** — manifest, app icon, offline service worker.
- **Keyboard-first** — `N` new task, `⌘K` command palette, `/` search, `1/2/3/4` views, `G`+letter navigation, `?` help.
- **Import / export** — JSON backup and restore.
- **Accessible** — focus rings, ARIA labels, skip link, reduced-motion media query.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> → redirects to **Today**.

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
```

## Project layout

```
app/
  layout.tsx              root layout, providers, toaster
  page.tsx                redirects to /today
  (app)/
    layout.tsx            shell: sidebar + topbar
    today/, upcoming/, inbox/, all/, completed/
    kanban/, calendar/, analytics/
    list/[id]/, tag/[id]/
    settings/
components/
  ui/                     design-system primitives (Button, Modal, Select, …)
  shell/                  Sidebar, Topbar, QuickAdd, TaskModal, Pomodoro, Help
  tasks/                  TaskRow, TaskCard, FilterBar, Kanban, Calendar, Analytics
  theme-provider.tsx
lib/
  store.ts                Zustand store (persist + partialize)
  types.ts                shared TypeScript types
  filters.ts              filter/sort helpers
  constants.ts            priority/status/accent metadata
  utils.ts                cn, uid, clamp
  hooks.ts                useDensity, etc.
  useHydrated.ts
public/
  manifest.webmanifest    PWA manifest
  sw.js                   offline service worker
  icon.svg, icon.png
```

## Data model

Tasks, lists, tags, sessions and settings are all persisted under the `flowdo:v1` localStorage key. Reset everything from **Settings → Data → Reset**, or back up via **Export**.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `N` | New task |
| `⌘K` / `Ctrl K` | Command palette |
| `/` | Focus search |
| `1` / `2` / `3` / `4` | Today / Kanban / Calendar / Analytics |
| `G` then `T` / `U` / `I` / `A` / `C` / `K` / `L` / `N` / `S` | Navigate to view |
| `?` | Show all shortcuts |
| `Space` (in Pomodoro) | Start / pause |

## License

MIT — do whatever you want, but please don't blame me if your task list becomes addictive.
