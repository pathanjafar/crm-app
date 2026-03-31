---
description: How to maintain and develop the 'NETIC' CRM
---

# CRM Maintenance & Development Guide

This guide ensures the 'NETIC' Clean Modern SaaS aesthetic and the underlying Prisma/Next.js infrastructure remain consistent during future updates.

## 🛠️ Development Setup

### Start Development Server
To run the CRM locally on port **3010**:
```bash
npm run dev
```

### Database Management (Prisma)
- **Open Prisma Studio**: To view and edit raw data in your browser.
  ```bash
  npx prisma studio
  ```
- **Sync Schema Changes**: Run this if you modify `prisma/schema.prisma`.
  ```bash
  npx prisma generate
  npx prisma db push
  ```
- **Re-Seed Database**: To reset the database with professional dummy data.
  ```bash
  npx ts-node prisma/seed.ts
  ```

---

## 🎨 'NETIC' Design System

### Core Utility: `card-modern`
Most UI elements are wrapped in a `card-modern` container (defined in `globals.css`).
```tsx
<div className="card-modern p-10">
  {/* Content goes here */}
</div>
```

### Spacing & Layout
- **Global Padding**: Every page should follow the container pattern in `layout.tsx`.
- **Vertical Spacing**: Use `space-y-10` or `space-y-16` for clear section separation.
- **Headers**: Standard SaaS headers should be `h-20` and `sticky top-0`.

### Status Indicators
Use the following CSS classes for status pills:
- `.status-won`: Emerald/Green (Paid/Converted)
- `.status-lost`: Rose/Red (Lost/Hot Lead Alert)
- `.status-cold`: Indigo/Blue (New/Pending)

---

## 🧩 Component Guide

### `MetricCard`
Used for KPI tracking. Requires `progress` (0-100) for the circular donut ring.
```tsx
<MetricCard 
  title="Gross Revenue"
  value="₹12.8M"
  trendValue={47}
  trendLabel="vs last month"
  progress={65}
  iconName="dollar"
  iconColor="emerald"
/>
```

### `DashboardCharts`
Requires `revenueData` and `leadsData`.
- **Left**: Stacked Bar (Deals Analytics).
- **Right**: Donut (Campaigns Ratio).

---

## ✅ Visual Verification Checklist
Before committing UI changes, verify:
- [ ] **No Overlap**: Page titles are clearly visible and not blocked by the Sidebar.
- [ ] **Legibility**: Text follows the `slate-950` (light) or `white` (dark) high-contrast standard.
- [ ] **Donut Rings**: Ensure progress rings in MetricCards are transitioning smoothly.
