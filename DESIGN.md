# NexFlow – Design System (DESIGN.md)

**Source:** Stitch screen designs (4 screens analyzed)
**Stack:** Tailwind CSS + Shadcn UI + Radix UI Primitives

---

## 1. Brand & Identity

| Property | Value |
|---|---|
| App Name | NexFlow |
| Tagline | Enterprise SaaS |
| Primary Brand Color | Indigo / Blue (`#4F46E5` / `indigo-600`) |
| Logo | "N" icon mark in indigo, "NexFlow" wordmark |

---

## 2. Color Palette

### Background Colors
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| Sidebar BG | `bg-slate-900` | `#0F172A` | Left navigation panel |
| Page BG | `bg-slate-50` / `bg-white` | `#F8FAFC` | Main content area |
| Card BG | `bg-white` | `#FFFFFF` | Stat cards, tables |
| Table Row Hover | `hover:bg-slate-50` | `#F8FAFC` | Table row hover |

### Brand / Interactive Colors
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| Primary Button | `bg-indigo-600` | `#4F46E5` | CTA buttons (Assign Employee, Save) |
| Primary Hover | `hover:bg-indigo-700` | `#4338CA` | Hover state for primary buttons |
| Link / Accent | `text-indigo-600` | `#4F46E5` | Clickable project names, interactive text |
| Active Nav Item | `bg-indigo-600` | `#4F46E5` | Selected sidebar nav item |

### Status Badge Colors
| Status | Background | Text | Tailwind Classes |
|---|---|---|---|
| Active | Blue-50 | Blue-700 | `bg-blue-50 text-blue-700` |
| Upcoming | Orange-50 | Orange-700 | `bg-orange-50 text-orange-700` |
| Completed / Ended | Slate-100 | Slate-600 | `bg-slate-100 text-slate-600` |
| Bench | Yellow-50 | Yellow-700 | `bg-yellow-50 text-yellow-700` |

### Semantic Colors
| Token | Tailwind | Hex | Usage |
|---|---|---|---|
| Success | `text-green-600` | `#16A34A` | Positive deltas (+2 employees) |
| Warning | `text-orange-500` | `#F97316` | Upcoming end dates, warnings |
| Error | `text-red-600` | `#DC2626` | Error messages, validation |
| Muted | `text-slate-400` | `#94A3B8` | Subtext, labels, helper text |

### Allocation Progress Bar Colors
| Range | Color | Tailwind |
|---|---|---|
| 0–50% | Blue | `bg-blue-500` |
| 51–80% | Indigo | `bg-indigo-500` |
| 81–100% | Blue (full) | `bg-blue-600` |

---

## 3. Typography

| Role | Font | Weight | Size | Tailwind |
|---|---|---|---|---|
| App Title / Page H1 | Inter | 700 Bold | 24px | `text-2xl font-bold` |
| Section Heading | Inter | 600 Semibold | 18px | `text-lg font-semibold` |
| Stat Card Value | Inter | 700 Bold | 32px | `text-3xl font-bold` |
| Table Header | Inter | 500 Medium | 12px | `text-xs font-medium uppercase tracking-wider` |
| Table Cell | Inter | 400 Regular | 14px | `text-sm` |
| Label / Caption | Inter | 400 Regular | 12px | `text-xs text-slate-500` |
| Sidebar Nav Item | Inter | 500 Medium | 14px | `text-sm font-medium` |

> Import from Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`

---

## 4. Spacing & Layout

### App Layout
```
┌───────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content (flex-1)      │
│  bg-slate-900           │  bg-slate-50 / bg-white     │
│                         │  ┌─────────────────────┐    │
│  [Logo]                 │  │ Page Header          │    │
│  [Nav Items]            │  ├─────────────────────┤    │
│                         │  │ Content Area         │    │
│  [Notifications]        │  │ (padding: 24px)      │    │
│  [Settings]             │  └─────────────────────┘    │
│  [User Avatar]          │                             │
└───────────────────────────────────────────────────────┘
```

| Zone | Tailwind | Value |
|---|---|---|
| Sidebar Width | `w-60` | 240px |
| Page Content Padding | `p-6` | 24px |
| Card Padding | `p-4` or `p-6` | 16–24px |
| Table Cell Padding | `px-4 py-3` | H:16px V:12px |
| Gap between stat cards | `gap-4` | 16px |
| Border Radius (Cards) | `rounded-lg` | 8px |
| Border Radius (Buttons) | `rounded-md` | 6px |
| Border Radius (Badges) | `rounded-full` | full |

---

## 5. Component Specifications

### 5.1 Sidebar Navigation
```
bg-slate-900, w-60, h-screen, fixed left
├── Logo area: py-4 px-4, NexFlow logo
├── Nav items: flex col, gap-1, px-2
│   └── Nav Item: py-2 px-3, rounded-md, text-slate-300
│       └── Active: bg-indigo-600, text-white
│       └── Icon (Lucide): w-4 h-4, mr-3
└── Bottom: user profile, notifications, settings
```

### 5.2 Stat Cards (Dashboard & Project Details)
```
bg-white, rounded-lg, border border-slate-200, p-6
├── Label: text-xs font-medium text-slate-500 uppercase
├── Value: text-3xl font-bold text-slate-900 mt-1
└── Delta badge: text-xs text-green-600/orange-500
```

### 5.3 Data Table
```
bg-white, rounded-lg, border border-slate-200, overflow-hidden
├── Table Header: bg-slate-50, text-xs font-medium uppercase text-slate-500
├── Table Row: border-t border-slate-100, hover:bg-slate-50
└── Table Cell: px-4 py-3, text-sm text-slate-700
```

### 5.4 Allocation Progress Bar
```
Container: w-full bg-slate-100 rounded-full h-1.5 (or h-2)
Fill: bg-blue-500 / bg-indigo-500, h-full rounded-full
Width: dynamic via style={{ width: `${percentage}%` }}
Label: text-xs text-slate-600 ml-2 (shows "XX%")
```

### 5.5 Status Badge
```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
Active:    bg-blue-50   text-blue-700
Upcoming:  bg-orange-50 text-orange-700
Completed: bg-slate-100 text-slate-600
Bench:     bg-yellow-50 text-yellow-700
```

### 5.6 Primary Button
```
bg-indigo-600 hover:bg-indigo-700 text-white
px-4 py-2 rounded-md text-sm font-medium
flex items-center gap-2 (for icon + label)
```

### 5.7 Secondary / Ghost Button
```
border border-slate-200 bg-white hover:bg-slate-50 text-slate-700
px-4 py-2 rounded-md text-sm font-medium
```

### 5.8 Inline Action Buttons (Edit / Remove in Table)
```
text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3
text-red-500 hover:text-red-700 text-sm font-medium (Remove)
```

### 5.9 Modal (Assign Employee)
```
Overlay: bg-black/50 fixed inset-0 z-50
Dialog: bg-white rounded-xl shadow-xl max-w-md w-full mx-auto mt-20 p-6
├── Title: text-lg font-semibold text-slate-900
├── Subtitle: text-sm text-slate-500 mt-1
└── Form: mt-4, space-y-4
    ├── Label: text-sm font-medium text-slate-700 mb-1
    ├── Input: border border-slate-200 rounded-md px-3 py-2 w-full text-sm
    ├── Hint: text-xs text-slate-400 mt-1
    └── Actions: flex justify-end gap-3 mt-6
