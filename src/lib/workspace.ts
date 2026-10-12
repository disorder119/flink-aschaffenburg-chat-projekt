import type { Product } from "../types.ts";
export type WorkspaceView =
  "products" | "filters" | "outfit" | "favorites" | "kits" | "extras";
export function workspaceViewOf(route: string): WorkspaceView | null {
  if (["", "ausruestung"].includes(route)) return "products";
  const views: Record<string, WorkspaceView> = {
    filter: "filters",
    outfit: "outfit",
    merkliste: "favorites",
    sets: "kits",
    extras: "extras",
  };
  return Object.prototype.hasOwnProperty.call(views, route)
    ? views[route]
    : null;
}
export function currentProduct(list: Product[], id: string): Product | null {
  return list.find((p) => p.id === id) ?? list[0] ?? null;
}
export function adjacentProduct(
  list: Product[],
  id: string,
  direction: -1 | 1,
): Product | null {
  if (!list.length) return null;
  const index = Math.max(
    0,
    list.findIndex((p) => p.id === id),
  );
  return list[Math.max(0, Math.min(list.length - 1, index + direction))];
}
