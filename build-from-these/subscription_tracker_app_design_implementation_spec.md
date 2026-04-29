# Subscription Tracker Web App

## Overview
A responsive subscription management web app built with **Next.js + Firebase** that helps users track recurring and one-time subscriptions, organize them into groups, view upcoming renewals, manage payment states, upload logos, and receive actionable insights.

---

# Document 1: Product Design Specification

## 1. Product Goals
- Replace messy spreadsheets and memory-based tracking.
- Make subscription costs, due dates, and waste obvious.
- Provide fast actions: renew, pause, cancel, edit.
- Feel premium, modern, fluid, and effortless.

## 2. Core User Stories
- Create, edit, delete subscriptions.
- Upload or auto-assign service logos.
- Organize subscriptions into groups (Work, Personal, Streaming, SaaS, Family, etc.).
- View upcoming renewals: next week / next month / custom.
- Sort by earliest due date by default.
- Mark renewed / paused / cancelled.
- Keep historical logs of actions.
- See analytics and savings opportunities.

## 3. Visual Design Direction
### Style
- Glassmorphism surfaces with subtle blur.
- Soft shadows, rounded 2xl corners.
- Thin borders with translucent whites.
- Premium spacing and clean typography.
- Dark mode first, polished light mode.

### Colors
- Neutral base + vibrant accent gradients.
- Status colors:
  - Active/Subscribed = green
  - Paused = amber
  - Cancelled = red
  - Upcoming Soon = blue

### Typography
- Inter / Geist / SF-style sans-serif.
- Strong hierarchy.

## 4. Layout System
### Desktop
- Left sidebar: groups, filters, settings.
- Top bar: search, stats snapshot, profile.
- Main content: cards/table hybrid grid.
- Right drawer: details/edit panel.

### Tablet
- Collapsible sidebar.
- 2-column cards.

### Mobile
- Bottom nav.
- Swipe cards.
- Fullscreen modal forms.
- Sticky quick actions.

## 5. Motion System
Use Framer Motion:
- Card fade + slide on load.
- Expand/collapse transitions.
- Drawer glide transitions.
- Hover elevation.
- Progress ring animations.
- Filter tab underline glide.
- No decorative/random motion.

## 6. Main Screens
### Dashboard
- Monthly spend summary.
- Upcoming renewals.
- Wasted spend alerts.
- Active vs paused vs cancelled chart.

### Subscriptions View
Each card shows:
- Logo
n- Name
- Description
- Price + currency
- Recurring badge
- Status badge
- Start date
- Next due date
- Group tag
- Quick actions: Renew / Pause / Cancel / Edit

### Groups View
- Group cards with totals.
- Expand into contained subscriptions.

### Insights View
- Total monthly recurring cost.
- Annualized spend.
- Duplicate services detected.
- Inactive but still paid subscriptions.
- Highest cost subscriptions.
- Upcoming spend next 30 days.
- Savings if cancelled paused services.

### Activity Log
- Timeline of renewals, edits, pauses, cancellations.

## 7. UX Details
- Default sort: nearest due first.
- Bulk actions per group.
- Fast add button always visible.
- Empty states with guidance.
- Undo toast after delete.
- Search by name/group/status.

---

# Document 2: Technical Implementation Specification

## 1. Stack
- Next.js (App Router)
- TypeScript (strict mode, required project language)
- Tailwind CSS (primary styling system)
- shadcn/ui
- Framer Motion
- Firebase Auth (Google only)
- Firestore
- Firebase Storage
- React Hook Form + Zod
- Recharts

## 2. Project Structure
```txt
src/
  app/
  components/
    ui/
    subscriptions/
    dashboard/
  lib/
    firebase.ts
    auth.ts
    utils.ts
  hooks/
  types/
  services/
```

## 3. Firebase Setup
### Services
- Authentication → Google Provider
- Firestore
- Storage
- Security Rules

## 4. Firestore Data Model
## users/{uid}
```json
{
  "displayName": "",
  "email": "",
  "photoURL": "",
  "createdAt": "timestamp"
}
```

## users/{uid}/groups/{groupId}
```json
{
  "name": "Streaming",
  "icon": "tv",
  "createdAt": "timestamp"
}
```

## users/{uid}/subscriptions/{subscriptionId}
```json
{
  "name": "Netflix",
  "description": "Family plan",
  "amount": 15.99,
  "currency": "USD",
  "recurring": true,
  "status": "subscribed",
  "groupId": "abc123",
  "startDate": "timestamp",
  "nextDueDate": "timestamp",
  "logoUrl": "https://...",
  "renewalPeriod": "monthly",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## users/{uid}/subscriptions/{id}/logs/{logId}
```json
{
  "type": "renewed",
  "previousStatus": "paused",
  "newStatus": "subscribed",
  "note": "manual renewal",
  "createdAt": "timestamp"
}
```

## 5. Routes
```txt
/                 -> landing / redirect
/app              -> dashboard
/app/groups       -> groups
/app/subscriptions
/app/insights
/app/settings
```

## 6. Core Components
- AuthGate
- Sidebar
- Topbar
- SubscriptionCard
- SubscriptionFormModal
- GroupManagerModal
- DueDateTabs
- InsightCards
- SpendCharts
- ActivityTimeline

## 7. API / Service Layer
Use server actions or client service wrappers.

### Functions
- signInWithGoogle()
- createSubscription(data)
- updateSubscription(id, data)
- deleteSubscription(id)
- renewSubscription(id)
- changeStatus(id, status)
- uploadLogo(file)
- createGroup(data)
- getUpcoming(range)
- getInsights()

## 8. Business Logic
### Renew Action
- Update nextDueDate based on renewalPeriod.
- Add log entry type=renewed.
- Ensure status=subscribed.

### Pause Action
- status=paused
- create log.

### Cancel Action
- status=cancelled
- create log.

### Upcoming Filters
- Next Week = nextDueDate within 7 days.
- Next Month = within 30 days.
- Next Year = within 365 days.

### Default Ordering
```ts
orderBy('nextDueDate', 'asc')
```

## 9. Insights Engine
Compute client-side or via server action:
- monthlyRecurringTotal
- yearlyProjectedSpend
- dueNext7Days
- dueNext30Days
- pausedSavings
- top3Expensive
- subscriptionsCountByStatus
- currencySplit USD/GHS

## 10. Security Rules (Concept)
```txt
Users can only read/write docs under their uid path.
Storage uploads restricted to authenticated user folders.
```

## 11. Performance
- Firestore pagination.
- Index nextDueDate + status + groupId.
- Next/Image for logos.
- Lazy-load charts.

## 12. MVP Build Order
1. Firebase auth
2. Layout shell
3. CRUD subscriptions
4. Groups
5. Upload logos
6. Filters + sorting
7. Logs/history
8. Insights dashboard
9. Motion polish
10. PWA optional

## 13. Recommended Next Step
Generate the actual production-ready Next.js codebase with Firebase config, auth flow, Firestore schema, and responsive UI components.

