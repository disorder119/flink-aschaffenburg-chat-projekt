import type { Product } from "../types";
// Only add your own approved, direct affiliate URLs. Do not invent tracking IDs.
export const affiliateLinks: Record<string, { url: string; label: string }> =
  {};
export function shopLink(p: Product) {
  const affiliate = affiliateLinks[p.id];
  if (affiliate && /^https:\/\//.test(affiliate.url))
    return {
      url: affiliate.url,
      affiliate: true,
      label: affiliate.label || "Werbelink · Provision möglich",
    };
  return {
    url: p.url,
    affiliate: false,
    label: p.retailOnly ? "Produkt bei Action ansehen" : "Zum Händler",
  };
}
