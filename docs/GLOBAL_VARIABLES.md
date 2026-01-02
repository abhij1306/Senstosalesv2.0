# Global Variables & Design System

> **System**: macOS Tahoe | **Version**: 4.0 | **Inherits**: Tailwind CSS v4

## 1. Design Token Hierarchy

Our design system is implemented via CSS variables in `globals.css` and exposed via Tailwind utilities. We strictly follow a **Semantic Token Strategy** (Role-based), avoiding raw colors.

### 1.1 The Application Scale
Use these tokens for all UI development. They automatically adapt to Light/Dark mode.

| Token | Class (Tailwind) | Usage |
| :--- | :--- | :--- |
| **Backgrounds** | | |
| `--bg-primary` | `bg-bg-primary` | Main application backdrop (White / Black) |
| `--bg-secondary` | `bg-bg-secondary` | Sidebars, secondary panels |
| `--surface-primary` | `bg-surface-primary` | Cards, Modals |
| **Foregrounds** | | |
| `--text-primary` | `text-text-primary` | Primary Heading/Body text |
| `--text-secondary` | `text-text-secondary` | Subtitles, descriptions |
| `--text-tertiary` | `text-text-tertiary` | Placeholders |
| **Borders** | | |
| `--border-primary` | `border-border-primary` | Strong dividers |
| `--border-separator` | `border-border-separator` | Table rows, hairline dividers |
| **Accents** | | |
| `--color-accent` | `text-accent` | Primary Brand Actions (System Blue) |
| `--color-success`| `text-success` | Completed, Paid |
| `--color-error` | `text-error` | Failed, Rejected |

### 1.2 Typography System

We favor system fonts (`Inter`, `SF Pro`) for native Apple feel.

#### Global Atoms
These are exported as React Components in `@/components/design-system`.

- **`<LargeTitle>`**: Hero headers.
- **`<Title1>`**: Page Titles.
- **`<Title2>`**: Section headers.
- **`<Title3>`**: Card/Widget titles.
- **`<Headline>`**: Emphasized body text.
- **`<Body>`**: Standard reading text.
- **`<Footnote>`**: Metadata.

### 1.3 Glassmorphism

- **`backdrop-blur-xl` + `bg-surface-primary/65`**: Sidebars.
- **`backdrop-blur-lg` + `bg-surface-primary/50`**: Cards.

---

## 2. Global Components

### 2.1 Theme Toggle
- **Location**: `components/ThemeToggle.tsx`
- **Behavior**: Toggles `.dark` class.

### 2.2 Toast Notifications
- **Location**: `components/design-system/molecules/Toast.tsx`
- **Usage**: `toast({ title: "Saved", variant: "default" })`

---

## 3. Dark Mode Constitution

1.  **Vibrancy**: We use semi-transparent materials to allow wallpapers to bleed through, rather than flat gray backgrounds.
2.  **Depth**: Achieved via `backdrop-blur` steps (XL -> LG -> MD).
3.  **Contrast**: Text is never pure white, but system variables (`--text-primary`).

---

## 4. CSS Variable Reference (from `globals.css`)

```css
:root {
  /* Surfaces */
  --surface-primary: 255 255 255; 
  
  /* Text */
  --text-primary: 0 0 0;
  
  /* System */
  --system-blue: 0 122 255;
}

.dark {
  --surface-primary: 28 28 30;
  --text-primary: 255 255 255;
}
```
