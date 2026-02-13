# Frontend Design Guidelines

**Single Source of Truth for Frontend Development**

This document defines the design system standards that MUST be followed for all frontend development. Any visual, stylistic, or component-level changes require updates to this file.

---

## Design Philosophy: Control Room Aesthetic

AlertFlow uses a **Control Room / Emergency Operations Center** aesthetic, inspired by NASA mission control, emergency dispatch systems, and technical monitoring interfaces. This design direction emphasizes:

- **Dark theme** with glowing neon accents
- **Technical precision** with geometric shapes and grid patterns
- **High contrast** for critical information visibility
- **Animated effects** to convey real-time system status
- **Authoritative typography** using distinctive geometric fonts

---

## Typography

### Font Families

| Font | Usage | Weights | Characteristics |
|------|-------|---------|-----------------|
| **Chakra Petch** | Display, headings, titles | 300-700 | Geometric, technical, Thai-inspired |
| **Saira** | Body text, UI elements | 300-700 | Clean, geometric, highly readable |

**CSS Variables:**
- `--font-display`: Chakra Petch (headings, titles, brand)
- `--font-body`: Saira (body text, UI components)

**Display Typography Styling:**
- Letter spacing: `0.02em` (slightly expanded for technical feel)
- Line height: `1.2` (tight for impact)
- Font weight: `600-700` (bold for authority)
- Text transform: `uppercase` for section headers and navigation

---

## Design Tokens

### Color Palette - Control Room Theme

#### Core Brand Colors (Electric Blue)
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-primary` | #00D9FF | Primary accents, interactive elements, brand |
| `--color-primary-hover` | #00B8D4 | Hover states |
| `--color-primary-active` | #0097A7 | Active states, pressed buttons |
| `--color-primary-glow` | rgba(0, 217, 255, 0.4) | Glow effects for primary elements |

#### Accent Colors
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-info` | #00E5FF | Info badges, secondary accents |
| `--color-success` | #00FF9F | Success states, active status indicators |
| `--color-success-glow` | rgba(0, 255, 159, 0.3) | Success glow effects |

#### Severity Colors (Neon Palette)
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-warning` | #FFB800 | Warning alerts, medium severity |
| `--color-warning-glow` | rgba(255, 184, 0, 0.35) | Warning glow effects |
| `--color-critical` | #FF2E63 | Critical alerts, errors, high severity |
| `--color-critical-glow` | rgba(255, 46, 99, 0.4) | Critical glow effects (includes pulse) |

#### Dark Backgrounds
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-bg-primary` | #0A0E1A | Main app background (with grid overlay) |
| `--color-bg-surface` | #131825 | Cards, panels, surfaces |
| `--color-bg-elevated` | #1A1F2E | Elevated elements, popovers, modals |

#### Text Colors
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-text-primary` | #E8EDF4 | Primary text, headings |
| `--color-text-secondary` | #9CA3AF | Secondary text, labels |
| `--color-text-muted` | #6B7280 | Muted text, metadata |

#### Borders & Dividers
| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-border` | #1F2937 | Subtle borders, dividers |
| `--color-border-bright` | #374151 | Prominent borders, inputs |

#### Color Role Mapping

