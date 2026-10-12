import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Product } from "../types";
import { photoFor, photoSrc } from "../data/photos";

export function ProductImage({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const photo = photoFor(product.id);
  const src = photo ? photoSrc(photo, import.meta.env.BASE_URL) : null;
  // A failed photo belongs only to that file, never to the next selected article.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const available = !!photo && !!src && failedSrc !== src;
  return (
    <figure
      className={`product-image ${available ? "is-photo" : "is-unavailable"} ${compact ? "compact" : ""}`}
      data-photo-state={
        available ? (loadedSrc === src ? "loaded" : "loading") : "unavailable"
      }
    >
      {photo && src && available ? (
        <>
          <img
            key={src}
            src={src}
            alt={photo.alt}
            loading={compact ? "lazy" : "eager"}
            decoding="async"
            referrerPolicy="no-referrer"
            width="512"
            height="512"
            onError={() => setFailedSrc(src)}
            onLoad={() => setLoadedSrc(src)}
          />
          <figcaption>{photo.credit}</figcaption>
        </>
      ) : (
        <>
          <div
            className="product-photo-unavailable"
            role="img"
            aria-label={`Für ${product.name} ist aktuell kein freigegebenes Originalfoto verfügbar`}
          >
            <ImageOff aria-hidden="true" size={26} strokeWidth={1.3} />
            <span>{photo ? "Foto nicht geladen" : "Originalfoto fehlt"}</span>
          </div>
          <figcaption>Beim Händler ansehen</figcaption>
        </>
      )}
    </figure>
  );
}
