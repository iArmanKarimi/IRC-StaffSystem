# Global Admin Dashboard - Accessibility & Responsiveness Guide

## Overview

The Global Admin Dashboard has been designed and developed with accessibility (WCAG 2.1 Level AA) and responsive design as core principles. This document outlines the accessibility features and responsive behavior implemented across all dashboard components.

## Accessibility Features

### 1. Keyboard Navigation

All interactive elements are fully keyboard accessible:

- **Tab Navigation**: All form inputs, buttons, and interactive cards are reachable via Tab key
- **Enter/Space Keys**: All buttons and interactive elements respond to Enter or Space keys
- **Filters**: All filter dropdowns are accessible via keyboard with full ArrowUp/ArrowDown navigation
- **Focus Indicators**: Clear focus indicators on all interactive elements with sufficient contrast

### 2. Screen Reader Support

Comprehensive ARIA labels and semantic HTML for screen readers:

#### ARIA Labels

- **Regions**: `role="region"` with descriptive `aria-label` on major sections (Header, Filters, Charts)
- **KPI Cards**:
  - `role="region"` with aria-label combining title, value, and unit
  - `tabIndex={0}` to make cards focusable
  - Example: "Total Employees: 145"
- **Charts**:
  - `role="img"` with descriptive aria-label on chart containers
  - Includes data summary (counts and percentages)
  - Example: "Driver distribution: 45 drivers (31%), 100 non-drivers (69%)"
- **Progress Bars**:

  - `role="progressbar"` with aria-valuenow, aria-valuemin, aria-valuemax
  - `aria-label` describing what the progress represents
  - Example: "Driver percentage of total workforce"

- **Chips**:
  - Each metric chip has `aria-label` with context
  - Example: "Active: 89 (61%) of total employees"

#### Semantic HTML

- **Headings**: Proper heading hierarchy (h1 for page title, h6 for section titles)
- **Typography Components**: Using MUI Typography variants which render semantic HTML
- **Form Controls**: All form inputs wrapped in FormControl with proper InputLabel

### 3. Color & Contrast

- **High Contrast**: All text meets WCAG AA standards (4.5:1 minimum ratio)
- **Color Not Only**: Information is not conveyed by color alone
  - Status breakdown uses both color and icon representation
  - Driver segmentation uses icons (LocalShippingIcon, PersonIcon) alongside color
  - Chips include text labels with numerical values
- **Theme Support**: Dashboard uses MUI theme colors with proper semantic mapping
  - Primary: Blue (main actions and primary data)
  - Success: Green (active, positive status)
  - Warning: Orange (on leave, caution status)
  - Error: Red (inactive, negative status)
  - Info: Light blue (non-critical information)

### 4. Focus Management

- **Clear Focus Paths**:
  - Filters → Export Button → Charts → Navigation Links
  - Logical tab order maintained throughout
- **Focus Indicators**:
  - All components use MUI's default focus indicators
  - KPI cards receive focus with visible outline and hover effect
  - Links underline on focus

### 5. Motion & Animation

- **Reduced Motion**: Respects `prefers-reduced-motion` media query via MUI theme
- **Smooth Transitions**:
  - Cards use 0.3s ease transition on hover (not auto-playing)
  - No animation is required to use dashboard features
  - Animations are supplementary, not essential

## Responsive Design

### Breakpoints

Dashboard uses MUI responsive breakpoints for mobile-first design:

```typescript
xs: 0px      // Mobile phones (small)
sm: 600px    // Tablets (portrait)
md: 960px    // Tablets (landscape) / Small desktops
lg: 1280px   // Desktops
xl: 1920px   // Large desktops
```

### Component-Level Responsiveness

#### Dashboard Filters

```typescript
flexDirection: { xs: "column", md: "row" }  // Stacks on mobile, rows on desktop
gap: { xs: 1.5, md: 2 }                      // Smaller gaps on mobile
width: { xs: "100%", md: "auto" }            // Full width on mobile
```

#### KPI Cards Grid

```typescript
Grid layout: xs={12} sm={6} md={3}
- Mobile (xs): 1 card per row (100% width)
- Small tablets (sm): 2 cards per row (50% width)
- Tablets+ (md): 4 cards per row (25% width)
```

#### Charts & Data Panels

```typescript
Grid layout: xs={12} md={6}
- Mobile: Full width (single column)
- Tablets+: 2 columns side-by-side
```

#### Attendance Charts

```typescript
gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }
- Mobile: Stacks vertically
- Tablets+: 2-column grid
```

### Mobile Optimizations

#### Touch Targets

- **Minimum Size**: All interactive elements are ≥44x44px for touch
- **Spacing**: Buttons and selects have adequate padding for touch screens

#### Font Sizes

- **Readable**: Base font size is 14-16px
- **Zoom**: Page is fully functional at up to 200% zoom level
- **Font Scaling**: Typography scales properly with device width

