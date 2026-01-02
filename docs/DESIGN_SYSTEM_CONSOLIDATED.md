# Tahoe Design System - Consolidated Reference

> **Version**: 2.0 (Tahoe)
> **Status**: Active
> **Last Updated**: January 2026

## 1. Introduction
The **Tahoe Design System** represents the evolution of the SenstoSales UI into a premium, macOS-inspired interface. It prioritizes clarity, depth, and "glassmorphic" materials over flat design. The system is built on distinct layers of translucency, fine borders, and a refined typographical hierarchy using Apple's SF Pro font stack.

---

## 2. Design Tokens

### 2.1 Colors
The color system uses strict semantic roles suitable for light and dark modes.

#### Semantic Text Colors
| Token | Variable | Usage |
|-------|----------|-------|
| **Primary** | `--text-primary` | Main content (`text-slate-900` / `text-white`). |
| **Secondary** | `--text-secondary` | Subtitles (`text-slate-500` / `text-slate-400`). |
| **Tertiary** | `--text-tertiary` | Placeholders (`text-slate-400`). |
| **Quaternary** | `--text-quaternary` | Disabled text. |

#### Functional Colors
| Role | Variable | Usage |
|------|----------|-------|
| **Accent** | `--color-accent` | Primary actions (System Blue). |
| **Success** | `--color-success` | Positive trends (Green). |
| **Warning** | `--color-warning` | Alerts (Orange/Yellow). |
| **Error** | `--color-error` | Critical failures (Red). |

### 2.2 Typography
We utilize the **SF Pro / Inter** system stack.

#### Type Scale
| Component | Size | Weight | Usage |
|-----------|------|--------|-------|
| **LargeTitle** | 34px | Bold | Hero headers. |
| **Title1** | 28px | Bold | Page titles. |
| **Title2** | 22px | Semibold | Section headers. |
| **Title3** | 20px | Semibold | Subsection headers. |
| **Headline** | 17px | Semibold | Emphasized body text. |
| **Body** | 17px | Regular | Primary reading content. |
| **Callout** | 16px | Regular | Secondary content. |
| **Subhead** | 15px | Regular | Subtitles. |
| **Footnote** | 13px | Regular | Metadata. |
| **Caption1** | 12px | Medium | Labels, badges. |
| **Caption2** | 11px | Medium | Tiny metadata. |

### 2.3 Glassmorphism & Depth
Depth is achieved through `backdrop-blur` and semi-transparent backgrounds.

- **Glass Base**: `bg-white/65` (Light) / `bg-black/60` (Dark) + `backdrop-blur-xl`.
- **Glass Card**: `bg-white/50` (Light) / `bg-black/45` (Dark) + `backdrop-blur-lg`.

---

## 5. Development Guidelines

### CSS Variables
Use variables from `globals.css` via Tailwind classes.

### Tailwind Utilities
Prefer Tailwind utility classes over custom CSS.
```tsx
<div className="bg-surface-primary/50 backdrop-blur-md border border-white/20 rounded-xl">
  ...
</div>
```

### Typography Usage
Import directly from the atomic library.
```tsx
import { LargeTitle, Body } from "@/components/design-system";

<LargeTitle>Page Title</LargeTitle>
<Body>Content goes here...</Body>
```

---

> This document is the **Single Source of Truth** for the Tahoe Design System. Any deviations in the codebase should be corrected to match this specification.
