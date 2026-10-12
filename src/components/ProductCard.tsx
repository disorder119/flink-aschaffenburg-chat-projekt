import { tr } from "../i18n/core";
import {
  Heart,
  Plus,
  Check,
  ArrowUpRight,
  GitCompareArrows,
  Droplets,
  Flame,
  Info,
} from "lucide-react";
import type { Product } from "../types";
import { dateLabel, money, scoreOf, tierLabels } from "../lib/logic";
import { shopLink } from "../config/affiliate";
import { ProductImage } from "./ProductImage";
export const waterLabels = {
  waterproof: "Wasserdicht laut Quelle",
  repellent: "Wasserabweisend",
  none: "Kein belegter Regenschutz",
  unknown: "Nässeschutz unklar",
};
export function ProductCard({
  product: p,
  favorite,
  compared,
  inOutfit,
  onFavorite,
  onCompare,
  onOutfit,
  onDetails,
}: {
  product: Product;
  favorite: boolean;
  compared: boolean;
  inOutfit: boolean;
  onFavorite: () => void;
  onCompare: () => void;
  onOutfit: () => void;
  onDetails: () => void;
}) {
  const score = scoreOf(p);
  const link = shopLink(p);
  return (
    <article className="product-card" data-product={p.id}>
      <div className={`product-visual ${p.tier}`}>
        <span className="product-tier">{tr(tierLabels[p.tier])}</span>
        <button
          className={`favorite-button icon-button ${favorite ? "is-on" : ""}`}
          onClick={onFavorite}
          aria-label={tr("{0}: {1}", {
            "0": favorite ? "Aus Merkliste entfernen" : "Merken",
            "1": p.name,
          })}
          aria-pressed={favorite}
        >
          <Heart size={19} fill={favorite ? "currentColor" : "none"} />
        </button>
        <ProductImage product={p} />
        {p.badge && (
          <button className="tip-tag" onClick={onDetails}>
            <span /> {tr(p.badge.label)}
          </button>
        )}
      </div>
      <div className="product-content">
        <div className="product-meta">
          <span>{tr(p.brand)}</span>
          <span>
            {tr(p.shop)}
            {tr(p.retailOnly ? " · Filiale" : "")}
          </span>
        </div>
        <button className="product-title" onClick={onDetails}>
          <h3>{tr(p.name)}</h3>
        </button>
        <div className="price-score">
          <div>
            <strong>
              {tr(
                p.price === null
                  ? "Preis offen"
                  : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`,
              )}
            </strong>
            <small>
              {tr(
                p.price === null
                  ? "Nicht überprüfbar"
                  : p.retailOnly
                    ? "Nur Filiale · vor Ort prüfen"
                    : "Zuletzt beobachtet · zzgl. Versand",
              )}
            </small>
          </div>
          <button
            className={`score ${score.score === null ? "unrated" : ""}`}
            onClick={onDetails}
            aria-label={tr("Redaktionelle Eignung: {0}", {
              "0":
                score.score === null
                  ? "Daten unzureichend"
                  : score.score + " von 100 Punkten",
            })}
          >
            <strong>{tr(score.score ?? "–")}</strong>
            <small>{tr(score.score === null ? "Daten offen" : "/ 100")}</small>
          </button>
        </div>
        <div className="attribute-row">
          <span className={p.water === "unknown" ? "unclear" : ""}>
            <Droplets size={14} />
            {tr(waterLabels[p.water])}
          </span>
          <span>
            <Flame size={14} />
            {tr(
              p.group === "warmer"
                ? "Aktive Wärme"
                : [
                    "Ungefüttert",
                    "Leichte Wärme",
                    "Wärmende Schicht",
                    "Starke Isolation",
                  ][p.warmth],
            )}
          </span>
        </div>
        <ul className="pros-list">
          {p.pros.map((pro) => (
            <li key={pro}>
              <Check size={13} />
              {tr(pro)}
            </li>
          ))}
        </ul>
        <details className="card-details">
          <summary>
            {tr("Grenzen & Einsatz ")}
            <Info size={13} />
          </summary>
          <p>{tr(p.use)}</p>
          <ul>
            {p.cons.map((con) => (
              <li key={con}>{tr(con)}</li>
            ))}
          </ul>
          <p>
            <b>{tr("N\u00E4sse:")}</b> {tr(p.waterNote)}
          </p>
          <p>
            <b>{tr("W\u00E4rme:")}</b> {tr(p.warmthNote)}
          </p>
          <p className="muted">{tr(p.uncertainty)}</p>
        </details>
        <div className="product-actions">
          <a
            className="shop-button"
            href={link.url}
            target="_blank"
            rel={
              link.affiliate
                ? "sponsored noopener noreferrer"
                : "noopener noreferrer"
            }
          >
            {tr(p.retailOnly ? "Produkt ansehen" : "Zum Händler")}
            <ArrowUpRight size={16} />
          </a>
          <button
            className={`add-button ${inOutfit ? "is-on" : ""}`}
            onClick={onOutfit}
            aria-label={tr("Zum Outfit hinzuf\u00FCgen: {0}", { "0": p.name })}
          >
            <Plus size={18} />
          </button>
        </div>
        {link.affiliate && (
          <span className="affiliate-note">{tr(link.label)}</span>
        )}
        <div className="card-bottom">
          <button
            className={compared ? "is-on" : ""}
            onClick={onCompare}
            aria-pressed={compared}
          >
            <GitCompareArrows size={14} />
            {tr(compared ? "Im Vergleich" : "Vergleichen")}
          </button>
          <span>
            {tr("Recherchiert ")}
            {tr(dateLabel(p.checked))}
          </span>
        </div>
      </div>
    </article>
  );
}
