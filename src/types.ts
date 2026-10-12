export type Region = "kopf" | "oberkoerper" | "haende" | "beine" | "fuesse";
export type Tier = "budget" | "value" | "premium";
export type Group =
  | "head"
  | "glove"
  | "liner"
  | "shell"
  | "softshell"
  | "base"
  | "pants"
  | "shoe"
  | "sock"
  | "cover"
  | "pogie"
  | "warmer"
  | "visibility"
  | "accessory";
export type Water = "waterproof" | "repellent" | "none" | "unknown";
export type Vehicle = "bike" | "ebike" | "scooter";
export type Weather = "light" | "heavy" | "cold" | "frost" | "wind" | "mixed";
export type Assessment = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];
export interface Product {
  id: string;
  name: string;
  brand: string;
  shop: string;
  region: Region;
  tier: Tier;
  group: Group;
  price: number | null;
  priceKind: "observed" | "from" | "unknown";
  priceNote: string;
  checked: string;
  url: string;
  sourceMethod: "page" | "catalogue";
  water: Water;
  waterNote: string;
  warmth: 0 | 1 | 2 | 3;
  warmthNote: string;
  wind: boolean;
  material: string;
  pros: string[];
  cons: string[];
  use: string;
  uncertainty: string;
  assessment: Assessment | null;
  retailOnly: boolean;
  compatibility?: "spd" | "road" | "gravel" | "flatbar" | "flatshoe";
  badge?: { label: string; reason: string };
  independentSource?: string;
  supplement?: boolean;
  caution?: string;
}
export interface Filters {
  photoOnly?: boolean;
  group?: Group | "all";
  region: Region | "all";
  tier: Tier | "all";
  maxPrice: number | null;
  search: string;
  weather: Weather[];
  vehicle: Vehicle;
  shift: "short" | "medium" | "long";
  sort: "relevance" | "price" | "score";
  favoritesOnly: boolean;
  supplementsOnly?: boolean;
}
