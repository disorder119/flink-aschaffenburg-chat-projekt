import type { Assessment, Filters, Group, Product, Region } from "../types.ts";
export const regions: {
  id: Region;
  label: string;
  short: string;
  hint: string;
}[] = [
  {
    id: "kopf",
    label: "Kopf",
    short: "Kopf",
    hint: "Unter dem Helm warm bleiben",
  },
  {
    id: "oberkoerper",
    label: "Oberkörper",
    short: "Oberkörper",
    hint: "Wärme innen. Wetterschutz außen.",
  },
  {
    id: "haende",
    label: "Hände",
    short: "Hände",
    hint: "Warme Finger. Sicherer Griff.",
  },
  {
    id: "beine",
    label: "Beine",
    short: "Beine",
    hint: "Beweglich durch Wind und Regen",
  },
  {
    id: "fuesse",
    label: "Füße",
    short: "Füße",
    hint: "Trocken bis zur letzten Lieferung",
  },
];
export const tierLabels = {
  budget: "Günstig",
  value: "Preis-Leistung",
  premium: "Premium",
};
export const groupLabels: Record<Group, string> = {
  head: "Kopf & Hals",
  glove: "Handschuhe",
  liner: "Unterziehhandschuhe",
  shell: "Regenjacken",
  softshell: "Winterjacken",
  base: "Basisschichten",
  pants: "Regenhosen",
  shoe: "Winterschuhe",
  sock: "Socken",
  cover: "Überschuhe & Gamaschen",
};
export const criterionLabels = [
  "Wetterschutz",
  "Wärme",
  "Schichtkomfort",
  "Radfunktion",
  "Material / Aufbau",
  "Verschleißvorsorge",
  "Sichtbarkeit / Grip",
  "Preis-Leistung",
];
export const weights: Record<Group, Assessment> = {
  head: [15, 25, 20, 15, 5, 5, 5, 10],
  glove: [25, 20, 15, 15, 5, 5, 5, 10],
  liner: [0, 25, 25, 15, 10, 5, 5, 15],
  shell: [35, 0, 20, 15, 10, 5, 5, 10],
  softshell: [20, 25, 20, 15, 5, 5, 5, 5],
  base: [0, 25, 30, 15, 10, 5, 0, 15],
  pants: [35, 0, 20, 15, 10, 5, 5, 10],
  shoe: [25, 25, 10, 10, 5, 5, 10, 10],
  sock: [15, 25, 20, 10, 10, 5, 0, 15],
  cover: [30, 20, 10, 15, 5, 10, 5, 5],
};
// Missing optional evidence is excluded, never silently filled. No score below 80% coverage.
export function scoreOf(p: Product): {
  score: number | null;
  coverage: number;
} {
  if (!p.assessment) return { score: null, coverage: 0 };
  const w = weights[p.group];
  let coverage = 0,
    points = 0;
  p.assessment.forEach((value, i) => {
    if (value !== null) {
      coverage += w[i] ?? 0;
      points += (value / 5) * (w[i] ?? 0);
    }
  });
  if (coverage < 80) return { score: null, coverage };
  return { score: Math.round(((points / coverage) * 100) / 5) * 5, coverage };
}
export function relevance(p: Product, f: Filters): number {
  let s = scoreOf(p).score ?? 30;
  if (f.shift !== "short") {
    s += (p.assessment?.[2] ?? 0) * 3;
    if (p.group === "liner") s -= 10;
  }
  if (f.vehicle === "ebike" && p.warmth >= 2) s += 10;
  if (
    f.vehicle === "scooter" &&
    (p.group === "shell" || p.group === "pants" || p.group === "shoe")
  )
    s += 8;
  if (f.weather.includes("mixed") && p.water === "waterproof") s += 10;
  return s;
}
export function filteredProducts(
  products: Product[],
  f: Filters,
  favorites: string[],
): Product[] {
  const query = f.search.trim().toLocaleLowerCase("de");
  const matching = products.filter((p) => {
    if (f.region !== "all" && p.region !== f.region) return false;
    if (f.tier !== "all" && p.tier !== f.tier) return false;
    if (f.maxPrice !== null && (p.price === null || p.price > f.maxPrice))
      return false;
    if (f.favoritesOnly && !favorites.includes(p.id)) return false;
    if (
      query &&
      !`${p.name} ${p.brand} ${p.shop} ${regions.find((r) => r.id === p.region)?.label} ${groupLabels[p.group]}`
        .toLocaleLowerCase("de")
        .includes(query)
    )
      return false;
    if (f.vehicle === "scooter" && (p.compatibility || p.group === "liner"))
      return false;
    for (const weather of f.weather) {
      if (weather === "heavy" && p.water !== "waterproof") return false;
      if (weather === "light" && !["waterproof", "repellent"].includes(p.water))
        return false;
      if (weather === "cold" && p.warmth === 0) return false;
      if (weather === "frost" && p.warmth < 3) return false;
      if (weather === "wind" && !p.wind) return false;
    }
    return true;
  });
  return matching.sort((a, b) =>
    f.sort === "price"
      ? (a.price ?? Infinity) - (b.price ?? Infinity)
      : f.sort === "score"
        ? (scoreOf(b).score ?? -1) - (scoreOf(a).score ?? -1)
        : relevance(b, f) - relevance(a, f),
  );
}
export function totalOf(items: Product[]) {
  const cents = items.reduce(
    (sum, p) => sum + (p.price === null ? 0 : Math.round(p.price * 100)),
    0,
  );
  return {
    amount: cents / 100,
    complete: items.every((p) => p.price !== null),
    from: items.some((p) => p.priceKind === "from"),
  };
}
export function compareAllowed(existing: Product[], p: Product): string | null {
  if (existing.some((x) => x.id === p.id)) return null;
  if (existing.length >= 3)
    return "Du kannst höchstens drei Produkte vergleichen.";
  if (
    existing.length &&
    (existing[0].group !== p.group || existing[0].region !== p.region)
  )
    return "Vergleiche Produkte derselben Produktgruppe und Körperregion. Entferne zuerst die bisherige Auswahl.";
  return null;
}
export const money = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    v,
  );
export const dateLabel = (v: string) =>
  new Date(v + "T12:00:00").toLocaleDateString("de-DE");
export function shoppingList(items: Product[], link: (p: Product) => string) {
  const total = totalOf(items);
  return [
    "Meine Ausrüstung · Flink Aschaffenburg Chat Projekt",
    ...items.map(
      (p) =>
        `${regions.find((r) => r.id === p.region)?.label}: ${p.brand} ${p.name} – ${p.price === null ? "Preis unbekannt" : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`} (${p.shop}${p.retailOnly ? ", nur Filiale" : ""})\n${link(p)}`,
    ),
    `${total.complete ? "Beobachtete Artikelsumme" : "Bekannte Teilsumme"}: ${total.from ? "ab " : ""}${money(total.amount)} · Preise vom 11.10.2026 · zzgl. Versand`,
    "Größen und Shoppreise vor Kauf prüfen. Helm, Licht und geeignete Schutzausrüstung ergänzen.",
  ].join("\n\n");
}
