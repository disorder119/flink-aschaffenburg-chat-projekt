import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Check,
  ChevronDown,
  Clipboard,
  CloudRain,
  GitCompareArrows,
  Heart,
  Layers,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sun,
  Trash2,
  Wind,
  X,
  Zap,
} from "lucide-react";
import type { Filters, Product, Region, Weather } from "./types";
import { products, RESEARCH_DATE } from "./data/products";
import { kits, type Outfit } from "./data/kits";
import {
  compareAllowed,
  criterionLabels,
  dateLabel,
  filteredProducts,
  groupLabels,
  money,
  regions,
  scoreOf,
  shoppingList,
  tierLabels,
  totalOf,
  weights,
} from "./lib/logic";
import { shopLink } from "./config/affiliate";
import { operator } from "./config/operator";
import { Rider } from "./components/Rider";
import { ProductCard, waterLabels } from "./components/ProductCard";
import { GearArt } from "./components/GearArt";
import { Modal } from "./components/Modal";
const initialFilters: Filters = {
  region: "haende",
  tier: "all",
  maxPrice: null,
  search: "",
  weather: [],
  vehicle: "bike",
  shift: "medium",
  sort: "relevance",
  favoritesOnly: false,
};
const weatherOptions: { id: Weather; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Leichter Regen", icon: CloudRain },
  { id: "heavy", label: "Starker Regen", icon: CloudRain },
  { id: "cold", label: "Kalt", icon: Snowflake },
  { id: "frost", label: "Frost", icon: Snowflake },
  { id: "wind", label: "Wind", icon: Wind },
  { id: "mixed", label: "Wechselhaft", icon: Sun },
];
function readLocal<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function safeOutfit(): Outfit {
  const candidate = readLocal<Outfit>("rider-outfit-v1", {
    primary: {},
    extras: [],
  });
  if (
    !candidate ||
    !candidate.primary ||
    typeof candidate.primary !== "object" ||
    !Array.isArray(candidate.extras)
  )
    return { primary: {}, extras: [] };
  return {
    primary: Object.fromEntries(
      Object.entries(candidate.primary).filter(
        ([r, id]) =>
          regions.some((x) => x.id === r) &&
          products.some((p) => p.id === id && p.region === r),
      ),
    ),
    extras: candidate.extras.filter((id) => products.some((p) => p.id === id)),
  };
}
const productById = (id: string) => products.find((p) => p.id === id);
export function outfitProducts(outfit: Outfit): Product[] {
  return [...new Set([...Object.values(outfit.primary), ...outfit.extras])]
    .map((id) => productById(id!))
    .filter((p): p is Product => !!p);
}
function KitCards({ onUse }: { onUse: (outfit: Outfit) => void }) {
  return (
    <div className="kit-grid">
      {kits.map((kit, i) => {
        const list = outfitProducts(kit.outfit);
        const total = totalOf(list);
        return (
          <article className={`kit-card kit-${kit.id}`} key={kit.id}>
            <div className="kit-top">
              <span>0{i + 1}</span>
              <span>
                {i === 0
                  ? "KLEINES BUDGET"
                  : i === 1
                    ? "UNSER ALLTAGSMIX"
                    : "HÄUFIG UNTERWEGS"}
              </span>
            </div>
            <h3>{kit.name}</h3>
            <p className="kit-subtitle">{kit.subtitle}</p>
            <div className="kit-mini-art">
              <GearArt group="shell" />
              <GearArt group="glove" />
              <GearArt group="shoe" />
            </div>
            <p className="kit-description">{kit.description}</p>
            <div className="kit-price">
              <strong>
                {total.from ? "ab " : ""}
                {money(total.amount)}
              </strong>
              <span>
                {list.length} Artikel · zzgl. Versand
                <br />
                Beobachtete Summe, {dateLabel(RESEARCH_DATE)}
              </span>
            </div>
            <button className="button" onClick={() => onUse(kit.outfit)}>
              Set im Konfigurator öffnen
              <ArrowRight size={17} />
            </button>
          </article>
        );
      })}
    </div>
  );
}
export function App() {
  const [route, setRoute] = useState(location.hash.slice(2) || "");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const ids = readLocal<unknown>("rider-favorites-v1", []);
    return Array.isArray(ids)
      ? ids.filter(
          (id) => typeof id === "string" && products.some((p) => p.id === id),
        )
      : [];
  });
  const [outfit, setOutfit] = useState<Outfit>(safeOutfit);
  const [compare, setCompare] = useState<string[]>([]);
  const [details, setDetails] = useState<Product | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [copyFallback, setCopyFallback] = useState("");
  useEffect(() => {
    const handler = () => {
      setRoute(location.hash.slice(2) || "");
      setMenu(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    setDetails(null);
    setCompareOpen(false);
    setFavoritesOpen(false);
    if (route === "ausruestung")
      document
        .getElementById("ausruestung")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);
  useEffect(() => {
    try {
      localStorage.setItem("rider-favorites-v1", JSON.stringify(favorites));
      localStorage.setItem("rider-outfit-v1", JSON.stringify(outfit));
    } catch {
      setStorageError(true);
    }
  }, [favorites, outfit]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4800);
    return () => clearTimeout(timer);
  }, [toast]);
  const list = useMemo(
    () => filteredProducts(products, filters, favorites),
    [filters, favorites],
  );
  const chosen = outfitProducts(outfit);
  const total = totalOf(chosen);
  const compared = compare.map(productById).filter((p): p is Product => !!p);
  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((old) => ({ ...old, [key]: value }));
  const navigate = (path: string) => {
    location.hash = `#/${path}`;
    if (route === path && path === "ausruestung")
      document
        .getElementById("ausruestung")
        ?.scrollIntoView({ behavior: "smooth" });
  };
  const selectRegion = (r: Region) => {
    setFilter("region", r);
    navigate("ausruestung");
  };
  const favorite = (p: Product) =>
    setFavorites((ids) =>
      ids.includes(p.id) ? ids.filter((id) => id !== p.id) : [...ids, p.id],
    );
  const toggleCompare = (p: Product) => {
    if (compare.includes(p.id)) {
      setCompare((ids) => ids.filter((id) => id !== p.id));
      return;
    }
    const error = compareAllowed(compared, p);
    if (error) {
      setToast(error);
      return;
    }
    setCompare((ids) => [...ids, p.id]);
  };
  const addOutfit = (p: Product) => {
    if (chosen.some((x) => x.id === p.id)) {
      setToast("Dieser Artikel ist bereits in deinem Outfit.");
      return;
    }
    if (
      ["base", "liner", "sock", "cover"].includes(p.group) &&
      outfit.primary[p.region]
    )
      setOutfit((old) => ({ ...old, extras: [...old.extras, p.id] }));
    else
      setOutfit((old) => ({
        ...old,
        primary: { ...old.primary, [p.region]: p.id },
        extras: old.extras.filter((id) => id !== p.id),
      }));
    setToast(`${p.name} wurde zum Outfit hinzugefügt.`);
  };
  const useKit = (o: Outfit) => {
    setOutfit({ primary: { ...o.primary }, extras: [...o.extras] });
    navigate("outfit");
    setToast("Set geladen. Du kannst jeden Artikel austauschen.");
  };
  const copyList = async () => {
    const text = shoppingList(chosen, (p) => {
      const link = shopLink(p);
      return link.url + (link.affiliate ? `\n${link.label}` : "");
    });
    try {
      await navigator.clipboard.writeText(text);
      setToast("Einkaufsliste kopiert.");
    } catch {
      setCopyFallback(text);
    }
  };
  const renderCard = (p: Product) => (
    <ProductCard
      key={p.id}
      product={p}
      favorite={favorites.includes(p.id)}
      compared={compare.includes(p.id)}
      inOutfit={chosen.some((x) => x.id === p.id)}
      onFavorite={() => favorite(p)}
      onCompare={() => toggleCompare(p)}
      onOutfit={() => addOutfit(p)}
      onDetails={() => setDetails(p)}
    />
  );
  const isHome = route === "" || route === "ausruestung";
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt
      </a>
      <header className="header">
        <div className="header-inner">
          <a
            className="brand"
            href="#/"
            aria-label="Flink Aschaffenburg Chat Projekt, Startseite"
          >
            <span className="brand-icon">
              <Bike size={25} />
            </span>
            <span>
              FLINK ASCHAFFENBURG<small>CHAT PROJEKT</small>
            </span>
          </a>
          <nav
            className={`navigation ${menu ? "open" : ""}`}
            aria-label="Hauptnavigation"
          >
            <a className={isHome ? "active" : ""} href="#/ausruestung">
              Ausrüstung
            </a>
            <a className={route === "outfit" ? "active" : ""} href="#/outfit">
              Winter-Outfit
            </a>
            <a className={route === "wissen" ? "active" : ""} href="#/wissen">
              Wissen
            </a>
          </nav>
          <div className="header-actions">
            <button
              className="saved-button"
              onClick={() => setFavoritesOpen(true)}
              aria-label={`Merkliste öffnen, ${favorites.length} Produkte`}
            >
              <Heart size={20} />
              <span>Merkliste</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>
            <button
              className="menu-button icon-button"
              aria-label="Menü öffnen"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        {isHome && (
          <>
            <section className="hero section-wrap">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span /> FÜR DIE, DIE DRAUSSEN LIEFERN
                </div>
                <h1>
                  Deine Schicht.
                  <br />
                  Dein Wetter.
                  <br />
                  <em>Deine Ausrüstung.</em>
                </h1>
                <p>
                  Regen auf der Jacke. Wind im Gesicht.
                  <br className="desktop-br" /> Gutes Equipment macht den
                  Unterschied.
                </p>
                <p className="hero-explanation">
                  Finde passende Ausrüstung für deinen Körper, dein Budget und
                  deinen Arbeitsalltag. Von günstigen Basics bis zum
                  durchdachten Winter-Outfit.
                </p>
                <a className="button hero-button" href="#/ausruestung">
                  Ausrüstung finden
                  <ArrowRight size={18} />
                </a>
                <div className="hero-note">
                  <ShieldCheck size={16} /> Echte Produkte. Klare Grenzen. Keine
                  erfundenen Tests.
                </div>
                <div className="hero-community">
                  <span>AB</span>
                  <div>
                    Für unsere Community in Aschaffenburg
                    <small>Unabhängig. Ohne Registrierung.</small>
                  </div>
                </div>
              </div>
              <Rider selected={filters.region} onSelect={selectRegion} />
            </section>
            <div className="trust-strip section-wrap">
              <div>
                <Search />
                <span>
                  <b>{products.length} recherchierte Produkte</b>
                  <small>Mit verlinkten Händlerquellen</small>
                </span>
              </div>
              <div>
                <Layers />
                <span>
                  <b>Für jedes Budget</b>
                  <small>Basics, Preis-Leistung & Premium</small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <b>Transparent bewertet</b>
                  <small>Redaktionelle Eignung statt Testversprechen</small>
                </span>
              </div>
            </div>
            <section className="catalogue section-wrap" id="ausruestung">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">01 / DEINE AUSRÜSTUNG</span>
                  <h2>
                    Guter Schutz.
                    <br />
                    <em>Für dein Budget.</em>
                  </h2>
                </div>
                <p>
                  Wähle zuerst einen Körperbereich.
                  <br />
                  Dann machen wir die Auswahl kleiner.
                </p>
              </div>
              <div className="region-tabs" aria-label="Körperregion">
                <button
                  className={filters.region === "all" ? "active" : ""}
                  aria-pressed={filters.region === "all"}
                  onClick={() => setFilter("region", "all")}
                >
                  Alles
                </button>
                {regions.map((r, i) => (
                  <button
                    key={r.id}
                    className={filters.region === r.id ? "active" : ""}
                    aria-pressed={filters.region === r.id}
                    onClick={() => setFilter("region", r.id)}
                  >
                    <span>0{i + 1}</span>
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="filter-panel">
                <div className="primary-filters">
                  <div className="budget-filter">
                    <span className="field-label">DEIN BUDGET</span>
                    <div className="segmented">
                      <button
                        aria-pressed={filters.tier === "all"}
                        className={filters.tier === "all" ? "selected" : ""}
                        onClick={() => setFilter("tier", "all")}
                      >
                        Alle
                      </button>
                      {(["budget", "value", "premium"] as const).map((t) => (
                        <button
                          key={t}
                          className={filters.tier === t ? "selected" : ""}
                          aria-pressed={filters.tier === t}
                          onClick={() => setFilter("tier", t)}
                        >
                          {tierLabels[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-price">
                    <label className="field-label" htmlFor="max-price">
                      MAXIMALER ARTIKELPREIS
                    </label>
                    <div>
                      <input
                        id="max-price"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Ohne Limit"
                        value={filters.maxPrice ?? ""}
                        onChange={(e) =>
                          setFilter(
                            "maxPrice",
                            e.target.value === ""
                              ? null
                              : Math.max(0, Number(e.target.value)),
                          )
                        }
                      />
                      <span>€</span>
                      {filters.maxPrice !== null && (
                        <button
                          aria-label="Preislimit entfernen"
                          onClick={() => setFilter("maxPrice", null)}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    className={`advanced-toggle ${advanced ? "selected" : ""}`}
                    aria-expanded={advanced}
                    aria-controls="advanced-filters"
                    onClick={() => setAdvanced(!advanced)}
                  >
                    <SlidersHorizontal size={17} />
                    Wetter & Schicht
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="search-row">
                  <label className="search">
                    <Search size={18} />
                    <input
                      type="search"
                      placeholder="Produkt, Marke, Kategorie oder Shop suchen …"
                      aria-label="Produkte suchen"
                      value={filters.search}
                      onChange={(e) => setFilter("search", e.target.value)}
                    />
                  </label>
                  <button
                    className="text-button"
                    onClick={() => {
                      setFilters({ ...initialFilters, region: filters.region });
                      setToast("Filter zurückgesetzt.");
                    }}
                  >
                    Zurücksetzen
                  </button>
                </div>
                {advanced && (
                  <div className="advanced-filters" id="advanced-filters">
                    <div className="weather-filter">
                      <span className="field-label">
                        WAS ERWARTET DICH? <small>Mehrfachauswahl</small>
                      </span>
                      <div className="weather-chips">
                        {weatherOptions.map(({ id, label, icon: Icon }) => (
                          <button
                            className={
                              filters.weather.includes(id) ? "selected" : ""
                            }
                            key={id}
                            aria-pressed={filters.weather.includes(id)}
                            onClick={() =>
                              setFilter(
                                "weather",
                                filters.weather.includes(id)
                                  ? filters.weather.filter((w) => w !== id)
                                  : [...filters.weather, id],
                              )
                            }
                          >
                            <Icon size={15} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="context-filters">
                      <div>
                        <span className="field-label">DEIN FAHRZEUG</span>
                        <div className="segmented">
                          <button
                            onClick={() => setFilter("vehicle", "bike")}
                            className={
                              filters.vehicle === "bike" ? "selected" : ""
                            }
                            aria-pressed={filters.vehicle === "bike"}
                          >
                            <Bike size={16} />
                            Fahrrad
                          </button>
                          <button
                            onClick={() => setFilter("vehicle", "ebike")}
                            className={
                              filters.vehicle === "ebike" ? "selected" : ""
                            }
                            aria-pressed={filters.vehicle === "ebike"}
                          >
                            <Zap size={16} />
                            E-Bike
                          </button>
                          <button
                            onClick={() => setFilter("vehicle", "scooter")}
                            className={
                              filters.vehicle === "scooter" ? "selected" : ""
                            }
                            aria-pressed={filters.vehicle === "scooter"}
                          >
                            Motorroller
                          </button>
                        </div>
                      </div>
                      <label>
                        <span className="field-label">DEINE SCHICHT</span>
                        <select
                          value={filters.shift}
                          onChange={(e) =>
                            setFilter(
                              "shift",
                              e.target.value as Filters["shift"],
                            )
                          }
                        >
                          <option value="short">Kurze Schicht</option>
                          <option value="medium">4–6 Stunden</option>
                          <option value="long">6–8 Stunden oder länger</option>
                        </select>
                      </label>
                    </div>
                    <p className="context-note">
                      {filters.vehicle === "bike"
                        ? "Aktives Treten erzeugt Wärme: Belüftung und Feuchtetransport beachten."
                        : filters.vehicle === "ebike"
                          ? "Auf dem E-Bike kann weniger Eigenwärme entstehen. Wärmebedarf und Pausen mit einplanen."
                          : "Motorroller: passende Motorrad-Schutzausrüstung ist zusätzlich erforderlich. Fahrradartikel ersetzen sie nicht; Radschuh-Systeme werden ausgeblendet."}{" "}
                      {filters.shift !== "short" &&
                        "Lange Schichten: Komfort fließt stärker in die Reihenfolge ein; keine garantierte Eignung für die gesamte Dauer."}
                    </p>
                  </div>
                )}
              </div>
              <div className="results-bar">
                <div>
                  <strong aria-live="polite">{list.length} Produkte</strong>
                  <span>
                    {filters.region === "all"
                      ? "Alle Körperregionen"
                      : regions.find((r) => r.id === filters.region)?.hint}
                  </span>
                </div>
                <label>
                  Sortieren
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilter("sort", e.target.value as Filters["sort"])
                    }
                    aria-label="Produkte sortieren"
                  >
                    <option value="relevance">Passende zuerst</option>
                    <option value="price">Niedrigster Preis</option>
                    <option value="score">Höchste Eignung</option>
                  </select>
                </label>
              </div>
              {filters.weather.length > 0 && (
                <p className="filter-explanation">
                  Wetterfilter werden gemeinsam angewendet. „Frost“ zeigt starke
                  dokumentierte Isolation, keine geprüfte Temperaturgarantie.
                  Bei Regen + Kälte brauchst du häufig mehrere Schichten.
                  „Wechselhaft“ priorisiert Regenhüllen. Der Preisfilter nutzt
                  beobachtete Artikelpreise; unbekannte Preise werden bei einem
                  Limit ausgeblendet.
                </p>
              )}
              {list.length ? (
                <div className="product-grid">{list.map(renderCard)}</div>
              ) : (
                <div className="empty-state">
                  <Search size={32} />
                  <h3>Diese Kombination ist sehr speziell.</h3>
                  <p>
                    Versuche weniger Wetterfilter oder suche eine Wärmeschicht
                    und eine Regenhülle getrennt.
                  </p>
                  <button
                    className="button"
                    onClick={() =>
                      setFilters({ ...initialFilters, region: filters.region })
                    }
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
              <p className="catalogue-note">
                <InfoIcon /> Recherche vom {dateLabel(RESEARCH_DATE)}. Preise
                sind beobachtete Artikelpreise, keine Livepreise. Verfügbarkeit,
                Varianten und Versand bitte im Shop prüfen. Action-Artikel sind
                nur in Filialen erhältlich.{" "}
                <a href="#/methodik">So entstehen die Punkte ↗</a>
              </p>
            </section>
            <section className="kits-section section-wrap">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">02 / SCHICHT FÜR SCHICHT</span>
                  <h2>
                    Ein Outfit.
                    <br />
                    <em>Dein eigener Mix.</em>
                  </h2>
                </div>
                <a className="text-link" href="#/outfit">
                  Selbst zusammenstellen
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <KitCards onUse={useKit} />
            </section>
            <section className="guide-banner section-wrap">
              <div>
                <span className="eyebrow">WISSEN FÜR UNTERWEGS</span>
                <h2>
                  Die richtige Schicht
                  <br />
                  macht den Unterschied.
                </h2>
                <p>
                  Weshalb die dickste Jacke nicht immer die beste ist – und was
                  du bei nassen Handschuhen beachten solltest.
                </p>
                <a className="button light" href="#/wissen">
                  Zum kurzen Schicht-Ratgeber
                  <ArrowRight size={18} />
                </a>
              </div>
              <div className="layer-diagram">
                <span>
                  <b>03</b> Wetterschutz
                  <small>Regen und Wind draußen halten</small>
                </span>
                <span>
                  <b>02</b> Wärmeschicht
                  <small>Isolation an Aktivität anpassen</small>
                </span>
                <span>
                  <b>01</b> Basisschicht
                  <small>Feuchtigkeit von der Haut weg</small>
                </span>
              </div>
            </section>
          </>
        )}
        {route === "outfit" && (
          <section className="outfit-page section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow">DEIN WINTER-OUTFIT</span>
                <h1>
                  Stell dir dein
                  <br />
                  <em>Winter-Outfit zusammen.</em>
                </h1>
              </div>
              <p>
                Fünf Körperbereiche. Dein eigener Mix.
                <br />
                Die Artikelsumme rechnet live mit.
              </p>
            </div>
            <div className="outfit-layout">
              <div className="outfit-slots">
                {regions.map((r, i) => {
                  const selected = productById(outfit.primary[r.id] ?? "");
                  return (
                    <article className="outfit-slot" key={r.id}>
                      <div className="slot-visual">
                        <GearArt
                          group={
                            selected?.group ??
                            (
                              [
                                "head",
                                "shell",
                                "glove",
                                "pants",
                                "shoe",
                              ] as const
                            )[i]
                          }
                        />
                      </div>
                      <div className="slot-content">
                        <span className="field-label">
                          0{i + 1} / {r.label.toUpperCase()}
                        </span>
                        <label className="sr-only" htmlFor={`outfit-${r.id}`}>
                          Artikel für {r.label}
                        </label>
                        <select
                          id={`outfit-${r.id}`}
                          value={selected?.id ?? ""}
                          onChange={(e) =>
                            setOutfit((old) => ({
                              ...old,
                              primary: {
                                ...old.primary,
                                [r.id]: e.target.value,
                              },
                              extras: old.extras.filter(
                                (id) => id !== e.target.value,
                              ),
                            }))
                          }
                        >
                          <option value="">Artikel auswählen …</option>
                          {products
                            .filter((p) => p.region === r.id)
                            .map((p) => (
                              <option value={p.id} key={p.id}>
                                {p.brand} · {p.name} ·{" "}
                                {p.price === null
                                  ? "Preis offen"
                                  : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`}
                              </option>
                            ))}
                        </select>
                        {selected ? (
                          <>
                            <p>{selected.waterNote}</p>
                            <div className="slot-actions">
                              <button
                                className="text-button"
                                onClick={() => setDetails(selected)}
                              >
                                Details & Grenzen
                              </button>
                              <a
                                className="text-link"
                                href={shopLink(selected).url}
                                rel={
                                  shopLink(selected).affiliate
                                    ? "sponsored noopener noreferrer"
                                    : "noopener noreferrer"
                                }
                                target="_blank"
                              >
                                {selected.retailOnly
                                  ? "Action-Produktseite"
                                  : "Beim Händler öffnen"}
                                <ArrowUpRight size={15} />
                              </a>
                            </div>
                            {shopLink(selected).affiliate && (
                              <small>{shopLink(selected).label}</small>
                            )}
                          </>
                        ) : (
                          <p>
                            Du kannst hier direkt auswählen oder Produkte im
                            Berater zum Outfit hinzufügen.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
                <div className="extras-panel">
                  <h3>
                    <Layers size={20} /> Schichten & Ergänzungen
                  </h3>
                  <p>
                    Regenhülle, Unterwäsche und Socken arbeiten zusammen.
                    Zusätzliche Artikel zählen einmal zur Summe.
                  </p>
                  <label className="sr-only" htmlFor="extra-product">
                    Zusätzliche Schicht auswählen
                  </label>
                  <select
                    id="extra-product"
                    value=""
                    onChange={(e) => {
                      if (e.target.value)
                        setOutfit((old) => ({
                          ...old,
                          extras: [...old.extras, e.target.value],
                        }));
                    }}
                  >
                    <option value="">Zusätzlichen Artikel hinzufügen …</option>
                    {products
                      .filter((p) => !chosen.some((c) => c.id === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {regions.find((r) => r.id === p.region)?.label}:{" "}
                          {p.brand} {p.name} ·{" "}
                          {p.price === null ? "Preis offen" : money(p.price)}
                        </option>
                      ))}
                  </select>
                  {outfit.extras.map((id) => {
                    const p = productById(id)!;
                    return (
                      <div className="extra-item" key={id}>
                        <div>
                          <b>
                            {p.brand} {p.name}
                          </b>
                          <span>
                            {p.price === null
                              ? "Preis offen"
                              : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`}
                          </span>
                        </div>
                        <a
                          href={shopLink(p).url}
                          target="_blank"
                          rel={
                            shopLink(p).affiliate
                              ? "sponsored noopener noreferrer"
                              : "noopener noreferrer"
                          }
                          aria-label={`Händler öffnen: ${p.name}`}
                        >
                          <ArrowUpRight size={19} />
                        </a>
                        <button
                          className="icon-button"
                          aria-label={`Entfernen: ${p.name}`}
                          onClick={() =>
                            setOutfit((old) => ({
                              ...old,
                              extras: old.extras.filter((x) => x !== id),
                            }))
                          }
                        >
                          <X size={18} />
                        </button>
                        {shopLink(p).affiliate && (
                          <small>{shopLink(p).label}</small>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <aside className="outfit-summary">
                <span className="eyebrow">DEINE EINKAUFSLISTE</span>
                <h2>
                  {total.complete ? "Beobachtete Summe" : "Bekannte Teilsumme"}
                </h2>
                <strong className="outfit-total" data-testid="outfit-total">
                  {total.from ? "ab " : ""}
                  {money(total.amount)}
                </strong>
                <p>
                  {chosen.length} Artikel · inkl. MwSt. · zzgl. Versand
                  <br />
                  Preise recherchiert am {dateLabel(RESEARCH_DATE)}
                  <br />
                  Keine aktuelle Preis- oder Lieferzusage.
                </p>
                {!total.complete && (
                  <div className="notice">
                    Mindestens ein Preis fehlt. Die Summe ist unvollständig.
                  </div>
                )}
                <div className="outfit-checklist">
                  {regions.map((r) => (
                    <span key={r.id}>
                      <Check
                        size={16}
                        className={outfit.primary[r.id] ? "checked" : ""}
                      />
                      {r.label}
                      {!outfit.primary[r.id] && <small>noch offen</small>}
                    </span>
                  ))}
                </div>
                <button
                  className="button light"
                  disabled={!chosen.length}
                  onClick={copyList}
                >
                  <Clipboard size={17} />
                  Einkaufsliste kopieren
                </button>
                <button
                  className="clear-outfit"
                  disabled={!chosen.length}
                  onClick={() => {
                    setOutfit({ primary: {}, extras: [] });
                    setToast("Outfit geleert.");
                  }}
                >
                  <Trash2 size={15} />
                  Auswahl leeren
                </button>
                <p className="summary-safety">
                  Ein voller Konfigurator ist keine vollständige
                  Schutzausrüstung: Helm, Licht, Sichtbarkeit und passende
                  Schuhe ergänzen. Socken und Überschuhe ersetzen keinen Schuh.
                  Für Motorroller passende Motorrad-Ausrüstung nutzen.
                </p>
              </aside>
            </div>
            <div className="section-heading small">
              <h2>Mit einem Set starten</h2>
            </div>
            <KitCards onUse={useKit} />
          </section>
        )}
        {route === "methodik" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">WIE WIR BEWERTEN</span>
            <h1>
              Klare Kriterien.
              <br />
              <em>Ehrliche Grenzen.</em>
            </h1>
            <p className="lead">
              Die Punkte sind eine redaktionelle Einschätzung der dokumentierten
              Eignung. Sie sind keine Kundenbewertung und kein eigener
              Praxistest.
            </p>
            <h2>Was die Zahl bedeutet</h2>
            <p>
              Wir vergeben je Kriterium 0–5 redaktionelle Stufen anhand der
              angegebenen Ausstattung: 0 = keine relevante Funktion belegt, 1 =
              sehr eingeschränkt, 2 = einfache Funktion mit deutlichen Grenzen,
              3 = plausibel passende Ausstattung, 4 = mehrere konkret
              dokumentierte Funktionen, 5 = besonders umfassende dokumentierte
              Ausstattung für den Einsatzzweck. Herstellerangaben bleiben
              Angaben des Herstellers, auch wenn wir sie in eine Einschätzung
              übersetzen.
            </p>
            <p>
              Die gewichteten Stufen ergeben 0–100 Punkte, gerundet auf fünf
              Punkte. Material bewertet den beschriebenen Aufbau.
              Verschleißvorsorge bewertet Verstärkungen oder Reparierbarkeit,
              keine tatsächliche Lebensdauer. Sichtbarkeit / Grip betrachtet die
              in der Gruppe relevante Sicherheitsfunktion. Schichtkomfort
              basiert auf Schnitt, Belüftung, Flexibilität und Feuchtetransport,
              nicht auf gemessenen Acht-Stunden-Schichten.
            </p>
            <h2>Gewichtung nach Produktgruppe</h2>
            <div className="table-scroll">
              <table className="method-table">
                <thead>
                  <tr>
                    <th>Produktgruppe</th>
                    {criterionLabels.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(weights).map(([group, w]) => (
                    <tr key={group}>
                      <th>{groupLabels[group as keyof typeof groupLabels]}</th>
                      {w.map((v, i) => (
                        <td key={i}>{v}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Fehlende Daten bleiben sichtbar</h2>
            <p>
              Unbekannte optionale Kriterien erhalten keine erfundene Stufe. Wir
              zeigen eine Gesamtzahl erst ab 80 % gewichteter Datenabdeckung;
              bekannte Kriterien werden auf diese Abdeckung normiert. Bei
              wesentlichen offenen Angaben – etwa einer widersprüchlichen
              Regenhülle – bleibt die Bewertung ganz offen. Jede Detailansicht
              zeigt die Einzelstufen, Gewichte und Datenabdeckung. Fehlende
              Daten bedeuten weder automatisch gute noch schlechte Qualität.
            </p>
            <p>
              Formel: Summe aus (Stufe ÷ 5 × Gewicht) ÷ belegte Gewichtssumme ×
              100; anschließend auf fünf Punkte runden. Bewertungen
              verschiedener Produktgruppen sind wegen der anderen Aufgabe und
              Gewichtung nur eingeschränkt vergleichbar.
            </p>
            <h2>Preis-Leistung, Budgets und Tipps</h2>
            <p>
              Preis-Leistung ist eine redaktionelle Einschätzung im Verhältnis
              zu alternativen Artikeln derselben Aufgabe. Günstig,
              Preis-Leistung und Premium sind Auswahlstufen je Körperbereich,
              keine starren, überall gleichen Euro-Grenzen. Ein höherer Preis
              verbessert den Wetterschutz nicht automatisch. Ein Tipp setzt
              nachvollziehbare Ausstattung und einen beobachteten Preis voraus.
              Die Begründung steht in der Produktdetailansicht. Tipps sind keine
              Auszeichnung aus einem eigenen Produkttest.
            </p>
            <h2>Recherche und Quellen</h2>
            <p>
              Stand: {dateLabel(RESEARCH_DATE)}. {products.length} konkrete
              Modelle, davon{" "}
              {products.filter((p) => p.sourceMethod === "catalogue").length}{" "}
              direkt über den öffentlichen{" "}
              <a
                href="https://www.gripgrab.com/products.json?limit=250"
                target="_blank"
                rel="noreferrer"
              >
                GripGrab-Produktkatalog
              </a>{" "}
              erfasst. Weitere Preise und Eigenschaften stammen aus verlinkten
              Hersteller-/Händlerseiten und öffentlich abrufbaren
              Suchindexfassungen. Preise sind daher zuletzt beobachtete Preise.
              Versand, konkrete Größe, Farbe, Verfügbarkeit und Aktionspreise
              können abweichen. Die Links führen zur jeweiligen Produktseite.
            </p>
            <p>
              Es gibt ergänzende Hinweise aus einem{" "}
              <a
                href="https://www.cyclingnews.com/features/best-winter-cycling-gloves/"
                target="_blank"
                rel="noreferrer"
              >
                unabhängigen Cyclingnews-Handschuhvergleich
              </a>{" "}
              für Polaris 2. Gemischte Kundenberichte zu EDR waterproof und
              City-900-Überschuhen werden als solche verlinkt. Kundenberichte
              sind keine kontrollierten Tests. Für die übrigen Produkte fließen
              keine erfundenen Rezensionen oder Testergebnisse ein.
            </p>
            <h2>Wetterfilter und Fahrzeuge</h2>
            <p>
              Starker Regen verlangt eine dokumentierte wasserdichte
              Konstruktion; reine DWR-Beschichtungen und unklare
              Action-Varianten werden ausgeschlossen. Das bleibt eine Vorauswahl
              und keine Dichtigkeitsgarantie für lange Schichten. Frost filtert
              starke dokumentierte Isolation, ohne Hersteller-Temperaturen vom
              Gehen auf Radfahren zu übertragen. Ein Regen- und Kältefilter
              verlangt beide Eigenschaften im selben Produkt; häufig solltest du
              die zwei Schichten getrennt suchen.
            </p>
            <p>
              Schichtdauer und Fahrzeug verändern die Reihenfolge. Für längere
              Schichten wird der belegte Komfort stärker gewichtet; E-Bike
              priorisiert wärmere Produkte. Beim Motorroller werden spezielle
              Radschuh-Systeme und Unterziehhandschuhe ausgeschlossen. Kleidung
              aus diesem Katalog ersetzt keine geprüfte
              Motorrad-Schutzausrüstung.
            </p>
            <a className="button" href="#/ausruestung">
              Zur Ausrüstung
              <ArrowRight size={17} />
            </a>
          </section>
        )}
        {route === "wissen" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">DER SCHICHT-RATGEBER</span>
            <h1>
              Gut angezogen.
              <br />
              <em>Besser unterwegs.</em>
            </h1>
            <p className="lead">
              Ein paar einfache Routinen machen Ausrüstung im Arbeitsalltag
              nützlicher.
            </p>
            <div className="guide-grid">
              <article>
                <span>01</span>
                <Layers />
                <h2>In Schichten denken</h2>
                <p>
                  Eine feuchtetransportierende Basis liegt an der Haut, darüber
                  kommt je nach Bedarf Isolation und außen eine Wind- oder
                  Regenhülle. Beim aktiven Treten früher lüften, in Pausen die
                  Wärmeschicht ergänzen. Nassgeschwitzte Kleidung isoliert im
                  Stillstand schlechter.
                </p>
              </article>
              <article>
                <span>02</span>
                <CloudRain />
                <h2>Wasser findet die Lücke</h2>
                <p>
                  Bei Membranhandschuhen Jackenärmel über die Bündchen ziehen.
                  Regenhose über die Schäfte von Schuhen oder Überschuhen legen.
                  Auch ein wasserdichtes Material hilft wenig, wenn Wasser am
                  offenen Rand hineinläuft.
                </p>
              </article>
              <article>
                <span>03</span>
                <Wind />
                <h2>Atmen statt überhitzen</h2>
                <p>
                  Wasserabweisend ist nicht wasserdicht. Eine dichte Regenhülle
                  kann trotzdem innen feucht werden: Belüftung nutzen und die
                  Isolation an dein Tempo anpassen. Auf dem E-Bike oder beim
                  Warten kann mehr Wärme nötig sein als beim kräftigen Treten.
                </p>
              </article>
              <article>
                <span>04</span>
                <Snowflake />
                <h2>Ein trockenes Reservepaar</h2>
                <p>
                  Nasse Handschuhe und Socken möglichst wechseln. Ein trocken
                  verpacktes Ersatzpaar ist für lange Schichten sinnvoll.
                  Handschuhe müssen mit allen Fingern sicher bremsen und
                  schalten lassen; Smartphone-Bedienung nur im Stillstand.
                </p>
              </article>
              <article>
                <span>05</span>
                <ShieldCheck />
                <h2>Sichtbar und geschützt</h2>
                <p>
                  Funktionierendes Licht und die erforderlichen Reflektoren am
                  Rad sind die Basis. Sichtbare Kleidung ergänzt sie. Prüfe, ob
                  dein Rucksack Reflexflächen verdeckt. Eine Unterhelmmütze darf
                  den korrekten Helmsitz nicht verändern.
                </p>
              </article>
              <article>
                <span>06</span>
                <Bike />
                <h2>Schnee ist kein Glatteis</h2>
                <p>
                  Eine profilierte Sohle bietet keine Garantie gegen Eis.
                  Schneeprofil ist auch kein Nachweis für Haftung auf Pedalen.
                  Bei unsicheren Verhältnissen Tempo reduzieren oder absteigen;
                  auf dem Motorroller ist passende Motorrad-Schutzausrüstung
                  erforderlich.
                </p>
              </article>
            </div>
            <p className="source-note">
              Grundlagen:{" "}
              <a
                href="https://www.adfc.de/artikel/kleidung-bei-kaelte"
                target="_blank"
                rel="noreferrer"
              >
                ADFC: Kleidung bei Kälte
              </a>{" "}
              und{" "}
              <a
                href="https://www.adfc.de/dossier/radfahren-im-winter-sicher-unterwegs-trotz-eis-und-schnee"
                target="_blank"
                rel="noreferrer"
              >
                ADFC: Radfahren im Winter
              </a>
              . Die Hinweise ersetzen keine individuelle Passform- und
              Sicherheitsprüfung.
            </p>
            <a className="button" href="#/ausruestung">
              Passende Ausrüstung finden
              <ArrowRight size={18} />
            </a>
          </section>
        )}
        {route === "impressum" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">RECHTLICHE INFORMATIONEN</span>
            <h1>Impressum</h1>
            {operator.name && operator.email && operator.address.length ? (
              <>
                <h2>Verantwortlicher Betreiber</h2>
                <p>
                  {operator.name}
                  <br />
                  {operator.address.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                  <a href={`mailto:${operator.email}`}>{operator.email}</a>
                </p>
                {operator.register && <p>{operator.register}</p>}
                {operator.vatId && <p>USt-ID: {operator.vatId}</p>}
              </>
            ) : (
              <>
                <div className="notice">
                  Die Betreiberangaben sind noch nicht hinterlegt. Dieses
                  Impressum ist unvollständig.
                </div>
                <h2>Zu ergänzende Betreiberangaben</h2>
                <dl className="legal-fields">
                  <dt>Name / Organisation</dt>
                  <dd>Noch nicht angegeben</dd>
                  <dt>Ladungsfähige Anschrift</dt>
                  <dd>Noch nicht angegeben</dd>
                  <dt>Kontakt-E-Mail</dt>
                  <dd>Noch nicht angegeben</dd>
                  <dt>Register / Vertretungsberechtigte / USt-ID</dt>
                  <dd>Falls auf den Betreiber zutreffend, zu ergänzen</dd>
                </dl>
              </>
            )}
            <h2>Projektstatus</h2>
            <p>
              Unabhängiges Community-Projekt für Lieferfahrer in Aschaffenburg.
              Keine offizielle Website von Flink. Keine Verbindung,
              Partnerschaft oder Empfehlung durch das Unternehmen wird
              behauptet. Es werden keine Unternehmenslogos verwendet.
            </p>
            <p>
              Aktuell werden direkte Produktlinks ohne Affiliate-Konten
              verwendet. Vor kommerzieller Nutzung sind Betreiberangaben und
              rechtliche Informationspflichten zu vervollständigen und die
              konkrete Betreiberkonstellation zu prüfen. Je nach Betriebsform
              können Pflichten bereits für die öffentliche Community-Seite
              gelten. Grundlage:{" "}
              <a
                href="https://www.gesetze-im-internet.de/ddg/__5.html"
                target="_blank"
                rel="noreferrer"
              >
                § 5 DDG
              </a>
              .
            </p>
            <h2>Redaktionelle Informationen</h2>
            <p>
              Recherche vom {dateLabel(RESEARCH_DATE)}. Keine eigenen
              Praxistests; keine Zusage bestimmter Preise oder Lagerbestände.{" "}
              <a href="#/methodik">Bewertungsmethodik und Grenzen</a>.
            </p>
          </section>
        )}
        {route === "datenschutz" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">LOKALE MERKLISTE. KEIN KONTO.</span>
            <h1>Datenschutz</h1>
            <p className="lead">
              Die Anwendung verwendet keine Analyse- oder Werbetracker, keine
              Registrierung und keine selbst gesetzten Cookies.
            </p>
            <h2>Verantwortlicher</h2>
            <p>
              {operator.name
                ? operator.name
                : "Die verantwortliche Betreiberidentität und Kontaktadresse müssen noch ergänzt werden."}{" "}
              Siehe <a href="#/impressum">Impressum</a>. Die Datenschutzhinweise
              sind bis zur Ergänzung der Verantwortlichenangaben unvollständig.
            </p>
            <h2>Hosting durch GitHub Pages</h2>
            <p>
              Beim Seitenaufruf überträgt dein Browser technisch notwendige
              Verbindungsdaten an GitHub. GitHub erklärt, IP-Adressen der
              Besucher zu Sicherheitszwecken zu protokollieren und zu speichern.
              Informationen:{" "}
              <a
                href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Pages: Datenerfassung
              </a>{" "}
              und{" "}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noreferrer"
              >
                GitHub-Datenschutzerklärung
              </a>
              . Der Betreiber muss die für seine Konstellation passenden
              Rechtsgrundlagen, Empfänger- und Drittlandinformationen ergänzen.
            </p>
            <h2>Merkliste und Outfit im Browser</h2>
            <p>
              Produkt-IDs aus Merkliste und Outfit werden in localStorage auf
              deinem Gerät gespeichert. Die Anwendung sendet diese Auswahl nicht
              an einen Server. Die Daten bleiben bis zum Löschen oder Entfernen
              der Browserdaten bestehen. Bei blockiertem Speicher funktionieren
              die Auswahlen nur für die laufende Sitzung. Zweck ist die von dir
              gewählte Merk- und Konfigurationsfunktion.
            </p>
            <button
              className="button outline"
              onClick={() => {
                setFavorites([]);
                setOutfit({ primary: {}, extras: [] });
                try {
                  localStorage.removeItem("rider-favorites-v1");
                  localStorage.removeItem("rider-outfit-v1");
                } catch {}
                setToast("Lokale Merkliste und Outfit wurden gelöscht.");
              }}
            >
              <Trash2 size={16} />
              Lokale Auswahl löschen
            </button>
            <h2>Shoplinks und Bilder</h2>
            <p>
              Shopseiten werden erst durch einen Klick geöffnet. Danach gilt die
              Datenschutzerklärung des jeweiligen Händlers. Alle Illustrationen
              und Schriftdateien werden lokal mit der Website geladen; die
              Anwendung lädt keine externen Produktbilder, Werbepixel oder
              Schriftserver.
            </p>
            <h2>Kommerzielle Verlinkungen</h2>
            <p>
              Derzeit sind keine Affiliate-URLs hinterlegt. Wenn später eigene
              Affiliate-Links eingetragen werden, erscheinen sie mit einem
              sichtbaren Werbehinweis und entsprechender Linkkennzeichnung. Vor
              Aktivierung muss der Betreiber diese Datenschutzhinweise um die
              tatsächlich eingesetzten Programme ergänzen.
            </p>
            <h2>Deine Rechte</h2>
            <p>
              Soweit personenbezogene Daten verarbeitet werden, bestehen nach
              den jeweiligen gesetzlichen Voraussetzungen insbesondere Rechte
              auf Auskunft, Berichtigung, Löschung, Einschränkung,
              Datenübertragbarkeit und Widerspruch sowie Beschwerde bei einer
              Datenschutzaufsichtsbehörde. Für die Ausübung gegenüber dem
              Betreiber muss dessen Kontaktadresse im Impressum ergänzt werden.
            </p>
            <p>Stand: {dateLabel(RESEARCH_DATE)}.</p>
          </section>
        )}
        {!isHome &&
          ![
            "outfit",
            "wissen",
            "methodik",
            "impressum",
            "datenschutz",
          ].includes(route) && (
            <section className="empty-state section-wrap">
              <h1>Diese Seite gibt es hier nicht.</h1>
              <a className="button" href="#/">
                Zur Startseite
              </a>
            </section>
          )}
      </main>
      <footer className="footer">
        <div className="section-wrap">
          <div className="footer-top">
            <a className="brand" href="#/">
              <span className="brand-icon">
                <Bike size={26} />
              </span>
              <span>
                FLINK ASCHAFFENBURG<small>CHAT PROJEKT</small>
              </span>
            </a>
            <p>
              Für gute Schichten.
              <br />
              Und trockene Heimwege.
            </p>
          </div>
          <div className="footer-bottom">
            <p>
              Unabhängiges Community-Projekt für Lieferfahrer in Aschaffenburg.
              <br />
              Keine offizielle Website von Flink.
            </p>
            <nav aria-label="Weitere Informationen">
              <a href="#/methodik">Bewertung & Quellen</a>
              <a href="#/impressum">Impressum</a>
              <a href="#/datenschutz">Datenschutz</a>
              <a
                href="https://github.com/disorder119/flink-aschaffenburg-chat-projekt"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
                <ArrowUpRight size={13} />
              </a>
            </nav>
          </div>
          <small>
            Recherche {dateLabel(RESEARCH_DATE)} · Preise können sich ändern ·
            Keine eigenen Praxistests
          </small>
        </div>
      </footer>
      {isHome && chosen.length > 0 && (
        <a
          className={`floating-outfit ${compare.length ? "with-compare" : ""}`}
          href="#/outfit"
        >
          <Layers size={19} />
          <span>
            Dein Outfit <b>{chosen.length}</b>
          </span>
          <strong>
            {total.from ? "ab " : ""}
            {money(total.amount)}
            {!total.complete ? " + offene Preise" : ""}
          </strong>
          <ArrowRight size={17} />
        </a>
      )}
      {compare.length > 0 && (
        <div className="compare-bar">
          <span>
            <GitCompareArrows size={19} />
            {compare.length}/3 <small>{groupLabels[compared[0].group]}</small>
          </span>
          <button className="button light" onClick={() => setCompareOpen(true)}>
            Vergleich öffnen
            <ArrowRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label="Vergleich leeren"
            onClick={() => setCompare([])}
          >
            <X size={19} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {storageError && (
        <div className="storage-notice" role="status">
          Dein Browser blockiert lokalen Speicher. Die Auswahl bleibt nur in
          dieser Sitzung erhalten.
        </div>
      )}
      {details && (
        <Modal
          title={`${details.brand} · ${details.name}`}
          onClose={() => setDetails(null)}
        >
          <ProductDetails p={details} />
          <div className="detail-actions">
            <button
              className="button outline"
              onClick={() => {
                addOutfit(details);
                setDetails(null);
              }}
            >
              <Plus size={17} />
              Zum Outfit
            </button>
            <ShopButton p={details} />
          </div>
        </Modal>
      )}
      {compareOpen && (
        <Modal
          title="Dein Produktvergleich"
          wide
          onClose={() => setCompareOpen(false)}
        >
          <p className="muted">
            Bis zu drei Produkte derselben Produktgruppe. Redaktionelle Eignung,
            kein eigener Praxistest.
          </p>
          {compared.length ? (
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Merkmal</th>
                    {compared.map((p) => (
                      <th key={p.id}>
                        <GearArt group={p.group} />
                        <span>
                          {p.brand}
                          <br />
                          {p.name}
                        </span>
                        <button
                          className="text-button"
                          onClick={() =>
                            setCompare((ids) => ids.filter((id) => id !== p.id))
                          }
                        >
                          Entfernen
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Preis",
                    "Eignung",
                    "Wetterschutz",
                    "Wärme",
                    "Vorteile",
                    "Nachteile",
                    "Einsatz",
                    "Shop",
                  ].map((row) => (
                    <tr key={row}>
                      <th>{row}</th>
                      {compared.map((p) => (
                        <td key={p.id}>
                          {row === "Preis" ? (
                            p.price === null ? (
                              "Preis offen"
                            ) : (
                              `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`
                            )
                          ) : row === "Eignung" ? (
                            scoreOf(p).score === null ? (
                              "Daten unzureichend"
                            ) : (
                              `${scoreOf(p).score}/100`
                            )
                          ) : row === "Wetterschutz" ? (
                            p.waterNote
                          ) : row === "Wärme" ? (
                            p.warmthNote
                          ) : row === "Vorteile" ? (
                            p.pros.join(" · ")
                          ) : row === "Nachteile" ? (
                            p.cons.join(" · ")
                          ) : row === "Einsatz" ? (
                            p.use
                          ) : (
                            <ShopButton p={p} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Dein Vergleich ist leer.</p>
          )}
        </Modal>
      )}
      {favoritesOpen && (
        <Modal
          title={`Deine Merkliste · ${favorites.length}`}
          wide
          onClose={() => setFavoritesOpen(false)}
        >
          {favorites.length ? (
            <div className="product-grid favorites-grid">
              {products.filter((p) => favorites.includes(p.id)).map(renderCard)}
            </div>
          ) : (
            <div className="empty-state">
              <Heart size={35} />
              <h3>Gute Ausrüstung im Blick behalten.</h3>
              <p>
                Tippe auf das Herz einer Produktkarte. Deine Merkliste wird nur
                in deinem Browser gespeichert.
              </p>
              <button
                className="button"
                onClick={() => setFavoritesOpen(false)}
              >
                Produkte entdecken
              </button>
            </div>
          )}
        </Modal>
      )}
      {copyFallback && (
        <Modal
          title="Einkaufsliste kopieren"
          onClose={() => setCopyFallback("")}
        >
          <p>
            Der Browser erlaubt gerade keinen direkten Zugriff auf die
            Zwischenablage. Markiere und kopiere die Liste hier.
          </p>
          <textarea
            className="copy-fallback"
            readOnly
            value={copyFallback}
            aria-label="Einkaufsliste zum manuellen Kopieren"
            onFocus={(e) => e.target.select()}
          />
        </Modal>
      )}
    </>
  );
}
function InfoIcon() {
  return <ShieldCheck size={16} />;
}
function ShopButton({ p }: { p: Product }) {
  const link = shopLink(p);
  return (
    <div>
      <a
        className="button"
        href={link.url}
        target="_blank"
        rel={
          link.affiliate
            ? "sponsored noopener noreferrer"
            : "noopener noreferrer"
        }
      >
        {p.retailOnly ? "Offizielle Produktseite" : "Beim Händler öffnen"}
        <ArrowUpRight size={16} />
      </a>
      {link.affiliate && <small className="affiliate-note">{link.label}</small>}
    </div>
  );
}
function ProductDetails({ p }: { p: Product }) {
  const score = scoreOf(p);
  const w = weights[p.group];
  return (
    <>
      <div className="detail-product">
        <GearArt group={p.group} />
        <div>
          <span className="eyebrow">
            {tierLabels[p.tier]} · {p.shop}
            {p.retailOnly ? " · NUR FILIALE" : ""}
          </span>
          <strong>
            {p.price === null
              ? "Preis nicht überprüfbar"
              : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`}
          </strong>
          <p>{p.priceNote}</p>
          <small>
            Recherche / Preisbeobachtung: {dateLabel(p.checked)}
            {p.sourceMethod === "catalogue"
              ? " · öffentlicher Händlerkatalog"
              : " · öffentlich recherchierte Produktseite / Suchindex"}
          </small>
        </div>
      </div>
      <p className="lead">{p.use}</p>
      {p.badge && (
        <div className="notice green">
          <b>{p.badge.label}</b>
          <p>{p.badge.reason}</p>
        </div>
      )}
      <div className="detail-columns">
        <div>
          <h3>Was dafür spricht</h3>
          <ul>
            {p.pros.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Wo die Grenzen liegen</h3>
          <ul>
            {p.cons.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <dl className="detail-facts">
        <dt>Nässeschutz</dt>
        <dd>
          {waterLabels[p.water]}. {p.waterNote}
        </dd>
        <dt>Wärme</dt>
        <dd>{p.warmthNote}</dd>
        <dt>Material / Aufbau</dt>
        <dd>{p.material}</dd>
        <dt>Datenlage</dt>
        <dd>{p.uncertainty}</dd>
        {p.compatibility && (
          <>
            <dt>Kompatibilität</dt>
            <dd>
              {p.compatibility === "spd"
                ? "MTB-/SPD-Konstruktion; passende Pedale bzw. Plattformsitz prüfen."
                : p.compatibility === "road"
                  ? "Für Rennradschuhe; nicht für beliebige Alltagsschuhe."
                  : "Für Gravel-Radschuhe; passende Sohlenöffnungen prüfen."}
            </dd>
          </>
        )}
      </dl>
      <h3>
        Redaktionelle Eignung:{" "}
        {score.score === null ? "Daten unzureichend" : `${score.score}/100`}
      </h3>
      <p className="muted">
        {score.score === null
          ? "Wesentliche Eigenschaften sind unzureichend dokumentiert. Wir vergeben keine scheinpräzise Zahl."
          : `Gewichtete Datenabdeckung ${score.coverage} %. Auf fünf Punkte gerundet; keine Kundenrezension und kein eigener Praxistest.`}
      </p>
      {p.assessment && (
        <table className="score-table">
          <thead>
            <tr>
              <th>Kriterium</th>
              <th>Stufe</th>
              <th>Gewicht</th>
            </tr>
          </thead>
          <tbody>
            {criterionLabels.map((c, i) => (
              <tr key={c}>
                <th>{c}</th>
                <td>
                  {p.assessment![i] === null
                    ? "Nicht belegt"
                    : `${p.assessment![i]}/5`}
                </td>
                <td>{w[i]} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        <a href="#/methodik">Bewertungsregeln und Gewichtungen lesen</a>
      </p>
      <p className="source-note">
        Primärquelle:{" "}
        <a href={p.url} target="_blank" rel="noreferrer">
          {p.shop}: konkrete Produktseite ↗
        </a>
        {p.independentSource && (
          <>
            {" "}
            ·{" "}
            <a href={p.independentSource} target="_blank" rel="noreferrer">
              Ergänzende Test- oder Kundenquelle ↗
            </a>
          </>
        )}
      </p>
    </>
  );
}
