# Frontend Architecture & Systems

> **Status**: Active | **Version**: 2.0 (Neon Obsidian) | **Last Updated**: 2025-12-30

## 1. System Overview

SenstoSales uses a **Next.js 14 (App Router)** frontend, optimized for high-density data interactions and "Apple-level" aesthetic precision.

### 1.1 Technology Stack
- **Framework**: Next.js 14.1 (React 18 Server Components)
- **Styling**: Tailwind CSS 3.4 (Utility-first) + CSS Modules (Tokens)
- **Animation**: Framer Motion 11 (Layout transitions, AnimatePresence)
- **State Management**:
  - **Server State**: React Query (TanStack Query) v5 - for caching and syncing with backend.
  - **URL State**: `nuqs` (Type-safe search params) - for filter/sort persistence.
  - **Local State**: `useState` / `useReducer` - for complex UI interactions.
- **Forms**: React Hook Form + Zod (Schema Validation).

### 1.2 Core Architectural Patterns

#### A. Server Components vs Client Components
- **Server Components (`app/**/page.tsx`)**:
  - Fetch initial data.
  - act as "Hydration Boundaries".
  - Pass data to Client Components via props (Zero-Waterfall).
- **Client Components (`**Client.tsx`)**:
  - Handle interactivity (Forms, Toggles).
  - Use `useQuery` to hydrate data.

#### B. The "Organic" Composition Pattern
We avoid rigid "Card" classes. Instead, we compose UI using atomic tokens:
1.  **Surface**: `bg-app-surface` (Base layer) or `bg-app-surface-hover/5` (Glass).
2.  **Elevation**: `shadow-sm` or `shadow-app-lifted`.
3.  **Border**: `border border-app-border` (Subtle 1px separation).
*Result*: A hierarchy defined by light and depth, not thick borders.

---

## 2. Performance Engineering

> **Constitution**: CLS < 0.05, INP < 100ms, FCP < 1.2s

### 2.1 Optimization Strategies
1.  **Route Groups (`(dashboard)`, `(app)`)**:
    - Segment layouts to prevent unnecessary re-renders of the sidebar/header.
2.  **Dynamic Imports**:
    - Heavy components (e.g., Charts, PDF Viewers) are lazy-loaded via `next/dynamic`.
3.  **Image Optimization**:
    - `next/image` is enforced for all static assets.
    - SVG Icons (Lucide) use a tree-shakeable import path.

### 2.2 Memoization & Stability
-   **Lists**: Large data tables (`DataTable.tsx`) use `React.memo` on rows to prevent full-table repaints on single-row updates.
-   **Context**: Application state is pushed down to the leaves; Global Context is reserved for `Theme` and `Toast`.

### 2.3 Web Vitals Monitoring
-   `WebVitalsReporter.tsx`: Logs FCP, LCP, and CLS to the console in Dev mode.
-   **Hydration**: We strictly guard `window` access to prevent Hydration Mismatches (Error #418, #423).

---

## 3. Directory Structure

```
frontend/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── po/           # Purchase Order module
│   │   ├── dc/           # Delivery Challan module
│   │   └── ...
│   ├── api/              # Route Handlers (Shim for external calls if needed)
│   ├── globals.css       # Global styles & Tailwind directives
│   └── layout.tsx        # Root Layout
├── components/
│   ├── design-system/    # The "Neon Obsidian" Library
│   │   ├── atoms/        # Badges, Buttons, Typography
│   │   ├── molecules/    # Dialogs, Search, inputs
│   │   ├── organisms/    # Complex Cards (PODetailCard)
│   │   └── templates/    # Page Layouts (DocumentTemplate)
│   └── ...               # Legacy/Utility components
├── lib/
│   ├── api.ts            # Typed Axios Client
│   ├── utils.ts          # cn() and formatters
│   └── hooks/            # Custom Hooks (useDebounce)
└── public/               # Static Assets
```

---

## 4. Key Systems

### 4.1 Search & Navigation (`GlobalSearch.tsx`)
-   **"Raycast-style"**: Central command palette (`Ctrl+K`).
-   **Fuzzy Matching**: Client-side filtering for instant feedback.
-   **Deep Linking**: Search results link directly to specific IDs (PO, Item, DC).

### 4.2 Data Tables
-   **Headless**: We often use simple HTML `<table>` structures styled with Tailwind for maximum performance over heavy grid libraries.
-   **Composition**: `TableHeader`, `TableRow`, `TableCell` atoms enforce standard spacing and typography.

### 4.3 Forms
-   **Controlled**: All inputs are controlled components.
-   **Validation**: Zod Schemas mirror backend Pydantic models.
-   **Auto-Save**: long-forms (like PO Notes) implement debounce auto-save.
