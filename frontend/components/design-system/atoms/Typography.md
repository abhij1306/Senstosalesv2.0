# macOS Typography Usage Guide

## The Apple Way: Less is More

macOS typography follows these principles:
1. **Generous hierarchy** - Size differences are subtle but effective
2. **Weight over size** - Use weight changes before size changes
3. **System colors** - Use semantic text colors, not custom grays
4. **Breathing room** - Never cram text together
5. **Sentence case** - Almost never use ALL CAPS

---

## Component Selection Matrix

| Use Case | Component | Size | Weight | Color |
|----------|-----------|------|--------|-------|
| **App navigation title** | `<LargeTitle>` | 34px | Bold | Primary |
| **Page title** | `<Title1>` | 28px | Bold | Primary |
| **Section header** | `<Title2>` | 22px | Semibold | Primary |
| **Card title** | `<Title3>` | 20px | Semibold | Primary |
| **List item title** | `<Headline>` | 17px | Semibold | Primary |
| **Paragraph** | `<Body>` | 17px | Regular | Primary |
| **Button text** | `<Callout>` | 16px | Regular | Primary |
| **Subtitle** | `<Subhead>` | 15px | Regular | Secondary |
| **Helper text** | `<Footnote>` | 13px | Regular | Secondary |
| **Badge/tag** | `<Caption1>` | 12px | Medium | Tertiary |
| **Legal text** | `<Caption2>` | 11px | Medium | Tertiary |
| **Financial figures** | `<Monospaced>` | Variable | Medium | Primary |
| **Form label** | `<Label>` | 15px | Semibold | Secondary |
| **Table header** | `<TableHeader>` | 13px | Medium | Secondary |

---

## Code Examples

### Standard Page Header
```tsx
<div className="space-y-2">
  <Title1>Purchase Orders</Title1>
  <Subhead>Manage procurement contracts and track delivery schedules.</Subhead>
</div>
```

### Stats Card
```tsx
<div className="bg-app-surface rounded-xl p-6 space-y-3">
  <Caption1 className="text-text-secondary">Total Revenue</Caption1>
  <Monospaced size="large">₹50,000.00</Monospaced>
  <div className="flex items-center gap-1">
    <Footnote className="text-app-success">+12%</Footnote>
    <Footnote className="text-text-tertiary">from last month</Footnote>
  </div>
</div>
```

### Data Table Cell
```tsx
// Text Cell
<td className="py-4 px-6">
  <Body>Item Description</Body>
</td>

// Number Cell
<td className="py-4 px-6 text-right">
  <Monospaced>1,234.56</Monospaced>
</td>

// Badge Cell
<td className="py-4 px-6">
  <span className="bg-app-accent/10 text-app-accent rounded-full px-2 py-1">
    <Caption1>Active</Caption1>
  </span>
</td>
```

## Migration Guide (Aliases)

We support backward compatibility for a smooth transition.

| Old Component | New Equivalent | Notes |
|---------------|----------------|-------|
| `<H1>` | `<Title1>` | Exact match (28px) |
| `<H2>` | `<Title2>` | Exact match (22px) |
| `<H3>` | `<Title3>` | Slight increase (18px -> 20px) |
| `<H4>` | `<Caption2>` | Converted to uppercase. |
| `<SmallText>` | `<Caption1>` | 12px |
| `<TableText>` | `<Body>` | 14px -> 17px transition |
| `<MonoCode>` | `<Monospaced>` | - |
