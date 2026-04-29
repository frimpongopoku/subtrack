export const NAV_ITEMS = [
  { id: "dashboard",     label: "Dashboard",     href: "/dashboard",     icon: "dashboard"     },
  { id: "subscriptions", label: "Subscriptions", href: "/subscriptions", icon: "subscriptions" },
  { id: "groups",        label: "Groups",        href: "/groups",        icon: "groups"        },
  { id: "insights",      label: "Insights",      href: "/insights",      icon: "insights"      },
  { id: "activity",      label: "Activity",      href: "/activity",      icon: "activity"      },
] as const;

export const MOCK_GROUPS = [
  { id: "g1", name: "Streaming",     color: "#a78bfa" },
  { id: "g2", name: "Work & SaaS",   color: "#60a5fa" },
  { id: "g3", name: "Personal",      color: "#fb923c" },
  { id: "g4", name: "Entertainment", color: "#f472b6" },
];
