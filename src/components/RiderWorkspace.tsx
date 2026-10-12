import { tr } from "../i18n/core";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Heart,
  Plus,
  SlidersHorizontal,
  Layers,
  GitCompareArrows,
  List,
  Search,
  Droplets,
  Flame,
  X,
  Trash2,
  Camera,
  PackageCheck,
  Bike,
  CloudRain,
} from "lucide-react";
import type { Filters, Product, Region, Weather } from "../types";
import { type Outfit, kits } from "../data/kits";
import {
  dateLabel,
  money,
  regions,
  scoreOf,
  tierLabels,
  totalOf,
  groupLabels,
} from "../lib/logic";
import {
  adjacentProduct,
  currentProduct,
  type WorkspaceView,
} from "../lib/workspace";
import { riderStyles } from "../lib/experience";
import { shopLink } from "../config/affiliate";
import { type useExperience } from "./useExperience";
import { Rider } from "./Rider";
import { ProductImage } from "./ProductImage";
import { waterLabels } from "./ProductCard";
import { Modal } from "./Modal";
interface Props {
  view: WorkspaceView;
  filters: Filters;
  list: Product[];
  allProducts: Product[];
  favorites: string[];
  compared: string[];
  outfit: Outfit;
  chosen: Product[];
  experience: ReturnType<typeof useExperience>;
  onFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
  onNavigate: (route: string) => void;
  onRegion: (region: Region) => void;
  onFavorite: (p: Product) => void;
  onCompare: (p: Product) => void;
  onCompareOpen: () => void;
  onDetails: (p: Product) => void;
  onAdd: (p: Product) => void;
  onRemove: (p: Product) => void;
  onClearOutfit: () => void;
  onUseKit: (outfit: Outfit) => void;
  onCopy: () => void;
  onExtra: (id: string) => void;
}
const views = [
  {
    view: "products",
    route: "ausruestung",
    label: "Artikel",
    icon: PackageCheck,
  },
  {
    view: "filters",
    route: "filter",
    label: "Filter",
    icon: SlidersHorizontal,
  },
  { view: "extras", route: "extras", label: "Zubehör", icon: Flame },
  { view: "outfit", route: "outfit", label: "Outfit", icon: Layers },
  { view: "favorites", route: "merkliste", label: "Merkliste", icon: Heart },
] as const;
const weatherOptions: {
  id: Weather;
  label: string;
}[] = [
  { id: "light", label: "Leichter Regen" },
  { id: "heavy", label: "Starker Regen" },
  { id: "cold", label: "Kalt" },
  { id: "frost", label: "Frost" },
  { id: "wind", label: "Wind" },
  { id: "mixed", label: "Wechselhaft" },
];
function price(p: Product) {
  return p.price === null
    ? "Preis offen"
    : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`;
}
export function RiderWorkspace(props: Props) {
  const {
    view,
    filters,
    list,
    allProducts,
    favorites,
    compared,
    outfit,
    chosen,
    experience,
    onFilter,
    onNavigate,
    onRegion,
  } = props;
  const [selection, setSelection] = useState({ key: "", id: "" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => setEditing(false), [view]);
  const key = view === "favorites" ? "favorites" : JSON.stringify(filters);
  const available =
    view === "favorites"
      ? allProducts.filter((p) => favorites.includes(p.id))
      : list;
  const product = currentProduct(
    available,
    selection.key === key ? selection.id : "",
  );
  const index = product ? available.findIndex((p) => p.id === product.id) : -1;
  const total = totalOf(chosen);
  const region = regions.find((r) => r.id === filters.region);
  const activeFilters =
    filters.weather.length +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.photoOnly ? 1 : 0) +
    (filters.group && filters.group !== "all" ? 1 : 0) +
    (filters.vehicle !== "bike" ? 1 : 0) +
    (filters.shift !== "medium" ? 1 : 0);
  const move = (direction: -1 | 1) => {
    const next = adjacentProduct(available, product?.id ?? "", direction);
    if (next) setSelection({ key, id: next.id });
  };
  const choose = (p: Product) => {
    setSelection({ key, id: p.id });
    setPickerOpen(false);
  };
  const selectRegion = (r: Region) => {
    if (view === "extras") onFilter("region", r);
    else onRegion(r);
  };
  const showPhotos = () => {
    props.onReset();
    onFilter("region", "all");
    onFilter("photoOnly", true);
    onNavigate("ausruestung");
  };
  return (
    <section
      className={`rider-workspace ${editing ? "is-editing" : ""}`}
      aria-label={tr("Interaktiver Ausrüstungskonfigurator")}
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches("input")) setEditing(true);
      }}
      onBlurCapture={(e) => {
        if (!(e.relatedTarget as HTMLElement | null)?.matches?.("input"))
          setEditing(false);
      }}
    >
      <div className="workspace-scene">
        <div className="studio-title">
          <div>
            <span className="eyebrow">{tr("DEIN RIDER-STUDIO")}</span>
            <h1>
              {tr("Ein Setup.")}
              <br />
              <em>{tr("Deine Schicht.")}</em>
            </h1>
            <p>
              {tr(
                "K\u00F6rperbereich antippen. Ausr\u00FCstung ausw\u00E4hlen.",
              )}
            </p>
          </div>
          <label className="studio-style">
            <span>{tr("Rider-Style")}</span>
            <select
              aria-label={tr("Rider-Style wählen")}
              value={experience.style}
              onChange={(e) =>
                experience.setStyle(e.target.value as typeof experience.style)
              }
            >
              {riderStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {tr(s.label)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Rider
          selected={filters.region}
          onSelect={selectRegion}
          style={experience.style}
          enable3d={experience.enable3d}
          motion={experience.motion}
          constrained={experience.constrained}
          onRequest3d={experience.request3d}
        />
        <div className="studio-status">
          <span>
            <span className="pulse-dot" />
            {allProducts.length}
            {tr(" recherchierte Artikel")}
          </span>
          <button onClick={showPhotos}>
            <Camera size={14} />
            {tr("Echte Produktfotos")}
          </button>
        </div>
        <p className="studio-community">
          {tr(
            "Unabh\u00E4ngiges Community-Projekt f\u00FCr Lieferfahrer in Aschaffenburg. Keine offizielle Website von Flink.",
          )}
        </p>
      </div>
      <div className="workspace-controls">
        <div
          className="workspace-regions"
          role="group"
          aria-label={tr("Körperregion auswählen")}
        >
          {regions.map((r, i) => (
            <button
              key={r.id}
              aria-pressed={filters.region === r.id}
              onClick={() => selectRegion(r.id)}
            >
              <span>
                {tr("0")}
                {i + 1}
              </span>
              {tr(r.short)}
              {outfit.primary[r.id] && (
                <Check
                  className="region-complete"
                  size={11}
                  aria-label={tr("Artikel im Outfit")}
                />
              )}
            </button>
          ))}
        </div>
        <div
          className="workspace-budget"
          role="group"
          aria-label={tr("Budget auswählen")}
        >
          {(["all", "budget", "value", "premium"] as const).map((t) => (
            <button
              key={t}
              aria-pressed={filters.tier === t}
              onClick={() => {
                onFilter("tier", t);
                if (view !== "products" && view !== "extras")
                  onNavigate(
                    filters.supplementsOnly ? "extras" : "ausruestung",
                  );
              }}
            >
              {tr(t === "all" ? "Alle Budgets" : tierLabels[t])}
            </button>
          ))}
          <button
            className="workspace-filter-shortcut"
            aria-label={tr("Filter öffnen")}
            onClick={() => onNavigate("filter")}
          >
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && <b>{activeFilters}</b>}
          </button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {tr(
          (view === "products" || view === "favorites" || view === "extras") &&
            product
            ? tr("{name}, {price}, Artikel {index} von {total}", {
                name: product.name,
                price: price(product),
                index: index + 1,
                total: available.length,
              })
            : view === "filters"
              ? tr("{count} Artikel passen zu deinen Filtern.", {
                  count: list.length,
                })
              : view === "outfit"
                ? tr("{count} Artikel im Outfit.", { count: chosen.length })
                : "",
        )}
      </p>
      <div
        className={`workspace-panel panel-${view}`}
        id="workspace-panel"
        tabIndex={-1}
        aria-label={tr(
          {
            products: "Produktauswahl",
            filters: "Filter",
            outfit: "Dein Outfit",
            favorites: "Merkliste",
            kits: "Fertige Sets",
            extras: "Winter-Zubehör",
          }[view],
        )}
      >
        {(view === "products" || view === "favorites" || view === "extras") && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">
                  {tr(
                    view === "extras"
                      ? "WINTER-ZUBEHÖR"
                      : view === "favorites"
                        ? "DEINE MERKLISTE"
                        : (region?.label.toUpperCase() ??
                          "ALLE KÖRPERBEREICHE"),
                  )}
                </span>
                <strong>
                  {tr(
                    view === "extras"
                      ? "Wärmeextras und kleine Helfer für deine Schicht"
                      : view === "favorites"
                        ? "Für später gespeichert"
                        : (region?.hint ??
                          "Ausrüstung mit echten Produktfotos"),
                  )}
                </strong>
              </div>
              <button
                className="workspace-list-toggle"
                onClick={() => setPickerOpen(true)}
                disabled={!available.length}
                aria-label={tr("Alle {0} Produkte anzeigen", {
                  "0": available.length,
                })}
              >
                <List size={17} />
                <span>
                  {available.length}
                  {tr(" Artikel")}
                </span>
              </button>
            </div>
            {product ? (
              <>
                <div className="workspace-product-nav">
                  <button
                    aria-label={tr("Vorheriges Produkt")}
                    onClick={() => move(-1)}
                    disabled={index === 0}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span aria-live="polite">
                    {tr("Artikel {0} von {1}", {
                      "0": index + 1,
                      "1": available.length,
                    })}
                  </span>
                  <button
                    aria-label={tr("Nächstes Produkt")}
                    onClick={() => move(1)}
                    disabled={index === available.length - 1}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <CompactProduct
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(product.id)}
                  compared={compared.includes(product.id)}
                  selected={chosen.some((p) => p.id === product.id)}
                  onFavorite={() => props.onFavorite(product)}
                  onCompare={() => props.onCompare(product)}
                  onDetails={() => props.onDetails(product)}
                  onAdd={() => props.onAdd(product)}
                />
              </>
            ) : (
              <div className="workspace-empty">
                <Search size={30} />
                <h2>
                  {tr(
                    view === "favorites"
                      ? "Deine Merkliste ist noch leer."
                      : "Kein passender Artikel.",
                  )}
                </h2>
                <p>
                  {tr(
                    view === "favorites"
                      ? "Tippe beim Produkt auf das Herz. Deine Auswahl bleibt auf deinem Gerät."
                      : "Passe Budget oder Filter an. Prüfe die verfügbaren Artikel.",
                  )}
                </p>
                <button
                  className="button"
                  onClick={() => {
                    if (view !== "favorites") props.onReset();
                    onNavigate("ausruestung");
                  }}
                >
                  {tr(
                    view === "favorites"
                      ? "Artikel entdecken"
                      : "Filter zurücksetzen",
                  )}
                </button>
              </div>
            )}
          </>
        )}
        {view === "filters" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">{tr("DEINE BEDINGUNGEN")}</span>
                <strong>{tr("Was brauchst du f\u00FCr die Schicht?")}</strong>
              </div>
              {editing ? (
                <button
                  className="text-button"
                  onClick={() => {
                    (document.activeElement as HTMLElement | null)?.blur();
                    setEditing(false);
                  }}
                >
                  {tr("Fertig")}
                </button>
              ) : (
                <button className="text-button" onClick={props.onReset}>
                  {tr("Zur\u00FCcksetzen")}
                </button>
              )}
            </div>
            <div className="workspace-panel-scroll filter-fields">
              <div className="workspace-input-row">
                <label>
                  <span>{tr("Maximaler Artikelpreis")}</span>
                  <div className="workspace-price-input">
                    <input
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="0.01"
                      aria-label={tr("Maximaler Artikelpreis")}
                      value={filters.maxPrice ?? ""}
                      placeholder={tr("Kein Limit")}
                      onChange={(e) =>
                        onFilter(
                          "maxPrice",
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value)),
                        )
                      }
                    />
                    <span>{tr("\u20AC")}</span>
                  </div>
                </label>
                <label>
                  <span>{tr("Sortierung")}</span>
                  <select
                    aria-label={tr("Produkte sortieren")}
                    value={filters.sort}
                    onChange={(e) =>
                      onFilter("sort", e.target.value as Filters["sort"])
                    }
                  >
                    <option value="relevance">{tr("Passende zuerst")}</option>
                    <option value="price">{tr("Niedrigster Preis")}</option>
                    <option value="score">{tr("H\u00F6chste Eignung")}</option>
                  </select>
                </label>
              </div>
              <label className="workspace-search">
                <span>{tr("Produkt, Marke oder H\u00E4ndler")}</span>
                <div>
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label={tr("Produkte suchen")}
                    placeholder={tr("Zum Beispiel Action oder Handschuhe")}
                    value={filters.search}
                    onChange={(e) => onFilter("search", e.target.value)}
                  />
                </div>
              </label>
              <fieldset>
                <legend>
                  <CloudRain size={15} />
                  {tr("Wetter \u00B7 Mehrfachauswahl")}
                </legend>
                <div className="workspace-chips">
                  {weatherOptions.map((w) => (
                    <button
                      key={w.id}
                      aria-pressed={filters.weather.includes(w.id)}
                      onClick={() =>
                        onFilter(
                          "weather",
                          filters.weather.includes(w.id)
                            ? filters.weather.filter((x) => x !== w.id)
                            : [...filters.weather, w.id],
                        )
                      }
                    >
                      {tr(w.label)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <Bike size={15} />
                  {tr("Fahrzeug")}
                </legend>
                <div className="workspace-chips">
                  {(
                    [
                      { id: "bike", label: "Fahrrad" },
                      { id: "ebike", label: "E-Bike" },
                      { id: "scooter", label: "Motorroller" },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      aria-pressed={filters.vehicle === v.id}
                      onClick={() => onFilter("vehicle", v.id)}
                    >
                      {tr(v.label)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="workspace-field">
                <span>{tr("Schichtdauer")}</span>
                <select
                  aria-label={tr("Schichtdauer")}
                  value={filters.shift}
                  onChange={(e) =>
                    onFilter("shift", e.target.value as Filters["shift"])
                  }
                >
                  <option value="short">{tr("Kurze Schicht")}</option>
                  <option value="medium">{tr("4\u20136 Stunden")}</option>
                  <option value="long">
                    {tr("6\u20138 Stunden oder l\u00E4nger")}
                  </option>
                </select>
              </label>
              <label className="workspace-field">
                <span>{tr("Produktgruppe")}</span>
                <select
                  aria-label={tr("Produktgruppe")}
                  value={filters.group ?? "all"}
                  onChange={(e) =>
                    onFilter("group", e.target.value as Filters["group"])
                  }
                >
                  <option value="all">{tr("Alle passenden Gruppen")}</option>
                  {Object.entries(groupLabels)
                    .filter(([g]) =>
                      allProducts.some(
                        (p) =>
                          p.group === g &&
                          (filters.region === "all" ||
                            p.region === filters.region),
                      ),
                    )
                    .map(([g, label]) => (
                      <option key={g} value={g}>
                        {tr(label)}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="workspace-check"
                aria-pressed={!!filters.photoOnly}
                onClick={() => onFilter("photoOnly", !filters.photoOnly)}
              >
                <span>{filters.photoOnly && <Check size={15} />}</span>
                {tr("Nur Artikel mit echtem Produktfoto")}
              </button>
              <button
                className="workspace-check"
                aria-pressed={filters.region === "all"}
                onClick={() =>
                  onFilter(
                    "region",
                    filters.region === "all" ? "haende" : "all",
                  )
                }
              >
                <span>{filters.region === "all" && <Check size={15} />}</span>
                {tr("Alle K\u00F6rperregionen durchsuchen")}
              </button>
              <p className="workspace-filter-note">
                {tr(
                  filters.vehicle === "scooter"
                    ? "Motorroller benötigen zusätzliche Motorrad-Schutzausrüstung. Radschuh-Systeme und Fahrrad-Lenkerstulpen werden ausgeblendet."
                    : filters.vehicle === "ebike"
                      ? "Auf dem E-Bike kann weniger Eigenwärme entstehen. Wärmeschichten und Pausen einplanen."
                      : "Aktives Treten erzeugt Wärme. Belüftung und Feuchtetransport bleiben wichtig.",
                )}
                {tr(" ")}
                {tr(
                  "Die Filter beruhen auf dokumentierten Eigenschaften; keine Garantie f\u00FCr eine ganze Schicht.",
                )}
              </p>
            </div>
            <button
              className="button workspace-apply"
              onClick={() =>
                onNavigate(filters.supplementsOnly ? "extras" : "ausruestung")
              }
            >
              {list.length}
              {tr(" passende Artikel ansehen")}
              <ArrowRight size={17} />
            </button>
          </>
        )}
        {view === "outfit" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">{tr("DEIN WINTER-OUTFIT")}</span>
                <strong>
                  {chosen.length}
                  {tr(" Artikel \u00B7 dein eigener Mix")}
                </strong>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("sets")}
              >
                {tr("Fertige Sets")}
              </button>
            </div>
            <div className="workspace-panel-scroll workspace-outfit-list">
              {regions.map((r) => {
                const p = allProducts.find(
                  (p) => p.id === outfit.primary[r.id],
                );
                return (
                  <div className="workspace-outfit-row" key={r.id}>
                    {p ? (
                      <ProductImage product={p} compact />
                    ) : (
                      <div className="empty-slot">
                        <Plus size={19} />
                      </div>
                    )}
                    <button
                      className="outfit-row-title"
                      onClick={() =>
                        p ? props.onDetails(p) : selectRegion(r.id)
                      }
                    >
                      <small>{tr(r.label)}</small>
                      <strong>{tr(p ? p.name : "Artikel auswählen")}</strong>
                      {p && <span>{tr(price(p))}</span>}
                    </button>
                    <button
                      className="outfit-row-change"
                      onClick={() => selectRegion(r.id)}
                      aria-label={tr("Artikel f\u00FCr {0} {1}", {
                        "0": r.label,
                        "1": p ? "ändern" : "auswählen",
                      })}
                    >
                      {tr(p ? "Ändern" : "Wählen")}
                    </button>
                    {p && (
                      <button
                        className="outfit-row-remove"
                        onClick={() => props.onRemove(p)}
                        aria-label={tr("Aus Outfit entfernen: {0}", {
                          "0": p.name,
                        })}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
              <label className="workspace-field extra-field">
                <span>
                  {tr("Zus\u00E4tzliche Schicht oder Ausr\u00FCstung")}
                </span>
                <select
                  aria-label={tr("Zusätzlichen Artikel hinzufügen")}
                  value=""
                  onChange={(e) =>
                    e.target.value && props.onExtra(e.target.value)
                  }
                >
                  <option value="">
                    {tr(
                      "W\u00E4rmepads, Unterw\u00E4sche, Socken, Pogies \u2026",
                    )}
                  </option>
                  {allProducts
                    .filter((p) => !chosen.some((c) => c.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {tr(p.brand)}
                        {tr(" \u00B7 ")}
                        {tr(p.name)}
                        {tr(" \u00B7 ")}
                        {tr(price(p))}
                      </option>
                    ))}
                </select>
              </label>
              {outfit.extras.map((id) => {
                const p = allProducts.find((p) => p.id === id)!;
                const link = shopLink(p);
                return (
                  <div className="workspace-extra-row" key={id}>
                    <button onClick={() => props.onDetails(p)}>
                      {tr(p.name)}
                      <small>{tr(price(p))}</small>
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel={
                        link.affiliate
                          ? "sponsored noopener noreferrer"
                          : "noopener noreferrer"
                      }
                      aria-label={tr("H\u00E4ndler \u00F6ffnen: {0}", {
                        "0": p.name,
                      })}
                    >
                      <ArrowUpRight size={17} />
                    </a>
                    <button
                      onClick={() => props.onRemove(p)}
                      aria-label={tr("Zusatzartikel entfernen: {0}", {
                        "0": p.name,
                      })}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              {chosen.length > 0 && (
                <div className="workspace-shop-list">
                  <span>{tr("EINZELN BEIM H\u00C4NDLER \u00D6FFNEN")}</span>
                  {chosen.map((p) => {
                    const link = shopLink(p);
                    return (
                      <a
                        key={p.id}
                        href={link.url}
                        target="_blank"
                        rel={
                          link.affiliate
                            ? "sponsored noopener noreferrer"
                            : "noopener noreferrer"
                        }
                      >
                        <span>
                          {tr(p.name)}
                          <small>
                            {tr(p.shop)}
                            {tr(p.retailOnly ? " · nur Filiale" : "")}
                            {tr(link.affiliate ? " · " + link.label : "")}
                          </small>
                        </span>
                        <ArrowUpRight size={16} />
                      </a>
                    );
                  })}
                </div>
              )}
              <p className="workspace-filter-note">
                {tr(
                  "Beobachtete Preise, keine Livepreise; zzgl. Versand. Helm, Licht und geeignete Schutzausr\u00FCstung erg\u00E4nzen. Socken und \u00DCberschuhe ersetzen keinen Schuh.",
                )}
              </p>
              <button
                className="text-button"
                disabled={!chosen.length}
                onClick={props.onClearOutfit}
              >
                <Trash2 size={14} />
                {tr("Auswahl leeren")}
              </button>
            </div>
            <div className="workspace-outfit-total">
              <div>
                <span>
                  {tr(
                    total.complete
                      ? "Beobachtete Artikelsumme"
                      : "Bekannte Teilsumme",
                  )}
                </span>
                <strong data-testid="outfit-total">
                  {tr(total.from ? "ab " : "")}
                  {tr(money(total.amount))}
                </strong>
              </div>
              <button
                className="button"
                disabled={!chosen.length}
                onClick={props.onCopy}
              >
                {tr("Liste kopieren")}
              </button>
            </div>
          </>
        )}
        {view === "kits" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">
                  {tr("IN EINEM SCHRITT STARTKLAR")}
                </span>
                <strong>{tr("Ein Set laden. Danach anpassen.")}</strong>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("outfit")}
              >
                {tr("Mein Outfit")}
              </button>
            </div>
            <div className="workspace-panel-scroll workspace-kits">
              {kits.map((kit, i) => {
                const selected = [
                  ...Object.values(kit.outfit.primary),
                  ...kit.outfit.extras,
                ].map((id) => allProducts.find((p) => p.id === id)!);
                const sum = totalOf(selected);
                return (
                  <article key={kit.id}>
                    <div>
                      <span>
                        {tr("0")}
                        {i + 1}
                      </span>
                      <strong>{tr(kit.name)}</strong>
                      <b>
                        {tr(sum.from ? "ab " : "")}
                        {tr(money(sum.amount))}
                      </b>
                    </div>
                    <p>{tr(kit.description)}</p>
                    <button
                      className="button"
                      onClick={() => props.onUseKit(kit.outfit)}
                    >
                      {tr("Set \u00FCbernehmen")}
                      <ArrowRight size={16} />
                    </button>
                    <small>
                      {selected.length}
                      {tr(
                        " Artikel \u00B7 beobachtete Summe \u00B7 zzgl. Versand",
                      )}
                    </small>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
      <nav
        className="workspace-dock"
        aria-label={tr("Konfigurator-Navigation")}
      >
        {views.map(({ view: v, route, label, icon: Icon }) => (
          <a
            key={v}
            href={`#/${route}`}
            aria-current={
              view === v || (v === "outfit" && view === "kits")
                ? "page"
                : undefined
            }
          >
            <span>
              <Icon size={20} />
              {v === "outfit" && chosen.length > 0 && <b>{chosen.length}</b>}
              {v === "favorites" && favorites.length > 0 && (
                <b>{favorites.length}</b>
              )}
              {v === "filters" && activeFilters > 0 && <b>{activeFilters}</b>}
            </span>
            <small>
              {tr(label)}
              {v === "outfit" && chosen.length > 0 && (
                <em className="dock-total">
                  {tr(!total.complete ? "+ " : total.from ? "ab " : "")}
                  {tr(money(total.amount))}
                </em>
              )}
            </small>
          </a>
        ))}
        <button
          onClick={props.onCompareOpen}
          aria-label={tr("Vergleich \u00F6ffnen, {0} Produkte", {
            "0": compared.length,
          })}
        >
          <span>
            <GitCompareArrows size={20} />
            {compared.length > 0 && <b>{compared.length}</b>}
          </span>
          <small>{tr("Vergleich")}</small>
        </button>
      </nav>
      {pickerOpen && (
        <Modal
          title={tr("{0} Artikel \u00B7 {1}", {
            "0": available.length,
            "1":
              view === "favorites"
                ? "Merkliste"
                : (region?.label ?? "Alle Körperbereiche"),
          })}
          onClose={() => setPickerOpen(false)}
        >
          <div className="workspace-picker">
            {available.map((p) => (
              <button
                key={p.id}
                aria-pressed={p.id === product?.id}
                onClick={() => choose(p)}
              >
                <ProductImage product={p} compact />
                <span>
                  <small>
                    {tr(p.brand)}
                    {tr(" \u00B7 ")}
                    {tr(tierLabels[p.tier])}
                  </small>
                  <strong>{tr(p.name)}</strong>
                  <b>{tr(price(p))}</b>
                </span>
                {p.id === product?.id ? (
                  <Check size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </section>
  );
}
function CompactProduct({
  product: p,
  favorite,
  compared,
  selected,
  onFavorite,
  onCompare,
  onDetails,
  onAdd,
}: {
  product: Product;
  favorite: boolean;
  compared: boolean;
  selected: boolean;
  onFavorite: () => void;
  onCompare: () => void;
  onDetails: () => void;
  onAdd: () => void;
}) {
  const score = scoreOf(p),
    link = shopLink(p);
  return (
    <article className="workspace-product" data-product={p.id}>
      <div className="workspace-product-information">
        <div className="workspace-product-main">
          <div className="workspace-product-image">
            <ProductImage product={p} />
            <button
              className="workspace-heart"
              aria-pressed={favorite}
              aria-label={tr("{0}: {1}", {
                "0": favorite ? "Aus Merkliste entfernen" : "Merken",
                "1": p.name,
              })}
              onClick={onFavorite}
            >
              <Heart size={19} fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="workspace-product-copy">
            <span className="workspace-product-brand">
              {tr(p.brand)}
              {tr(" \u00B7 ")}
              {tr(p.shop)}
              {tr(p.retailOnly ? " · Filiale" : "")}
            </span>
            <h2>{tr(p.name)}</h2>
            <div className="workspace-product-price">
              <strong>{tr(price(p))}</strong>
              <button
                onClick={onDetails}
                aria-label={tr("Redaktionelle Eignung: {0}", {
                  "0":
                    score.score === null
                      ? "Daten unzureichend"
                      : score.score + " von 100 Punkten",
                })}
              >
                <b>{tr(score.score ?? "–")}</b>
                <small>
                  {tr(score.score === null ? "Daten offen" : "/ 100")}
                </small>
              </button>
            </div>
            <span className="workspace-tier">
              {tr(p.badge?.label ?? tierLabels[p.tier])}
            </span>
          </div>
        </div>
        <div className="workspace-attributes">
          <span>
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
        <ul className="workspace-pros">
          {p.pros.map((s) => (
            <li key={s}>
              <Check size={13} />
              {tr(s)}
            </li>
          ))}
        </ul>
        {p.caution && <p className="accessory-caution">{tr(p.caution)}</p>}
      </div>
      <div className="workspace-product-tools">
        <button onClick={onDetails}>
          {tr("Details & Grenzen")}
          <ArrowUpRight size={14} />
        </button>
        <button aria-pressed={compared} onClick={onCompare}>
          <GitCompareArrows size={15} />
          {tr(compared ? "Im Vergleich" : "Vergleichen")}
        </button>
      </div>
      <div className="workspace-product-actions">
        <button
          className={`button ${selected ? "selected" : ""}`}
          disabled={selected}
          onClick={onAdd}
        >
          {selected ? <Check size={17} /> : <Plus size={17} />}
          {tr(" ")}
          {tr(selected ? "Im Outfit" : "Zum Outfit")}
        </button>
        <a
          className="button outline"
          href={link.url}
          target="_blank"
          rel={
            link.affiliate
              ? "sponsored noopener noreferrer"
              : "noopener noreferrer"
          }
        >
          {tr(p.retailOnly ? "Produktseite" : "Zum Händler")}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <p className="workspace-price-note">
        {tr("Preispr\u00FCfung ")}
        {tr(dateLabel(p.checked))}
        {tr(" \u00B7 zzgl. Versand")}
        {tr(p.retailOnly ? " · nur Filiale" : "")}
        {tr(link.affiliate ? " · " + link.label : "")}
      </p>
    </article>
  );
}
