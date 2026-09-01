# Mobile Navigation & Touch UX System (Phase 14)

## 1. Ergonomic Bottom Navigation Bar (`<MobileBottomNav />`)
- Rendered on mobile viewports (< 768px).
- Docked at viewport bottom with safe-area padding for iOS home indicator bars.
- 5 primary touch targets:
  1. **Home / Dashboard** (`/dashboard`)
  2. **Kundli Chart** (`/kundli`)
  3. **AI Chat** (`/chat`)
  4. **Reports Dossier** (`/reports`)
  5. **More Menu** (triggers slide-over drawer)

---

## 2. Touch Target Compliance
- All interactive controls conform to Apple HIG and Google Material guidelines (minimum 44x44 CSS pixels).
- Zero horizontal overflow across all test viewports: 320px (iPhone SE 1st gen), 360px (Galaxy S series), 375px (iPhone mini), 390px (iPhone 13/14), 414px (iPhone Plus/Max), and tablets.