```

### 5.10 Search Input
```
relative, flex items-center
Input: pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm w-full
Search icon: absolute left-3, text-slate-400, w-4 h-4
```

### 5.11 Avatar (Employee)
```
w-8 h-8 rounded-full bg-indigo-100 text-indigo-600
flex items-center justify-center text-xs font-medium
(Initials from first + last name)
Below/beside: employee name (text-sm font-medium) + email (text-xs text-slate-400)
```

---

## 6. Page-Specific Layout Notes

### Dashboard Page
```
Header: flex justify-between items-center mb-6
  ├── "Manager Allocation Dashboard" (h1, font-bold text-2xl)
  └── Right: Search input + "Export Report" button (secondary)

Stat Cards: grid grid-cols-3 gap-4 mb-6

"My Allocations" Section:
  Header: flex justify-between items-center mb-4
    ├── "My Allocations" (text-lg font-semibold)
    └── "Filter by Status" dropdown
  Table: full width
  Footer: flex justify-between items-center mt-4 (count text + Previous/Next buttons)
```

### Managed Projects Page
```
Header: flex justify-between items-center mb-6
  ├── "Managed Projects" (h1)
  └── "+ New Project" button (primary, indigo)

Filter Bar: flex gap-3 mb-4
  ├── Search input (flex-1)
  ├── "Account: All" dropdown
  └── "Status: All" dropdown

Table: standard DataTable
Footer: "SHOWING X OF Y PROJECTS" + pagination arrows
```

### Project Details Page
```
Breadcrumb: "← Back to Managed Projects" (text-sm text-indigo-600 link)
Header: flex justify-between items-center mb-2
  ├── Project Name (text-2xl font-bold)
  └── "Project Settings" button (icon + label, ghost)
Subheader: Account Name · Priority badge (mb-6)

Stat Cards: grid grid-cols-3 gap-4 mb-6

Resource Allocations Section:
  Header: flex justify-between items-center mb-4
    ├── "Resource Allocations" (text-lg font-semibold)
    └── "Assign Employee" button (primary, indigo, left icon)
  Table: standard DataTable
```

---

## 7. Iconography

Use **Lucide React** for all icons:
| Icon | Component | Usage |
|---|---|---|
| Grid/layout | `LayoutDashboard` | Dashboard nav |
| Briefcase | `Briefcase` | Managed Projects nav |
| Layers | `Layers` | Allocations nav |
| Users | `Users` | Resources nav |
| Bell | `Bell` | Notifications |
| Settings | `Settings` | Settings |
| Plus | `Plus` | "+ New" buttons |
| Eye | `Eye` | View row action |
| Pencil | `Pencil` | Edit row action |
| Trash2 | `Trash2` | Remove row action |
| Search | `Search` | Search inputs |
| Download | `Download` | Export Report |
| ChevronLeft | `ChevronLeft` | Back link, pagination |
| ChevronRight | `ChevronRight` | Pagination |
| User | `User` | Avatar fallback |

---

## 8. Motion & Transitions

| Element | Transition |
|---|---|
| Sidebar nav hover | `transition-colors duration-150` |
| Table row hover | `transition-colors duration-100` |
| Button hover | `transition-colors duration-150` |
| Modal open | Shadcn Dialog uses `@radix-ui/react-dialog` — default animate |
| Badge / status | No animation (static) |

---

## 9. Responsive Breakpoints (Tailwind Default)

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | 640px | Collapse sidebar to icon-only |
| `md` | 768px | Standard desktop layout |
| `lg` | 1024px | Full sidebar + expanded table |
| `xl` | 1280px | Optimal layout, no changes |

> MVP focus is **desktop** (enterprise internal tool). Mobile is out of scope.