#### Input Fields

- **Dropdown Selects**:
  - Full width on mobile for easy tapping
  - Proper label placement with aria-label
  - Clear focus states for form fields

### Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Ensures proper rendering and touch zoom support across devices.

## Testing Recommendations

### Automated Testing

1. **Axe DevTools**: Run automated accessibility scans

   ```bash
   # Browser extension: Check for WCAG violations
   ```

2. **WAVE**: Browser extension for additional checks
3. **Lighthouse**: Chrome DevTools audit for accessibility score

### Manual Testing

#### Keyboard Testing

- [ ] Navigate entire dashboard using only Tab/Shift+Tab
- [ ] Access all filters without mouse
- [ ] Verify all buttons are activatable via Enter/Space
- [ ] Check focus indicators are always visible

#### Screen Reader Testing

- Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
- [ ] Verify all headings are announced correctly
- [ ] Check all form labels are associated with inputs
- [ ] Confirm ARIA labels are present and descriptive
- [ ] Test with filter changes to ensure dynamic updates are announced

#### Responsive Testing

```bash
# Chrome DevTools - Toggle Device Toolbar
- Test at: 375px, 768px, 1024px, 1920px widths
- Verify all content is accessible without horizontal scroll
- Check touch targets are properly sized on mobile
```

#### Color & Contrast Testing

- [ ] Use WebAIM Contrast Checker for text/background pairs
- [ ] Verify information is understandable without color
- [ ] Test with Color Blind Simulator (simulate protanopia, deuteranopia)

#### Zoom Testing

- [ ] Test at 100%, 150%, 200% zoom levels
- [ ] Verify no content is cut off or hidden
- [ ] Check responsive layout still works at zoom levels

## Component Accessibility Details

### KPICard Component

```tsx
<Card role="region" aria-label={`${title}: ${value}${unit}`} tabIndex={0}>
	{/* Content */}
</Card>
```

- **Purpose**: Make each metric independently identifiable
- **Usage**: Allows screen reader users to navigate directly to KPIs
- **Focusable**: Cards are part of natural tab flow

### StatusBreakdownPanel Component

```tsx
<Box
	role="img"
	aria-label="Active: 89 (61%), Inactive: 34 (24%), On Leave: 22 (15%)"
>
	<PieChart>{/* Chart */}</PieChart>
</Box>
```

- **Purpose**: Provide text alternative to visual chart
- **Content**: Summary of all data points with percentages
- **Benefit**: No need to "see" the chart to understand data

### DriverSegmentationPanel Component

```tsx
<Chip
	icon={<LocalShippingIcon />}
	aria-label="Drivers count: 45 out of 145 total employees"
/>
```

- **Purpose**: Combine icon, color, and text for maximum accessibility
- **Icons**: Truck icon for drivers, person icon for non-drivers
- **Text**: Explicit counts and percentages

### DashboardFilters Component

```tsx
<Box role="region" aria-label="Dashboard filters for analytics data">
	{/* 8 filter inputs */}
</Box>
```

- **Purpose**: Identify filters as a coherent group
- **Functionality**: Reset button with confirmation dialog for safety

## Future Accessibility Enhancements

### Planned for Milestone 4

1. **High Contrast Mode**: Add explicit high-contrast theme toggle
2. **Font Size Controls**: Implement user-selectable text scaling
3. **Skip Links**: Add "Skip to Main Content" link for keyboard users
4. **Language Support**: ARIA labels in multiple languages
5. **Time-based Data**: Add announcements for filter changes with audit trail
6. **Dark Mode**: Ensure colors maintain contrast in dark theme

### Proposed Features

- **Locale-aware Formatting**: Date/number formatting by region
- **Data Export Options**: Accessible CSV/PDF export with proper structure
- **Alerts & Notifications**: ARIA live regions for dynamic updates
- **Help Text**: Contextual help for complex filters with tooltips

## Compliance Statement

The Global Admin Dashboard follows:

- **WCAG 2.1 Level AA** - Web Content Accessibility Guidelines
- **Section 508** - U.S. federal accessibility requirements
- **ARIA 1.2** - Accessible Rich Internet Applications specification
- **MUI Accessibility Standards** - Material-UI library best practices

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MUI Accessibility](https://mui.com/material-ui/guides/accessibility/)
- [Web Accessibility by Google](https://www.w3.org/WAI/fundamentals/)

### Testing Tools

- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Blind Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

### Screen Readers

- [NVDA (Free, Windows)](https://www.nvaccess.org/)
- [JAWS (Commercial, Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (Built-in, Mac/iOS)](https://www.apple.com/accessibility/voiceover/)
- [TalkBack (Built-in, Android)](https://support.google.com/accessibility/android/answer/6283677)

---

**Last Updated**: December 2025
**Dashboard Version**: 1.0.0 (Milestones 1-3 Complete)
**Accessibility Level**: WCAG 2.1 AA
