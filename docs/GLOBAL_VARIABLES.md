# Global Variables & Design System

> **System**: Neon Obsidian | **Version**: 3.0 | **Inherits**: Tailwind CSS

## 1. Design Token Hierarchy

Our design system is implemented via CSS variables in `tokens.css` and exposed via Tailwind utilities. We strictly follow a **Semantic Token Strategy** (Role-based), avoiding raw colors.

### 1.1 The Application Scale (`--app-*`)
Use these tokens for all UI development. They automatically adapt to Light/Dark mode.

| Token | Class (Tailwind) | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Backgrounds** | | | | |
| `--app-bg` | `bg-app-bg` | `#fbfbfd` | `#000000` | Main application backdrop |
| `--app-surface` | `bg-app-surface` | `#ffffff` | `#09090b` | Cards, Sidebars, Modals |
| `--app-surface-hover` | `bg-app-surface-hover` | `#f4f4f5` | `#27272a` | Interactive hover states |
| **Foregrounds** | | | | |
| `--app-fg` | `text-app-fg` | `#18181b` | `#fafafa` | Primary Heading/Body text |
| `--app-fg-muted` | `text-app-fg-muted` | `#71717a` | `#a1a1aa` | Labels, Metadata, Subtitles |
| **Borders** | | | | |
| `--app-border` | `border-app-border` | `#e4e4e7` | `#27272a` | Hairline dividers |
| **Accents** | | | | |
| `--app-accent` | `text/bg-app-accent` | `#3b82f6` | `#60a5fa` | Primary Brand Actions |
| `--app-status-success`| `*-success` | `#22c55e` | `#4ade80` | Completed, Paid |
| `--app-status-error` | `*-error` | `#ef4444` | `#f87171` | Failed, Rejected |

### 1.2 Typography System

We favor system fonts (`Inter`, `SF Pro`, `Segoe UI`) for maximum legibility and zero layout shift.

#### Global Atoms
These are exported as React Components in `@/components/design-system/atoms`.

- **`<H1>` (`text-2xl font-black`)**: Page Titles. Tracking-tight.
- **`<H2>` (`text-lg font-bold`)**: Section headers.
- **`<H3>` (`text-base font-semibold`)**: Card/Widget titles.
- **`<Label>` (`text-[10px] uppercase font-black`)**: Input labels, Table headers. High spacing.
- **`<Body>` (`text-sm font-normal`)**: Standard reading text.
- **`<Accounting>` (`font-mono tabular-nums`)**: Financial figures, Dates, Quantities.

### 1.3 Shadow & Elevation

- **`shadow-sm`**: Standard card depth.
- **`shadow-md`**: Hover states.
- **`shadow-app-lifted`**: Modals, Dropdowns.

---

## 2. Global Components

### 2.1 Theme Toggle
- **Location**: `components/ThemeToggle.tsx`
- **Behavior**: Toggles `.dark` class on `<html>` root. Persists to `localStorage`.
- **Icons**: Sun (Light) / Moon (Dark).

### 2.2 Toast Notifications
- **Location**: `components/ui/use-toast.tsx`
- **Usage**: `toast({ title: "Saved", variant: "default" })`
- **Position**: Bottom Right.

### 2.3 Loading States
- **Skeletons**: Use `animate-pulse bg-app-surface-hover`.
- **Spinners**: Lucide `Loader2` with `animate-spin`.

---

## 3. Dark Mode Constitution

1.  **Strict Inversion**: No "dim" gray modes. We use True Black or Deep Zinc (`#09090b`) backgrounds.
2.  **Border Visibility**: In Dark mode, borders (`app-border`) become critical for separation as shadow visibility drops.
3.  **Text Contrast**: Primary text is never Pure White (`#ffffff`), but Zinc-50 (`#fafafa`) to reduce eye strain.

---

## 4. CSS Variable Reference (from `tokens.css`)

```css
:root {
  /* Level 0 (App Background) */
  --bg-base: #F8F9FA; /* Maps to bg-app-bg */
  
  /* Level 1 (Card Background) */
  --bg-surface: #FFFFFF; /* Maps to bg-app-surface */
  
  /* Typography */
  --app-fg: #202124;  /* Maps to text-app-fg */
}

.dark {
  --bg-base: #0B0E14;
  --bg-surface: #161B22;
  --app-fg: #F0F6FC;
}
```
