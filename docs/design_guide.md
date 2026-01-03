# SenstoSales Design Guide (M3 Glass Hybrid Edition)

A high-density ERP design system blending **Material Design 3 (M3)** elevation principles with premium glassmorphic accents. Optimized for depth, high-contrast clarity, and layered intelligence.

---

## 1. Visual Language: M3 Glass Hybrid

We prioritize **depth over lines**. Legacy borders are purged in favor of surface variation and M3 elevation shadows.

### Core Canvas Palette
- **Application Background (`--bg-app`)**: Soft Light Blue (`235 242 255`). Provides a professional, non-monotone "atmosphere".
- **Component Surfaces (`--bg-surface`)**: Premium Off-White / Light Ivory (`253 251 247`). Establishes "mass" and distinction from the background.
- **Elevated Surfaces (`--bg-surface-elevated`)**: Pure White (`255 255 255`). Used for highest-depth active states and modals.

### Depth & Elevation
We use **shadow-only depth** to separate components.
- **Shadow 1**: Standard resting state for cards, tables, and sidebar.
- **Shadow 2**: Hover state for primary cards; resting state for elevated buttons.
- **Shadow 3**: Active interaction or "Hover Lift" effect for table rows and quick actions.
- **No Internal Borders**: Table rows and sections should not use `divide-y` or `border-b`. Use surface tinting or shadow variation instead.

---

## 2. The 3-Tier Token System

Our design system is built on a strict hierarchy of tokens to ensure consistency and maintainability.

### Tier 1: Primitives (`primitives.css`)
Raw values that define the palette and scale.
- **Colors**: Slate (Neutrals), Blue (Primary/Brand), Status variants (Red, Green, Amber).
- **Spacing**: 4px base grid (`--space-1` = 4px).
- **Radius**: Large radius (24px for sidebar/main cards, 8px for smaller components).

### Tier 2: Semantic Tokens (`semantic.css`)
Mapped from primitives based on design intent.
- **Surfaces**: `bg-app`, `bg-surface`, `bg-surface-elevated`, `bg-surface-sunken`.
- **M3 Roles**: `primary-container`, `secondary-container`, `outline` (Low Opacity only).
- **Text**: `text-primary`, `text-secondary`, `text-brand`.
- **Elevation**: Shadows level 1 to 5.

### Tier 3: Component Tokens (`component.css`)
Explicit mapping for specific components to purge hardcoded values.
- **Buttons**: `--btn-primary-bg`, `--btn-secondary-bg` (Off-white), `--btn-elevated-shadow`.
- **Cards**: `--card-bg` (Off-white), `--card-shadow`.

---

## 3. Typography (M3 Standard)

We use a high-density adaptation of the M3 Typography scale.

| Role | Class | Specs | Usage |
| :--- | :--- | :--- | :--- |
| **Title Large** | `.type-title-1` | 22px / 400 | Page Headers |
| **Title Medium** | `.type-title-2` | 16px / 500 | Section Headers |
| **Label Large** | `.type-caption-1` | 14px / 500 | Table Headers, Buttons |
| **Body Medium** | `.type-body` | 14px / 400 | Standard Content, Cells |
| **Body Small** | `.type-footnote` | 12px / 400 | Subtext, Metadata |

---

## 4. Atomic Standards

### Buttons
- **Primary**: Filled with blue gradient/solid.
- **Elevated/Secondary**: Solid off-white with `shadow-1` and primary-colored text.
- **Tonal**: M3 Secondary Container (Slate) background for mid-priority actions.

### DataTable (ERP Standard)
- **Container**: Solid off-white with `shadow-1`.
- **Rows**: 52px height. Transition on hover: `scale-[1.002] shadow-3 bg-surface-elevated/80`.
- **Pagination**: Borderless footer with `bg-surface-variant/20`.

### Dashboard Cards
- **Summary Cards**: Solid off-white surfaces with a glassmorphic "Glow Blob" (top-right) for premium vibrancy.
- **Quick Actions**: Elevated cards with large tonal icons and hover lifts.

### Atoms (Smallest units)
- **Badge**: Tonal status indicators (Success, Warning, Error, Info).
- **Input**: M3 outlined style with focused behavior and semantic borders.

### Molecules & Organisms
- **DataTable**: M3-standard row heights (52px), Label Large headers, Body Medium cells. Features sticky headers and surface containers.
- **FormField**: Standard/Floating labels with M3 refined spacing and outline states.
- **SummaryCards**: Dashboard-style KPI cards using M3 `surface-variant` backgrounds and elevation.

---

## 4. Design Hardening
1. **Layered Elevation**: Use shadows level 1-2 for standard cards, 3+ for modals.
2. **ERP Density**: Maintain high information density (14px base font) while using M3's touch-friendly targets.
3. **No Raw CSS**: All styles must be utility-first using tokens; avoid hardcoded hex codes.
4. **Color Intent**: All interactions must use semantic containers (Primary Container, etc.).
