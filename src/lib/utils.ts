import type { TechBadge } from "@/types/info";

export function createBadgeUrl(badge: TechBadge): string {
  const { name, color, logo, logoColor = "white" } = badge;
  return `https://img.shields.io/badge/${encodeURIComponent(name)}-${color}.svg?&style=for-the-badge&logo=${logo}&logoColor=${logoColor}`;
}

export function isUrl(text: string): boolean {
  return text.startsWith("http://") || text.startsWith("https://");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
