import raw from "./photos.json" with { type: "json" };
import { affiliateLinks } from "../config/affiliate.ts";
export interface ProductPhoto {
  file: string;
  alt: string;
  credit: string;
  source: string;
  original: string;
  permission: string;
  variant: string;
  checked: string;
}
export const productPhotos: Record<string, ProductPhoto> = raw;
// These files were offered for editorial reporting. Monetization needs a separate image review.
export function photoFor(id: string): ProductPhoto | null {
  return Object.keys(affiliateLinks).length === 0
    ? (productPhotos[id] ?? null)
    : null;
}
