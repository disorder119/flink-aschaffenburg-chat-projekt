import raw from "./photos.json" with { type: "json" };
import { affiliateLinks } from "../config/affiliate.ts";
export interface ProductPhoto {
  file?: string;
  remote?: string;
  delivery: string;
  alt: string;
  credit: string;
  source: string;
  original: string;
  permission: string;
  variant: string;
  checked: string;
  productUrl: string;
  reference: string;
  sourceTitle: string;
}
export const productPhotos: Record<string, ProductPhoto> = raw;
// Monetization needs a separate review of press licences and externally embedded photos.
export function photoFor(id: string): ProductPhoto | null {
  return Object.keys(affiliateLinks).length === 0
    ? (productPhotos[id] ?? null)
    : null;
}

export function photoSrc(photo: ProductPhoto, base: string): string {
  return photo.delivery === "official-embed" && photo.remote
    ? photo.remote
    : `${base}product-images/${photo.file}`;
}