**Application Backgrounds**
- App background: `--color-bg-primary` (#0A0E1A) with subtle grid pattern overlay
- Cards and panels: `--color-bg-surface` (#131825) with `--color-border-bright` borders
- Elevated surfaces: `--color-bg-elevated` (#1A1F2E) for modals, popovers

**Interactive Elements**
- Primary actions: `--color-primary` (#00D9FF) with glow on hover
- Links: `--color-primary` with hover transition to `--color-primary-hover`
- Buttons: Border outlines with glow effects on active state

**Navigation**
- Header/Footer: `--color-bg-surface` with glowing accent lines
- Active nav items: `--color-primary` text with border and glow
- Inactive nav items: `--color-text-secondary` with hover effects

**Feedback States**
- Info badges: `--color-info` (#00E5FF) with glow
- Success states: `--color-success` (#00FF9F) with glow
- Warning alerts: `--color-warning` (#FFB800) with glow
- Critical alerts: `--color-critical` (#FF2E63) with pulsing glow animation

**Usage Constraint**: Glow effects are reserved for interactive elements and severity indicators. Critical severity includes pulsing animation to draw attention.

### Typography Scale

| Token Name | Font Size | Line Height | Font Weight | Usage |
|------------|-----------|-------------|-------------|-------|
| `--text-display-xl` | 48px | 56px | 700 | Hero titles |
| `--text-display-lg` | 36px | 44px | 700 | Page titles |
| `--text-display-md` | 30px | 38px | 600 | Section titles |
| `--text-heading-xl` | 24px | 32px | 600 | Card titles |
| `--text-heading-lg` | 20px | 28px | 600 | Subsection titles |
| `--text-heading-md` | 18px | 26px | 600 | Component headers |
| `--text-body-lg` | 16px | 24px | 400 | Body text, primary |
| `--text-body-md` | 14px | 22px | 400 | Secondary text |
| `--text-body-sm` | 12px | 20px | 400 | Captions, hints |

### Spacing Scale

| Token Name | Value | Usage |
|------------|-------|-------|
| `--space-0` | 0 | No spacing |
| `--space-1` | 4px | Tight spacing, icon padding |
| `--space-2` | 8px | Small gaps, inline spacing |
| `--space-3` | 12px | Compact spacing |
| `--space-4` | 16px | Default spacing, card padding |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large spacing |
| `--space-10` | 40px | Component groups |
| `space-12` | 48px | Page sections |
| `--space-16` | 64px | Major sections |

### Border Radius

| Token Name | Value | Usage |
|------------|-------|-------|
| `--radius-none` | 0 | Sharp corners |
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Cards, buttons, inputs |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows & Glow Effects

#### Standard Shadows (Dark Theme)
| Token Name | Value | Usage |
|------------|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.3) | Subtle elevation |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.4) | Cards, dropdowns |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.5) | Modals, popovers |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.6) | Important overlays |

#### Glow Effects
| Token Name | Value | Usage |
|------------|-------|-------|
| `--glow-primary` | 0 0 20px var(--color-primary-glow) | Primary element glow |
| `--glow-success` | 0 0 20px var(--color-success-glow) | Success indicator glow |
| `--glow-warning` | 0 0 20px var(--color-warning-glow) | Warning indicator glow |
| `--glow-critical` | 0 0 30px var(--color-critical-glow), 0 0 50px var(--color-critical-glow) | Critical alert glow (multi-layer) |

---

## Layout Standards

### Container Widths

| Breakpoint | Max Width | Usage |
|------------|-----------|-------|
| Mobile | 100% | Full-width content |
| Tablet | 768px | Constrained content |
| Desktop | 1024px | Standard container |
| Wide | 1280px | Wide containers |
| Ultra | 1536px | Maximum container |

### Grid System

- **Columns**: 12-column grid
- **Gutter**: 24px between columns
- **Margins**: 16px on mobile, 32px on desktop

### Responsive Breakpoints

| Name | Min Width | Max Width |
|------|-----------|-----------|
| `--bp-mobile` | 320px | 767px |
| `--bp-tablet` | 768px | 1023px |
| `--bp-desktop` | 1024px | 1279px |
| `--bp-wide` | 1280px | — |

---

## Visual Effects & Patterns

### Grid Background Pattern
The main app background includes a subtle grid overlay to reinforce the technical control room aesthetic:

```css
background-image:
  linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

### Hexagonal Patterns
Severity badges and certain UI elements use hexagonal SVG patterns for a technical, geometric aesthetic.

### Angular Accents
Cards and panels include diagonal corner accents using CSS gradients to add visual interest and reinforce the angular design language.

### Glowing Accent Lines
Headers and footers feature thin horizontal lines with gradient fading and glow effects:

```css
background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
box-shadow: 0 0 10px var(--color-primary-glow);
```

---

## Animation System

### Keyframe Animations

#### pulse-glow
Used for critical alerts to draw attention:
- Duration: 2s
- Easing: ease-in-out
- Loop: infinite
- Effect: Pulsing shadow glow

#### fade-in-up
Used for page entry animations:
- Duration: 0.6s
- Easing: ease-out
- Effect: Fade in from bottom with 20px vertical translation

#### Staggered Delays
Event cards and list items use staggered animation delays:
- `.stagger-1`: 0.1s delay
- `.stagger-2`: 0.2s delay
- `.stagger-3`: 0.3s delay
- `.stagger-4`: 0.4s delay
- `.stagger-5`: 0.5s delay

### Transition Standards
- **Duration**: 200ms for micro-interactions, 300ms for component state changes
- **Easing**: ease-out for entrances, ease-in for exits
- **Properties**: Prefer animating `transform` and `opacity` for performance

---

## Component Structure

### Button Component (Control Room Style)

```
button.{variant}.{size}
  ├─ before::pseudo (border glow effect)
  ├─ button__icon (optional)
  ├─ button__label
  └─ button__trailing-icon (optional)
```

**Variants**: `primary`, `secondary`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`

**Visual Treatment:**
- Border-based design with glow effects
- Uppercase text with expanded letter-spacing
- Pseudo-element for animated border effects
- Glow on hover/active states

### Input Component

```
input.{state}
  ├─ input__label
  ├─ input__field
  ├─ input__icon (optional)
  └─ input__helper-text (optional)
```

**States**: `default`, `focus`, `error`, `disabled`

### Card Component (Control Room Style)

```
card
  ├─ angular-corner-accent (decorative)
  ├─ grid-overlay (pattern)
  ├─ card__header
  │   ├─ badges (severity, type, status with glows)
  │   └─ card__title (display font, large)
  ├─ card__body
  │   ├─ description
  │   └─ metadata-grid (location, time with icons)
  └─ card__footer
      ├─ source (monospace)
      └─ action-link (with glow on hover)
```

**Visual Treatment:**
- Dark surface background with bright border
- Angular corner accent (gradient)
- Subtle grid overlay pattern
- Hover state: border color changes to primary with glow
- Critical severity: pulsing glow animation

---

## Interaction States

### Button States (Control Room)
| State | Visual Treatment |
|-------|------------------|
| Default | Border with base color, no glow |
| Hover | Border brightens to primary, glow effect applied |
| Active | Background fills with primary/10, border glows stronger |
| Focus | Outline: 2px solid `--color-primary`, outline-offset: 2px, glow |
| Disabled | Opacity: 0.4, cursor: not-allowed, no glow |

### Input States (Control Room)
| State | Visual Treatment |
|-------|------------------|
| Default | Border: `--color-border-bright`, dark background |
| Focus | Border: `--color-primary`, glow effect applied |
| Error | Border: `--color-critical`, error glow |
| Disabled | Opacity: 0.5, cursor: not-allowed |

### Badge States (Severity)
| Severity | Visual Treatment |
|----------|------------------|
| Low | Green border/text with success glow |
| Medium | Yellow/orange border/text with warning glow |
| High | Orange border/text with custom glow |
| Critical | Red border/text with pulsing critical glow |

**Note:** All badges include hexagonal background SVG patterns and use uppercase text with expanded tracking.

---

## Accessibility Constraints

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- Normal text (< 18px): Minimum 4.5:1 contrast ratio
- Large text (≥ 18px): Minimum 3:1 contrast ratio
- UI components/borders: Minimum 3:1 contrast ratio

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicator on all focusable elements
- Logical tab order following DOM sequence
- No keyboard traps

#### Screen Reader Support
- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- ARIA labels for icons without text labels
- ARIA live regions for dynamic content updates
- Descriptive link text (no "click here")

#### Forms
- Labels associated with inputs via `for` attribute
- Required fields clearly indicated
- Error messages announced via ARIA
- Validation feedback provided inline

### Motion & Animation
- Respect `prefers-reduced-motion` media query
- No flashing content (> 3 flashes/second)
- Auto-playing content must be pauseable

---

## Component Naming Convention

```
[namespace]-[component][-modifier]
```

**Examples**:
- `.btn-primary`
- `.card--featured`
- `.input__field--error`

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-13 | Initial design system creation | Claude Code |
| 2026-02-13 | Updated color palette with core brand, accent, severity, and neutral colors; added role mapping and usage constraints | Claude Code |
| 2026-02-13 | **MAJOR UPDATE**: Redesigned entire frontend with Control Room aesthetic - dark theme, neon colors, glow effects, geometric fonts (Chakra Petch/Saira), hexagonal patterns, grid overlays, animations, staggered entrance effects | Claude Code |

---

**Note**: This file MUST be updated whenever any visual, stylistic, or component-level changes are introduced to the codebase.
