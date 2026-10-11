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
import { GearArt } from "./GearArt";
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
        <span className="product-tier">{tierLabels[p.tier]}</span>
        <button
          className={`favorite-button icon-button ${favorite ? "is-on" : ""}`}
          onClick={onFavorite}
          aria-label={`${favorite ? "Aus Merkliste entfernen" : "Merken"}: ${p.name}`}
          aria-pressed={favorite}
        >
          <Heart size={19} fill={favorite ? "currentColor" : "none"} />
        </button>
        <GearArt
          group={p.group}
          color={
            p.tier === "premium"
              ? "#364a40"
              : p.tier === "value"
                ? "#6e8061"
                : "#7a836c"
          }
        />
        <span className="symbol-note">SYMBOLABBILDUNG</span>
        {p.badge && (
          <button className="tip-tag" onClick={onDetails}>
            <span /> {p.badge.label}
          </button>
        )}
      </div>
      <div className="product-content">
        <div className="product-meta">
          <span>{p.brand}</span>
          <span>
            {p.shop}
            {p.retailOnly ? " · Filiale" : ""}
          </span>
        </div>
        <button className="product-title" onClick={onDetails}>
          <h3>{p.name}</h3>
        </button>
        <div className="price-score">
          <div>
            <strong>
              {p.price === null
                ? "Preis offen"
                : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`}
            </strong>
            <small>
              {p.price === null
                ? "Nicht überprüfbar"
                : p.retailOnly
                  ? "Nur Filiale · vor Ort prüfen"
                  : "Zuletzt beobachtet · zzgl. Versand"}
            </small>
          </div>
          <button
            className={`score ${score.score === null ? "unrated" : ""}`}
            onClick={onDetails}
            aria-label={`Redaktionelle Eignung: ${score.score === null ? "Daten unzureichend" : score.score + " von 100 Punkten"}`}
          >
            <strong>{score.score ?? "–"}</strong>
            <small>{score.score === null ? "Daten offen" : "/ 100"}</small>
          </button>
        </div>
        <div className="attribute-row">
          <span className={p.water === "unknown" ? "unclear" : ""}>
            <Droplets size={14} />
            {waterLabels[p.water]}
          </span>
          <span>
            <Flame size={14} />
            {
              [
                "Ungefüttert",
                "Leichte Wärme",
                "Wärmende Schicht",
                "Starke Isolation",
              ][p.warmth]
            }
          </span>
        </div>
        <ul className="pros-list">
          {p.pros.map((pro) => (
            <li key={pro}>
              <Check size={13} />
              {pro}
            </li>
          ))}
        </ul>
        <details className="card-details">
          <summary>
            Grenzen & Einsatz <Info size={13} />
          </summary>
          <p>{p.use}</p>
          <ul>
            {p.cons.map((con) => (
              <li key={con}>{con}</li>
            ))}
          </ul>
          <p>
            <b>Nässe:</b> {p.waterNote}
          </p>
          <p>
            <b>Wärme:</b> {p.warmthNote}
          </p>
          <p className="muted">{p.uncertainty}</p>
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
            {p.retailOnly ? "Produkt ansehen" : "Zum Händler"}
            <ArrowUpRight size={16} />
          </a>
          <button
            className={`add-button ${inOutfit ? "is-on" : ""}`}
            onClick={onOutfit}
            aria-label={`Zum Outfit hinzufügen: ${p.name}`}
          >
            <Plus size={18} />
          </button>
        </div>
        {link.affiliate && <span className="affiliate-note">{link.label}</span>}
        <div className="card-bottom">
          <button
            className={compared ? "is-on" : ""}
            onClick={onCompare}
            aria-pressed={compared}
          >
            <GitCompareArrows size={14} />
            {compared ? "Im Vergleich" : "Vergleichen"}
          </button>
          <span>Recherchiert {dateLabel(p.checked)}</span>
        </div>
      </div>
    </article>
  );
}
