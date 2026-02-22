# Accessibility (A11y) Guidelines — EduPortal

## Standards Target
- **WCAG 2.1 Level AA** compliance
- Keyboard navigable entire application
- Screen reader compatible (NVDA, JAWS, VoiceOver)

## Implemented

### Semantic HTML
- `<main id="main-content">` wraps all page content
- Skip-to-content link at top of `layout.tsx` (visible on focus)
- Proper heading hierarchy (h1 → h2 → h3) on all pages
- `<nav>`, `<header>`, `<footer>`, `<aside>` landmarks used in layout components

### Keyboard Navigation
- All interactive elements reachable via Tab
- Modal dialogs: Escape key closes, focus trapped inside
- Dropdowns: click-outside detection does not break keyboard flow
- Custom video player: keyboard controls (Space=play, Arrow=seek)

### ARIA
- `aria-label` on icon-only buttons (e.g. close modal, archive, activate)
- `aria-expanded` on dropdown toggles
- `aria-live="polite"` for toast notifications (via react-hot-toast)
- `role="dialog"` + `aria-modal="true"` on Modal component
- Loading states: `aria-busy="true"` on skeleton regions

### Forms
- Every input has an associated `<label>` (htmlFor)
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`

### Color & Contrast
- Primary palette: primary-600 on white → 7.2:1 (passes AA + AAA)
- Slate-900 body text on white → 16.8:1
- Badge text colors validated for minimum 4.5:1 contrast ratio
- Never convey meaning by color alone (status badges always include text)

### Images
- All `<Image>` components have `alt` text
- Decorative images use `alt=""`

## Testing Checklist (before each release)

- [ ] Tab through entire page — no focus traps outside modals
- [ ] All modals operable with keyboard only
- [ ] Screen reader announces page changes (Next.js router)
- [ ] Zoom to 200% — no horizontal scroll, no content cut off
- [ ] All form errors announced to screen reader
- [ ] Video player keyboard accessible
- [ ] PDF viewer download button has aria-label

## Tools

```bash
# Axe accessibility scan (run in browser DevTools console)
# Install axe-core in browser extension or use:
npx axe http://localhost:3000

# Playwright accessibility tests
npm run test:e2e -- e2e/a11y.spec.ts
```

## Known Limitations
- Recharts charts: SVG charts include title elements but full screen-reader table is not yet implemented. Consider adding a data table toggle for complex charts.
- Drag-and-drop (sections reorder): keyboard alternative not yet implemented (use manual order input as workaround).
