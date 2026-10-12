import { useState } from "react";
import type { Product } from "../types";
import { photoFor } from "../data/photos";
import { GearArt } from "./GearArt";

export function ProductImage({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const photo = photoFor(product.id);
  const [failed, setFailed] = useState(false);
  return (
    <figure
      className={`product-image ${photo && !failed ? "is-photo" : "is-symbol"} ${compact ? "compact" : ""}`}
    >
      {photo && !failed ? (
        <>
          <img
            src={`${import.meta.env.BASE_URL}product-images/${photo.file}`}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            width="512"
            height="512"
            onError={() => setFailed(true)}
          />
          <figcaption>{photo.credit} · Modellvariante</figcaption>
        </>
      ) : (
        <>
          <GearArt group={product.group} />
          <figcaption>SYMBOLABBILDUNG</figcaption>
        </>
      )}
    </figure>
  );
}
