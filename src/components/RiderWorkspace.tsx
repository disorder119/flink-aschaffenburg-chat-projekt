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
  { view: "outfit", route: "outfit", label: "Outfit", icon: Layers },
  { view: "favorites", route: "merkliste", label: "Merkliste", icon: Heart },
] as const;
const weatherOptions: { id: Weather; label: string }[] = [
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
    onRegion(r);
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
      aria-label="Interaktiver Ausrüstungskonfigurator"
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
            <span className="eyebrow">DEIN RIDER-STUDIO</span>
            <h1>
              Ein Setup.
              <br />
              <em>Deine Schicht.</em>
            </h1>
            <p>Körperbereich antippen. Ausrüstung auswählen.</p>
          </div>
          <label className="studio-style">
            <span>Rider-Style</span>
            <select
              aria-label="Rider-Style wählen"
              value={experience.style}
              onChange={(e) =>
                experience.setStyle(e.target.value as typeof experience.style)
              }
            >
              {riderStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
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
            {allProducts.length} recherchierte Artikel
          </span>
          <button onClick={showPhotos}>
            <Camera size={14} />
            Echte Produktfotos
          </button>
        </div>
        <p className="studio-community">
          Unabhängiges Community-Projekt für Lieferfahrer in Aschaffenburg.
          Keine offizielle Website von Flink.
        </p>
      </div>
      <div className="workspace-controls">
        <div
          className="workspace-regions"
          role="group"
          aria-label="Körperregion auswählen"
        >
          {regions.map((r, i) => (
            <button
              key={r.id}
              aria-pressed={filters.region === r.id}
              onClick={() => selectRegion(r.id)}
            >
              <span>0{i + 1}</span>
              {r.short}
              {outfit.primary[r.id] && (
                <Check
                  className="region-complete"
                  size={11}
                  aria-label="Artikel im Outfit"
                />
              )}
            </button>
          ))}
        </div>
        <div
          className="workspace-budget"
          role="group"
          aria-label="Budget auswählen"
        >
          {(["all", "budget", "value", "premium"] as const).map((t) => (
            <button
              key={t}
              aria-pressed={filters.tier === t}
              onClick={() => {
                onFilter("tier", t);
                if (view !== "products") onNavigate("ausruestung");
              }}
            >
              {t === "all" ? "Alle Budgets" : tierLabels[t]}
            </button>
          ))}
          <button
            className="workspace-filter-shortcut"
            aria-label="Filter öffnen"
            onClick={() => onNavigate("filter")}
          >
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && <b>{activeFilters}</b>}
          </button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {(view === "products" || view === "favorites") && product
          ? `${product.name}, ${price(product)}, Artikel ${index + 1} von ${available.length}`
          : view === "filters"
            ? `${list.length} Artikel passen zu deinen Filtern.`
            : view === "outfit"
              ? `${chosen.length} Artikel im Outfit.`
              : ""}
      </p>
      <div
        className={`workspace-panel panel-${view}`}
        id="workspace-panel"
        tabIndex={-1}
        aria-label={
          {
            products: "Produktauswahl",
            filters: "Filter",
            outfit: "Dein Outfit",
            favorites: "Merkliste",
            kits: "Fertige Sets",
          }[view]
        }
      >
        {(view === "products" || view === "favorites") && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">
                  {view === "favorites"
                    ? "DEINE MERKLISTE"
                    : (region?.label.toUpperCase() ?? "ALLE KÖRPERBEREICHE")}
                </span>
                <strong>
                  {view === "favorites"
                    ? "Für später gespeichert"
                    : (region?.hint ?? "Ausrüstung mit echten Produktfotos")}
                </strong>
              </div>
              <button
                className="workspace-list-toggle"
                onClick={() => setPickerOpen(true)}
                disabled={!available.length}
                aria-label={`Alle ${available.length} Produkte anzeigen`}
              >
                <List size={17} />
                <span>{available.length} Artikel</span>
              </button>
            </div>
            {product ? (
              <>
                <div className="workspace-product-nav">
                  <button
                    aria-label="Vorheriges Produkt"
                    onClick={() => move(-1)}
                    disabled={index === 0}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span aria-live="polite">
                    Artikel {index + 1} von {available.length}
                  </span>
                  <button
                    aria-label="Nächstes Produkt"
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
                  {view === "favorites"
                    ? "Deine Merkliste ist noch leer."
                    : "Kein passender Artikel."}
                </h2>
                <p>
                  {view === "favorites"
                    ? "Tippe beim Produkt auf das Herz. Deine Auswahl bleibt auf deinem Gerät."
                    : "Passe Budget oder Filter an. Nicht jeder Körperbereich hat bereits ein echtes Produktfoto."}
                </p>
                <button
                  className="button"
                  onClick={() => {
                    if (view !== "favorites") props.onReset();
                    onNavigate("ausruestung");
                  }}
                >
                  {view === "favorites"
                    ? "Artikel entdecken"
                    : "Filter zurücksetzen"}
                </button>
              </div>
            )}
          </>
        )}
        {view === "filters" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">DEINE BEDINGUNGEN</span>
                <strong>Was brauchst du für die Schicht?</strong>
              </div>
              {editing ? (
                <button
                  className="text-button"
                  onClick={() => {
                    (document.activeElement as HTMLElement | null)?.blur();
                    setEditing(false);
                  }}
                >
                  Fertig
                </button>
              ) : (
                <button className="text-button" onClick={props.onReset}>
                  Zurücksetzen
                </button>
              )}
            </div>
            <div className="workspace-panel-scroll filter-fields">
              <div className="workspace-input-row">
                <label>
                  <span>Maximaler Artikelpreis</span>
                  <div className="workspace-price-input">
                    <input
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="0.01"
                      aria-label="Maximaler Artikelpreis"
                      value={filters.maxPrice ?? ""}
                      placeholder="Kein Limit"
                      onChange={(e) =>
                        onFilter(
                          "maxPrice",
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value)),
                        )
                      }
                    />
                    <span>€</span>
                  </div>
                </label>
                <label>
                  <span>Sortierung</span>
                  <select
                    aria-label="Produkte sortieren"
                    value={filters.sort}
                    onChange={(e) =>
                      onFilter("sort", e.target.value as Filters["sort"])
                    }
                  >
                    <option value="relevance">Passende zuerst</option>
                    <option value="price">Niedrigster Preis</option>
                    <option value="score">Höchste Eignung</option>
                  </select>
                </label>
              </div>
              <label className="workspace-search">
                <span>Produkt, Marke oder Händler</span>
                <div>
                  <Search size={17} />
                  <input
                    type="search"
                    aria-label="Produkte suchen"
                    placeholder="Zum Beispiel Action oder Handschuhe"
                    value={filters.search}
                    onChange={(e) => onFilter("search", e.target.value)}
                  />
                </div>
              </label>
              <fieldset>
                <legend>
                  <CloudRain size={15} />
                  Wetter · Mehrfachauswahl
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
                      {w.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <Bike size={15} />
                  Fahrzeug
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
                      {v.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="workspace-field">
                <span>Schichtdauer</span>
                <select
                  aria-label="Schichtdauer"
                  value={filters.shift}
                  onChange={(e) =>
                    onFilter("shift", e.target.value as Filters["shift"])
                  }
                >
                  <option value="short">Kurze Schicht</option>
                  <option value="medium">4–6 Stunden</option>
                  <option value="long">6–8 Stunden oder länger</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Produktgruppe</span>
                <select
                  aria-label="Produktgruppe"
                  value={filters.group ?? "all"}
                  onChange={(e) =>
                    onFilter("group", e.target.value as Filters["group"])
                  }
                >
                  <option value="all">Alle passenden Gruppen</option>
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
                        {label}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="workspace-check"
                aria-pressed={!!filters.photoOnly}
                onClick={() => onFilter("photoOnly", !filters.photoOnly)}
              >
                <span>{filters.photoOnly && <Check size={15} />}</span>Nur
                Artikel mit echtem Produktfoto
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
                Alle Körperregionen durchsuchen
              </button>
              <p className="workspace-filter-note">
                {filters.vehicle === "scooter"
                  ? "Motorroller benötigen zusätzliche Motorrad-Schutzausrüstung. Radschuh-Systeme und Fahrrad-Lenkerstulpen werden ausgeblendet."
                  : filters.vehicle === "ebike"
                    ? "Auf dem E-Bike kann weniger Eigenwärme entstehen. Wärmeschichten und Pausen einplanen."
                    : "Aktives Treten erzeugt Wärme. Belüftung und Feuchtetransport bleiben wichtig."}{" "}
                Die Filter beruhen auf dokumentierten Eigenschaften; keine
                Garantie für eine ganze Schicht.
              </p>
            </div>
            <button
              className="button workspace-apply"
              onClick={() => onNavigate("ausruestung")}
            >
              {list.length} passende Artikel ansehen
              <ArrowRight size={17} />
            </button>
          </>
        )}
        {view === "outfit" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">DEIN WINTER-OUTFIT</span>
                <strong>{chosen.length} Artikel · dein eigener Mix</strong>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("sets")}
              >
                Fertige Sets
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
                      <small>{r.label}</small>
                      <strong>{p ? p.name : "Artikel auswählen"}</strong>
                      {p && <span>{price(p)}</span>}
                    </button>
                    <button
                      className="outfit-row-change"
                      onClick={() => selectRegion(r.id)}
                      aria-label={`Artikel für ${r.label} ${p ? "ändern" : "auswählen"}`}
                    >
                      {p ? "Ändern" : "Wählen"}
                    </button>
                    {p && (
                      <button
                        className="outfit-row-remove"
                        onClick={() => props.onRemove(p)}
                        aria-label={`Aus Outfit entfernen: ${p.name}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
              <label className="workspace-field extra-field">
                <span>Zusätzliche Schicht oder Ausrüstung</span>
                <select
                  aria-label="Zusätzlichen Artikel hinzufügen"
                  value=""
                  onChange={(e) =>
                    e.target.value && props.onExtra(e.target.value)
                  }
                >
                  <option value="">Unterwäsche, Socken, Pogies …</option>
                  {allProducts
                    .filter((p) => !chosen.some((c) => c.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} · {p.name} · {price(p)}
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
                      {p.name}
                      <small>{price(p)}</small>
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel={
                        link.affiliate
                          ? "sponsored noopener noreferrer"
                          : "noopener noreferrer"
                      }
                      aria-label={`Händler öffnen: ${p.name}`}
                    >
                      <ArrowUpRight size={17} />
                    </a>
                    <button
                      onClick={() => props.onRemove(p)}
                      aria-label={`Zusatzartikel entfernen: ${p.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              {chosen.length > 0 && (
                <div className="workspace-shop-list">
                  <span>EINZELN BEIM HÄNDLER ÖFFNEN</span>
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
                          {p.name}
                          <small>
                            {p.shop}
                            {p.retailOnly ? " · nur Filiale" : ""}
                            {link.affiliate ? " · " + link.label : ""}
                          </small>
                        </span>
                        <ArrowUpRight size={16} />
                      </a>
                    );
                  })}
                </div>
              )}
              <p className="workspace-filter-note">
                Beobachtete Preise, keine Livepreise; zzgl. Versand. Helm, Licht
                und geeignete Schutzausrüstung ergänzen. Socken und Überschuhe
                ersetzen keinen Schuh.
              </p>
              <button
                className="text-button"
                disabled={!chosen.length}
                onClick={props.onClearOutfit}
              >
                <Trash2 size={14} />
                Auswahl leeren
              </button>
            </div>
            <div className="workspace-outfit-total">
              <div>
                <span>
                  {total.complete
                    ? "Beobachtete Artikelsumme"
                    : "Bekannte Teilsumme"}
                </span>
                <strong data-testid="outfit-total">
                  {total.from ? "ab " : ""}
                  {money(total.amount)}
                </strong>
              </div>
              <button
                className="button"
                disabled={!chosen.length}
                onClick={props.onCopy}
              >
                Liste kopieren
              </button>
            </div>
          </>
        )}
        {view === "kits" && (
          <>
            <div className="workspace-panel-heading">
              <div>
                <span className="eyebrow">IN EINEM SCHRITT STARTKLAR</span>
                <strong>Ein Set laden. Danach anpassen.</strong>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("outfit")}
              >
                Mein Outfit
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
                      <span>0{i + 1}</span>
                      <strong>{kit.name}</strong>
                      <b>
                        {sum.from ? "ab " : ""}
                        {money(sum.amount)}
                      </b>
                    </div>
                    <p>{kit.description}</p>
                    <button
                      className="button"
                      onClick={() => props.onUseKit(kit.outfit)}
                    >
                      Set übernehmen
                      <ArrowRight size={16} />
                    </button>
                    <small>
                      {selected.length} Artikel · beobachtete Summe · zzgl.
                      Versand
                    </small>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
      <nav className="workspace-dock" aria-label="Konfigurator-Navigation">
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
              {label}
              {v === "outfit" && chosen.length > 0 && (
                <em className="dock-total">
                  {!total.complete ? "+ " : total.from ? "ab " : ""}
                  {money(total.amount)}
                </em>
              )}
            </small>
          </a>
        ))}
        <button
          onClick={props.onCompareOpen}
          aria-label={`Vergleich öffnen, ${compared.length} Produkte`}
        >
          <span>
            <GitCompareArrows size={20} />
            {compared.length > 0 && <b>{compared.length}</b>}
          </span>
          <small>Vergleich</small>
        </button>
      </nav>
      {pickerOpen && (
        <Modal
          title={`${available.length} Artikel · ${view === "favorites" ? "Merkliste" : (region?.label ?? "Alle Körperbereiche")}`}
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
                    {p.brand} · {tierLabels[p.tier]}
                  </small>
                  <strong>{p.name}</strong>
                  <b>{price(p)}</b>
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
              aria-label={`${favorite ? "Aus Merkliste entfernen" : "Merken"}: ${p.name}`}
              onClick={onFavorite}
            >
              <Heart size={19} fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="workspace-product-copy">
            <span className="workspace-product-brand">
              {p.brand} · {p.shop}
              {p.retailOnly ? " · Filiale" : ""}
            </span>
            <h2>{p.name}</h2>
            <div className="workspace-product-price">
              <strong>{price(p)}</strong>
              <button
                onClick={onDetails}
                aria-label={`Redaktionelle Eignung: ${score.score === null ? "Daten unzureichend" : score.score + " von 100 Punkten"}`}
              >
                <b>{score.score ?? "–"}</b>
                <small>{score.score === null ? "Daten offen" : "/ 100"}</small>
              </button>
            </div>
            <span className="workspace-tier">
              {p.badge?.label ?? tierLabels[p.tier]}
            </span>
          </div>
        </div>
        <div className="workspace-attributes">
          <span>
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
        <ul className="workspace-pros">
          {p.pros.map((s) => (
            <li key={s}>
              <Check size={13} />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="workspace-product-tools">
        <button onClick={onDetails}>
          Details & Grenzen
          <ArrowUpRight size={14} />
        </button>
        <button aria-pressed={compared} onClick={onCompare}>
          <GitCompareArrows size={15} />
          {compared ? "Im Vergleich" : "Vergleichen"}
        </button>
      </div>
      <div className="workspace-product-actions">
        <button
          className={`button ${selected ? "selected" : ""}`}
          disabled={selected}
          onClick={onAdd}
        >
          {selected ? <Check size={17} /> : <Plus size={17} />}{" "}
          {selected ? "Im Outfit" : "Zum Outfit"}
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
          {p.retailOnly ? "Produktseite" : "Zum Händler"}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <p className="workspace-price-note">
        Preisprüfung {dateLabel(p.checked)} · zzgl. Versand
        {p.retailOnly ? " · nur Filiale" : ""}
        {link.affiliate ? " · " + link.label : ""}
      </p>
    </article>
  );
}
