# M3 & macOS Tahoe Design Refinements

This document preserves the strict design standards extracted from the master prompt for the final optimization phase.

## 🎯 Design Philosophy
- **Information First**: Data is the hero, not decoration.
- **Surgical Spacing**: Every pixel serves a purpose.
- **Whisper Typography**: Regular weight default, medium only for interactive elements. Zero bold fonts.
- **Glass Depth**: Layers defined by translucency and blur, not borders.
- **Consistent Rhythm**: 4px base unit (0.25rem) for all spacing.

## 📐 Spacing Standards
| Context | Padding/Gap | Rationale |
|---------|-------------|-----------|
| Table Cell | `px-3 py-2` | Dense data, maximum rows visible |
| Card Content | `p-4` | Comfortable reading without waste |
| Modal Dialog | `p-6` | Focused tasks |
| Field Gaps | `gap-4` | Consistent vertical rhythm |

## 🚫 Anti-Patterns (Purge these)
- ❌ **Bold headings**: Use Medium weight or color hierarchy instead.
- ❌ **Excessive Padding**: No `p-6` or `p-8` on data cards.
- ❌ **Raw Colors**: No `bg-blue-500` or `text-gray-900`. Use semantic tokens.
- ❌ **Thick Borders**: Use `border-hairline` (1px) exclusively.

## 🧪 Implementation Checklist
- [ ] No bold fonts on body or headings.
- [ ] All table cells use `px-3 py-2`.
- [ ] All cards use `p-4`.
- [ ] Monospace (`type-mono`) used for all numbers.
- [ ] Table headers use `Caption1` (uppercase + tracking-wider).
- [ ] Transition effects on all hover/active states.
