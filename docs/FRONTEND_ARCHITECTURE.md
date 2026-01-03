# Frontend Architecture & Systems

> **Status**: Active | **Version**: 4.0 (macOS Tahoe) | **Last Updated**: 2026-01-03

## 1. System Overview

SenstoSales uses a **Next.js 14 (App Router)** frontend, optimized for high-density data interactions and "Apple-level" aesthetic precision.

### 1.1 Technology Stack
- **Framework**: Next.js 16.0.10 (React 19 Server Components)
- **Styling**: Tailwind CSS v4 (@theme configuration)
- **Design Pattern**: **3-Tier Token System** ([design_guide.md](./design_guide.md))
- **Animation**: Framer Motion 12 (Layout transitions, AnimatePresence)
- **State Management**:
  - **Server State**: React Query (TanStack Query) v5 - for caching and syncing with backend.
  - **URL State**: `nuqs` (Type-safe search params) - for filter/sort persistence.
  - **Local State**: `useState` / `useReducer` - for complex UI interactions.
- **Forms**: Component-level State / React Context.

### 1.1 Module Responsibility Map
- **`app/`**: Next.js App Router pages and layouts.
- **`components/`**: Atomic React components (Atoms, Molecules, Organisms, Templates).
- **`hooks/`**: Custom hooks for business logic and data fetching.
- **`lib/`**: Utilities (`api.ts`, `utils.ts`).
- **`store/`**: Data stores for complex multi-step forms.

### 1.2 Core Architectural Patterns

#### A. Server Components vs Client Components
- **Server Components (`app/**/page.tsx`)**:
  - Fetch initial data.
  - act as "Hydration Boundaries".
  - Pass data to Client Components via props (Zero-Waterfall).
- **Client Components (`**Client.tsx`)**:
  - Handle interactivity (Forms, Toggles).
  - Use `useQuery` to hydrate data.

#### B. 3-Tier Token Architecture
We follow a strict 3-tier hierarchy for all styles:
1.  **Primitives**: Raw color/spacing values (`primitives.css`).
2.  **Semantic**: Intent-based tokens (`semantic.css`) mapping primitives to roles (`--bg-surface`, `--text-primary`). Accessible via Tailwind utilities.
3.  **Component**: Component-specific overrides (`component.css`) mapping semantic tokens to UI elements (`--btn-primary-bg`).
*Result*: A perfectly synchronized system that supports Dark Mode and high-density ERP layouts via Tahoe aesthetics.

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
-   **Validation**: Component-level state logic synchronized with Backend Pydantic models.
-   **Auto-Save**: Long-forms (like PO Notes) implement debounced auto-save.

## 5. UI Hardening & Standardization
1. **Z-Index Layering**: Standardized on macOS hierarchy (Modals @ 1000+, Toasts @ 2000+).
2. **Focus Management**: All interactive elements support keyboard Focus rings (`focus:ring-2`).
3. **Empty States**: Enforced use of `EmptyState` molecule for all data-driven views.
4. **Tokenization**: Raw Tailwind colors (e.g., `bg-blue-500`) are prohibited. Use semantic tokens (`bg-action-primary`).
5. **Atomic Consistency**: Strictly use Typography atoms (Title1-3, Label, Body) instead of raw `<hX>` or `<span>` tags.
