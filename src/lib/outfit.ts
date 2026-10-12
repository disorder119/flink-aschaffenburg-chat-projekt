import type { Product } from "../types.ts";
import type { Outfit } from "../data/kits.ts";
export function addProductToOutfit(outfit: Outfit, product: Product): Outfit {
  if (
    Object.values(outfit.primary).includes(product.id) ||
    outfit.extras.includes(product.id)
  )
    return outfit;
  if (
    product.supplement ||
    (["base", "liner", "sock", "cover", "pogie"].includes(product.group) &&
      outfit.primary[product.region])
  ) {
    return { ...outfit, extras: [...outfit.extras, product.id] };
  }
  return {
    ...outfit,
    primary: { ...outfit.primary, [product.region]: product.id },
    extras: outfit.extras.filter((id) => id !== product.id),
  };
}
