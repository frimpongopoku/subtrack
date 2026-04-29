const COLORS = [
  "#a78bfa", "#60a5fa", "#fb923c", "#f472b6",
  "#34d399", "#f87171", "#fbbf24", "#818cf8",
];

export function logoColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function logoInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 3).toUpperCase();
}
