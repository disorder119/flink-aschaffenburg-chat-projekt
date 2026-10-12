import { tr } from "./i18n/core";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { languageRevision, subscribeLanguage } from "./i18n/core";
import { LanguagePicker } from "./components/LanguagePicker";
import { InstallPanel, OfflineBanner } from "./components/InstallPanel";
import { repositoryUrl } from "./config/publication";
import { addProductToOutfit } from "./lib/outfit";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  CloudRain,
  GitCompareArrows,
  Heart,
  Layers,
  Menu,
  Plus,
  ShieldCheck,
  Snowflake,
  Trash2,
  Wind,
  X,
  Sparkles,
} from "lucide-react";
import type { Filters, Product, Region } from "./types";
import { products, RESEARCH_DATE } from "./data/products";
import { type Outfit } from "./data/kits";
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
  weights,
} from "./lib/logic";
import { shopLink } from "./config/affiliate";
import { operator } from "./config/operator";
import { RiderWorkspace } from "./components/RiderWorkspace";
import { workspaceViewOf } from "./lib/workspace";
import { ProductCard, waterLabels } from "./components/ProductCard";
import { ProductImage } from "./components/ProductImage";
import { photoFor } from "./data/photos";
import { Modal } from "./components/Modal";
import { useExperience } from "./components/useExperience";
import { riderStyles } from "./lib/experience";
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
          products.some((p) => p.id === id && p.region === r && !p.supplement),
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
export function App() {
  const languageVersion = useSyncExternalStore(
    subscribeLanguage,
    languageRevision,
  );
  const experience = useExperience();
  const appearance = riderStyles.find((s) => s.id === experience.style)!;
  const [route, setRoute] = useState(location.hash.slice(2) || "");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const workspaceView = workspaceViewOf(route);
  const isWorkspace = workspaceView !== null;
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
    if (!workspaceViewOf(route)) window.scrollTo({ top: 0, behavior: "auto" });
    if (route === "extras")
      setFilters((old) =>
        old.supplementsOnly
          ? old
          : { ...old, region: "all", group: "all", supplementsOnly: true },
      );
    if (["", "ausruestung"].includes(route))
      setFilters((old) => ({ ...old, supplementsOnly: false }));
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
  useEffect(() => {
    document.body.classList.toggle("workspace-active", isWorkspace);
    return () => document.body.classList.remove("workspace-active");
  }, [isWorkspace]);
  useEffect(() => {
    if (!isWorkspace) return;
    const viewport = window.visualViewport;
    const resize = () =>
      document.documentElement.style.setProperty(
        "--studio-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
    resize();
    viewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      window.removeEventListener("resize", resize);
      document.documentElement.style.removeProperty("--studio-height");
    };
  }, [isWorkspace]);
  const list = useMemo(
    () => filteredProducts(products, filters, favorites),
    [filters, favorites, languageVersion],
  );
  const chosen = outfitProducts(outfit);
  const compared = compare.map(productById).filter((p): p is Product => !!p);
  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((old) => ({
      ...old,
      [key]: value,
      ...(key === "region" ? { group: "all" as const } : {}),
    }));
  const navigate = (path: string) => {
    location.hash = "#/" + path;
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
    setOutfit((old) => addProductToOutfit(old, p));
    setToast(`${p.name} wurde zum Outfit hinzugefügt.`);
  };
  const useKit = (o: Outfit) => {
    setOutfit({ primary: { ...o.primary }, extras: [...o.extras] });
    setFilters(initialFilters);
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
  return (
    <div
      className={`rider-app ${isWorkspace ? "workspace-mode" : ""}`}
      data-style={experience.style}
      data-motion={experience.motion ? "on" : "off"}
      style={
        {
          "--accent": appearance.color,
          "--rider-light": appearance.light,
          "--rider-dark": appearance.dark,
          "--rider-bag": appearance.bag,
        } as React.CSSProperties
      }
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus({ preventScroll: true });
        }}
      >
        {tr("Zum Inhalt")}
      </a>
      <OfflineBanner />
      <header className="header">
        <div className="header-inner">
          <a
            className="brand"
            href="#/"
            aria-label={tr("Flink Aschaffenburg Chat Projekt, Startseite")}
          >
            <span className="brand-icon">
              <Bike size={25} />
            </span>
            <span>
              {tr("FLINK ASCHAFFENBURG")}
              <small>{tr("CHAT PROJEKT")}</small>
            </span>
          </a>
          <nav
            className={`navigation ${menu ? "open" : ""}`}
            aria-label={tr("Hauptnavigation")}
          >
            <a
              className={isWorkspace && route !== "outfit" ? "active" : ""}
              href="#/ausruestung"
            >
              {tr("Ausr\u00FCstung")}
            </a>
            <a className={route === "outfit" ? "active" : ""} href="#/outfit">
              {tr("Winter-Outfit")}
            </a>
            <a className={route === "wissen" ? "active" : ""} href="#/wissen">
              {tr("Wissen")}
            </a>
            <a href="#/methodik">{tr("Bewertung")}</a>
            <a href="#/impressum">{tr("Impressum")}</a>
            <a href="#/datenschutz">{tr("Datenschutz")}</a>
          </nav>
          <div className="header-actions">
            <LanguagePicker />
            <InstallPanel />
            <button
              className="motion-button icon-button"
              aria-label={tr(
                experience.motion
                  ? "Animationen ausschalten"
                  : "Animationen einschalten",
              )}
              aria-pressed={experience.motion}
              onClick={() => experience.setMotion(!experience.motion)}
              title={tr(
                experience.motion
                  ? "Animationen ausschalten"
                  : "Animationen einschalten",
              )}
            >
              <Sparkles size={18} />
              <span>{tr("Effekte")}</span>
            </button>
            <button
              className="saved-button"
              onClick={() =>
                isWorkspace ? navigate("merkliste") : setFavoritesOpen(true)
              }
              aria-label={tr("Merkliste \u00F6ffnen, {0} Produkte", {
                "0": favorites.length,
              })}
            >
              <Heart size={20} />
              <span>{tr("Merkliste")}</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>
            <button
              className="menu-button icon-button"
              aria-label={tr("Menü öffnen")}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {workspaceView && (
          <RiderWorkspace
            view={workspaceView}
            filters={filters}
            list={list}
            allProducts={products}
            favorites={favorites}
            compared={compare}
            outfit={outfit}
            chosen={chosen}
            experience={experience}
            onFilter={setFilter}
            onReset={() =>
              setFilters({ ...initialFilters, region: filters.region })
            }
            onNavigate={navigate}
            onRegion={selectRegion}
            onFavorite={favorite}
            onCompare={toggleCompare}
            onCompareOpen={() => setCompareOpen(true)}
            onDetails={setDetails}
            onAdd={addOutfit}
            onCopy={copyList}
            onUseKit={useKit}
            onClearOutfit={() => setOutfit({ primary: {}, extras: [] })}
            onExtra={(id) =>
              setOutfit((old) => ({
                ...old,
                extras: old.extras.includes(id)
                  ? old.extras
                  : [...old.extras, id],
              }))
            }
            onRemove={(p) =>
              setOutfit((old) => ({
                primary: Object.fromEntries(
                  Object.entries(old.primary).filter(([, id]) => id !== p.id),
                ),
                extras: old.extras.filter((id) => id !== p.id),
              }))
            }
          />
        )}
        {route === "methodik" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">{tr("WIE WIR BEWERTEN")}</span>
            <h1>
              {tr("Klare Kriterien.")}
              <br />
              <em>{tr("Ehrliche Grenzen.")}</em>
            </h1>
            <p className="lead">
              {tr(
                "Die Punkte sind eine redaktionelle Einsch\u00E4tzung der dokumentierten Eignung. Sie sind keine Kundenbewertung und kein eigener Praxistest.",
              )}
            </p>
            <h2>{tr("Was die Zahl bedeutet")}</h2>
            <p>
              {tr(
                "Wir vergeben je Kriterium 0\u20135 redaktionelle Stufen anhand der angegebenen Ausstattung: 0 = keine relevante Funktion belegt, 1 = sehr eingeschr\u00E4nkt, 2 = einfache Funktion mit deutlichen Grenzen, 3 = plausibel passende Ausstattung, 4 = mehrere konkret dokumentierte Funktionen, 5 = besonders umfassende dokumentierte Ausstattung f\u00FCr den Einsatzzweck. Herstellerangaben bleiben Angaben des Herstellers, auch wenn wir sie in eine Einsch\u00E4tzung \u00FCbersetzen.",
              )}
            </p>
            <p>
              {tr(
                "Die gewichteten Stufen ergeben 0\u2013100 Punkte, gerundet auf f\u00FCnf Punkte. Material bewertet den beschriebenen Aufbau. Verschlei\u00DFvorsorge bewertet Verst\u00E4rkungen oder Reparierbarkeit, keine tats\u00E4chliche Lebensdauer. Sichtbarkeit / Grip betrachtet die in der Gruppe relevante Sicherheitsfunktion. Schichtkomfort basiert auf Schnitt, Bel\u00FCftung, Flexibilit\u00E4t und Feuchtetransport, nicht auf gemessenen Acht-Stunden-Schichten.",
              )}
            </p>
            <h2>{tr("Gewichtung nach Produktgruppe")}</h2>
            <div className="table-scroll">
              <table className="method-table">
                <thead>
                  <tr>
                    <th>{tr("Produktgruppe")}</th>
                    {criterionLabels.map((c) => (
                      <th key={c}>{tr(c)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(weights).map(([group, w]) => (
                    <tr key={group}>
                      <th>
                        {tr(groupLabels[group as keyof typeof groupLabels])}
                      </th>
                      {w.map((v, i) => (
                        <td key={i}>
                          {v}
                          {tr("%")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>{tr("Fehlende Daten bleiben sichtbar")}</h2>
            <p>
              {tr(
                "Unbekannte optionale Kriterien erhalten keine erfundene Stufe. Wir zeigen eine Gesamtzahl erst ab 80 % gewichteter Datenabdeckung; bekannte Kriterien werden auf diese Abdeckung normiert. Bei wesentlichen offenen Angaben \u2013 etwa einer widerspr\u00FCchlichen Regenh\u00FClle \u2013 bleibt die Bewertung ganz offen. Jede Detailansicht zeigt die Einzelstufen, Gewichte und Datenabdeckung. Fehlende Daten bedeuten weder automatisch gute noch schlechte Qualit\u00E4t.",
              )}
            </p>
            <p>
              {tr(
                "Formel: Summe aus (Stufe \u00F7 5 \u00D7 Gewicht) \u00F7 belegte Gewichtssumme \u00D7 100; anschlie\u00DFend auf f\u00FCnf Punkte runden. Bewertungen verschiedener Produktgruppen sind wegen der anderen Aufgabe und Gewichtung nur eingeschr\u00E4nkt vergleichbar.",
              )}
            </p>
            <h2>{tr("Preis-Leistung, Budgets und Tipps")}</h2>
            <p>
              {tr(
                "Preis-Leistung ist eine redaktionelle Einsch\u00E4tzung im Verh\u00E4ltnis zu alternativen Artikeln derselben Aufgabe. G\u00FCnstig, Preis-Leistung und Premium sind Auswahlstufen je K\u00F6rperbereich, keine starren, \u00FCberall gleichen Euro-Grenzen. Ein h\u00F6herer Preis verbessert den Wetterschutz nicht automatisch. Ein Tipp setzt nachvollziehbare Ausstattung und einen beobachteten Preis voraus. Die Begr\u00FCndung steht in der Produktdetailansicht. Tipps sind keine Auszeichnung aus einem eigenen Produkttest.",
              )}
            </p>
            <h2>{tr("Recherche und Quellen")}</h2>
            <p>
              {tr("Stand: ")}
              {tr(dateLabel(RESEARCH_DATE))}
              {tr(". ")}
              {products.length}
              {tr(" konkrete Modelle, davon")}
              {tr(" ")}
              {products.filter((p) => p.sourceMethod === "catalogue").length}
              {tr(" ")}
              {tr("direkt \u00FCber den \u00F6ffentlichen")}
              {tr(" ")}
              <a
                href="https://www.gripgrab.com/products.json?limit=250"
                target="_blank"
                rel="noreferrer"
              >
                {tr("GripGrab-Produktkatalog")}
              </a>
              {tr(" ")}
              {tr(
                "erfasst. Weitere Preise und Eigenschaften stammen aus verlinkten Hersteller-/H\u00E4ndlerseiten und \u00F6ffentlich abrufbaren Suchindexfassungen. Preise sind daher zuletzt beobachtete Preise. Versand, konkrete Gr\u00F6\u00DFe, Farbe, Verf\u00FCgbarkeit und Aktionspreise k\u00F6nnen abweichen. Die Links f\u00FChren zur jeweiligen Produktseite.",
              )}
            </p>
            <p>
              {tr("Es gibt erg\u00E4nzende Hinweise aus einem")}
              {tr(" ")}
              <a
                href="https://www.cyclingnews.com/features/best-winter-cycling-gloves/"
                target="_blank"
                rel="noreferrer"
              >
                {tr("unabh\u00E4ngigen Cyclingnews-Handschuhvergleich")}
              </a>
              {tr(" ")}
              {tr(
                "f\u00FCr Polaris 2. Gemischte Kundenberichte zu EDR waterproof und City-900-\u00DCberschuhen werden als solche verlinkt. Kundenberichte sind keine kontrollierten Tests. F\u00FCr die \u00FCbrigen Produkte flie\u00DFen keine erfundenen Rezensionen oder Testergebnisse ein.",
              )}
            </p>
            <h2>{tr("Wetterfilter und Fahrzeuge")}</h2>
            <p>
              {tr(
                "Starker Regen verlangt eine dokumentierte wasserdichte Konstruktion; reine DWR-Beschichtungen und unklare Action-Varianten werden ausgeschlossen. Das bleibt eine Vorauswahl und keine Dichtigkeitsgarantie f\u00FCr lange Schichten. Frost filtert starke dokumentierte Isolation, ohne Hersteller-Temperaturen vom Gehen auf Radfahren zu \u00FCbertragen. Ein Regen- und K\u00E4ltefilter verlangt beide Eigenschaften im selben Produkt; h\u00E4ufig solltest du die zwei Schichten getrennt suchen.",
              )}
            </p>
            <p>
              {tr(
                "Schichtdauer und Fahrzeug ver\u00E4ndern die Reihenfolge. F\u00FCr l\u00E4ngere Schichten wird der belegte Komfort st\u00E4rker gewichtet; E-Bike priorisiert w\u00E4rmere Produkte. Beim Motorroller werden spezielle Radschuh-Systeme und Unterziehhandschuhe ausgeschlossen. Kleidung aus diesem Katalog ersetzt keine gepr\u00FCfte Motorrad-Schutzausr\u00FCstung.",
              )}
            </p>
            <a className="button" href="#/ausruestung">
              {tr("Zur Ausr\u00FCstung")}
              <ArrowRight size={17} />
            </a>
          </section>
        )}
        {route === "wissen" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">{tr("DER SCHICHT-RATGEBER")}</span>
            <h1>
              {tr("Gut angezogen.")}
              <br />
              <em>{tr("Besser unterwegs.")}</em>
            </h1>
            <p className="lead">
              {tr(
                "Ein paar einfache Routinen machen Ausr\u00FCstung im Arbeitsalltag n\u00FCtzlicher.",
              )}
            </p>
            <div className="guide-grid">
              <article>
                <span>{tr("01")}</span>
                <Layers />
                <h2>{tr("In Schichten denken")}</h2>
                <p>
                  {tr(
                    "Eine feuchtetransportierende Basis liegt an der Haut, dar\u00FCber kommt je nach Bedarf Isolation und au\u00DFen eine Wind- oder Regenh\u00FClle. Beim aktiven Treten fr\u00FCher l\u00FCften, in Pausen die W\u00E4rmeschicht erg\u00E4nzen. Nassgeschwitzte Kleidung isoliert im Stillstand schlechter.",
                  )}
                </p>
              </article>
              <article>
                <span>{tr("02")}</span>
                <CloudRain />
                <h2>{tr("Wasser findet die L\u00FCcke")}</h2>
                <p>
                  {tr(
                    "Bei Membranhandschuhen Jacken\u00E4rmel \u00FCber die B\u00FCndchen ziehen. Regenhose \u00FCber die Sch\u00E4fte von Schuhen oder \u00DCberschuhen legen. Auch ein wasserdichtes Material hilft wenig, wenn Wasser am offenen Rand hineinl\u00E4uft.",
                  )}
                </p>
              </article>
              <article>
                <span>{tr("03")}</span>
                <Wind />
                <h2>{tr("Atmen statt \u00FCberhitzen")}</h2>
                <p>
                  {tr(
                    "Wasserabweisend ist nicht wasserdicht. Eine dichte Regenh\u00FClle kann trotzdem innen feucht werden: Bel\u00FCftung nutzen und die Isolation an dein Tempo anpassen. Auf dem E-Bike oder beim Warten kann mehr W\u00E4rme n\u00F6tig sein als beim kr\u00E4ftigen Treten.",
                  )}
                </p>
              </article>
              <article>
                <span>{tr("04")}</span>
                <Snowflake />
                <h2>{tr("Ein trockenes Reservepaar")}</h2>
                <p>
                  {tr(
                    "Nasse Handschuhe und Socken m\u00F6glichst wechseln. Ein trocken verpacktes Ersatzpaar ist f\u00FCr lange Schichten sinnvoll. Handschuhe m\u00FCssen mit allen Fingern sicher bremsen und schalten lassen; Smartphone-Bedienung nur im Stillstand.",
                  )}
                </p>
              </article>
              <article>
                <span>{tr("05")}</span>
                <ShieldCheck />
                <h2>{tr("Sichtbar und gesch\u00FCtzt")}</h2>
                <p>
                  {tr(
                    "Funktionierendes Licht und die erforderlichen Reflektoren am Rad sind die Basis. Sichtbare Kleidung erg\u00E4nzt sie. Pr\u00FCfe, ob dein Rucksack Reflexfl\u00E4chen verdeckt. Eine Unterhelmm\u00FCtze darf den korrekten Helmsitz nicht ver\u00E4ndern.",
                  )}
                </p>
              </article>
              <article>
                <span>{tr("06")}</span>
                <Bike />
                <h2>{tr("Schnee ist kein Glatteis")}</h2>
                <p>
                  {tr(
                    "Eine profilierte Sohle bietet keine Garantie gegen Eis. Schneeprofil ist auch kein Nachweis f\u00FCr Haftung auf Pedalen. Bei unsicheren Verh\u00E4ltnissen Tempo reduzieren oder absteigen; auf dem Motorroller ist passende Motorrad-Schutzausr\u00FCstung erforderlich.",
                  )}
                </p>
              </article>
            </div>
            <p className="source-note">
              {tr("Grundlagen:")}
              {tr(" ")}
              <a
                href="https://www.adfc.de/artikel/kleidung-bei-kaelte"
                target="_blank"
                rel="noreferrer"
              >
                {tr("ADFC: Kleidung bei K\u00E4lte")}
              </a>
              {tr(" ")}
              {tr("und")}
              {tr(" ")}
              <a
                href="https://www.adfc.de/dossier/radfahren-im-winter-sicher-unterwegs-trotz-eis-und-schnee"
                target="_blank"
                rel="noreferrer"
              >
                {tr("ADFC: Radfahren im Winter")}
              </a>
              {tr(
                ". Die Hinweise ersetzen keine individuelle Passform- und Sicherheitspr\u00FCfung.",
              )}
            </p>
            <a className="button" href="#/ausruestung">
              {tr("Passende Ausr\u00FCstung finden")}
              <ArrowRight size={18} />
            </a>
          </section>
        )}
        {route === "impressum" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">{tr("RECHTLICHE INFORMATIONEN")}</span>
            <h1>{tr("Impressum")}</h1>
            {operator.name && operator.email && operator.address.length ? (
              <>
                <h2>{tr("Verantwortlicher Betreiber")}</h2>
                <p>
                  {tr(operator.name)}
                  <br />
                  {operator.address.map((line) => (
                    <span key={line}>
                      {tr(line)}
                      <br />
                    </span>
                  ))}
                  <a href={`mailto:${operator.email}`}>{tr(operator.email)}</a>
                </p>
                {operator.register && <p>{tr(operator.register)}</p>}
                {operator.vatId && (
                  <p>
                    {tr("USt-ID: ")}
                    {tr(operator.vatId)}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="notice">
                  {tr(
                    "Die Betreiberangaben sind noch nicht hinterlegt. Dieses Impressum ist unvollst\u00E4ndig.",
                  )}
                </div>
                <h2>{tr("Zu erg\u00E4nzende Betreiberangaben")}</h2>
                <dl className="legal-fields">
                  <dt>{tr("Name / Organisation")}</dt>
                  <dd>{tr("Noch nicht angegeben")}</dd>
                  <dt>{tr("Ladungsf\u00E4hige Anschrift")}</dt>
                  <dd>{tr("Noch nicht angegeben")}</dd>
                  <dt>{tr("Kontakt-E-Mail")}</dt>
                  <dd>{tr("Noch nicht angegeben")}</dd>
                  <dt>{tr("Register / Vertretungsberechtigte / USt-ID")}</dt>
                  <dd>
                    {tr("Falls auf den Betreiber zutreffend, zu erg\u00E4nzen")}
                  </dd>
                </dl>
              </>
            )}
            <h2>{tr("Projektstatus")}</h2>
            <p>
              {tr(
                "Unabh\u00E4ngiges Community-Projekt f\u00FCr Lieferfahrer in Aschaffenburg. Keine offizielle Website von Flink. Keine Verbindung, Partnerschaft oder Empfehlung durch das Unternehmen wird behauptet. Es werden keine Unternehmenslogos verwendet.",
              )}
            </p>
            <p>
              {tr(
                "Aktuell werden direkte Produktlinks ohne Affiliate-Konten verwendet. Vor kommerzieller Nutzung sind Betreiberangaben und rechtliche Informationspflichten zu vervollst\u00E4ndigen und die konkrete Betreiberkonstellation zu pr\u00FCfen. Je nach Betriebsform k\u00F6nnen Pflichten bereits f\u00FCr die \u00F6ffentliche Community-Seite gelten. Grundlage:",
              )}
              {tr(" ")}
              <a
                href="https://www.gesetze-im-internet.de/ddg/__5.html"
                target="_blank"
                rel="noreferrer"
              >
                {tr("\u00A7 5 DDG")}
              </a>
              {tr(".")}
            </p>
            <h2>{tr("Redaktionelle Informationen")}</h2>
            <p>
              {tr("Recherche vom ")}
              {tr(dateLabel(RESEARCH_DATE))}
              {tr(
                ". Keine eigenen Praxistests; keine Zusage bestimmter Preise oder Lagerbest\u00E4nde.",
              )}
              {tr(" ")}
              <a href="#/methodik">{tr("Bewertungsmethodik und Grenzen")}</a>
              {tr(".")}
            </p>
          </section>
        )}
        {route === "datenschutz" && (
          <section className="document-page section-wrap">
            <span className="eyebrow">
              {tr("LOKALE MERKLISTE. KEIN KONTO.")}
            </span>
            <h1>{tr("Datenschutz")}</h1>
            <p className="lead">
              {tr(
                "Die Anwendung verwendet keine Analyse- oder Werbetracker, keine Registrierung und keine selbst gesetzten Cookies.",
              )}
            </p>
            <h2>{tr("Verantwortlicher")}</h2>
            <p>
              {tr(
                operator.name
                  ? operator.name
                  : "Die verantwortliche Betreiberidentität und Kontaktadresse müssen noch ergänzt werden.",
              )}
              {tr(" ")}
              {tr("Siehe ")}
              <a href="#/impressum">{tr("Impressum")}</a>
              {tr(
                ". Die Datenschutzhinweise sind bis zur Erg\u00E4nzung der Verantwortlichenangaben unvollst\u00E4ndig.",
              )}
            </p>
            <h2>{tr("Hosting durch GitHub Pages")}</h2>
            <p>
              {tr(
                "Beim Seitenaufruf \u00FCbertr\u00E4gt dein Browser technisch notwendige Verbindungsdaten an GitHub. GitHub erkl\u00E4rt, IP-Adressen der Besucher zu Sicherheitszwecken zu protokollieren und zu speichern. Informationen:",
              )}
              {tr(" ")}
              <a
                href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
                target="_blank"
                rel="noreferrer"
              >
                {tr("GitHub Pages: Datenerfassung")}
              </a>
              {tr(" ")}
              {tr("und")}
              {tr(" ")}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noreferrer"
              >
                {tr("GitHub-Datenschutzerkl\u00E4rung")}
              </a>
              {tr(
                ". Der Betreiber muss die f\u00FCr seine Konstellation passenden Rechtsgrundlagen, Empf\u00E4nger- und Drittlandinformationen erg\u00E4nzen.",
              )}
            </p>
            <h2>{tr("Merkliste und Outfit im Browser")}</h2>
            <p>
              {tr(
                "Auch deine Sprache wird lokal gespeichert. Der Offline-Speicher enth\u00E4lt nur \u00F6ffentliche App-Dateien und Artikeldaten dieses Projekts. Die Auswahl wird nicht an einen Server gesendet.",
              )}
            </p>
            <p>
              {tr(
                "Produkt-IDs aus Merkliste und Outfit sowie der gew\u00E4hlte Farbstil und die Einstellung f\u00FCr Effekte werden in localStorage auf deinem Ger\u00E4t gespeichert. Die Anwendung sendet diese Auswahl nicht an einen Server. Die Daten bleiben bis zum L\u00F6schen oder Entfernen der Browserdaten bestehen. Bei blockiertem Speicher funktionieren die Auswahlen nur f\u00FCr die laufende Sitzung. Zweck ist die von dir gew\u00E4hlte Merk- und Konfigurationsfunktion.",
              )}
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
              {tr("Lokale Auswahl l\u00F6schen")}
            </button>
            <h2>{tr("Shoplinks und Bilder")}</h2>
            <p>
              {tr(
                "Shopseiten werden erst durch einen Klick ge\u00F6ffnet. Danach gilt die Datenschutzerkl\u00E4rung des jeweiligen H\u00E4ndlers. Originalfotos werden \u00FCberwiegend direkt von den offiziellen Bildservern von Decathlon, Action, GripGrab (Shopify), Strauss, Lidl, VAUDE, Endura, Shimano und THE HEAT COMPANY (CloudFront) geladen. Dabei erhalten diese Anbieter technisch bedingt deine IP-Adresse und Browserinformationen. Wir laden nur die Bilddateien, keine Shop-Skripte oder Werbepixel, und senden keinen Seiten-Referrer. Vier freigegebene Pressefotos, Fahrerillustration und Schriftdateien liegen lokal bei der Website. Es gibt keine externen Schriftserver.",
              )}
            </p>
            <h2>{tr("Kommerzielle Verlinkungen")}</h2>
            <p>
              {tr(
                "Derzeit sind keine Affiliate-URLs hinterlegt. Wenn sp\u00E4ter eigene Affiliate-Links eingetragen werden, erscheinen sie mit einem sichtbaren Werbehinweis und entsprechender Linkkennzeichnung. Vor Aktivierung muss der Betreiber diese Datenschutzhinweise um die tats\u00E4chlich eingesetzten Programme erg\u00E4nzen.",
              )}
            </p>
            <h2>{tr("Deine Rechte")}</h2>
            <p>
              {tr(
                "Soweit personenbezogene Daten verarbeitet werden, bestehen nach den jeweiligen gesetzlichen Voraussetzungen insbesondere Rechte auf Auskunft, Berichtigung, L\u00F6schung, Einschr\u00E4nkung, Daten\u00FCbertragbarkeit und Widerspruch sowie Beschwerde bei einer Datenschutzaufsichtsbeh\u00F6rde. F\u00FCr die Aus\u00FCbung gegen\u00FCber dem Betreiber muss dessen Kontaktadresse im Impressum erg\u00E4nzt werden.",
              )}
            </p>
            <p>
              {tr("Stand: ")}
              {tr(dateLabel(RESEARCH_DATE))}
              {tr(".")}
            </p>
          </section>
        )}
        {!isWorkspace &&
          ![
            "outfit",
            "wissen",
            "methodik",
            "impressum",
            "datenschutz",
          ].includes(route) && (
            <section className="empty-state section-wrap">
              <h1>{tr("Diese Seite gibt es hier nicht.")}</h1>
              <a className="button" href="#/">
                {tr("Zur Startseite")}
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
                {tr("FLINK ASCHAFFENBURG")}
                <small>{tr("CHAT PROJEKT")}</small>
              </span>
            </a>
            <p>
              {tr("F\u00FCr gute Schichten.")}
              <br />
              {tr("Und trockene Heimwege.")}
            </p>
          </div>
          <div className="footer-bottom">
            <p>
              {tr(
                "Unabh\u00E4ngiges Community-Projekt f\u00FCr Lieferfahrer in Aschaffenburg.",
              )}
              <br />
              {tr(
                "Keine offizielle Website von Flink. Auch keine Partnerschaft mit Wolt, Uber Eats oder Lieferando.",
              )}
            </p>
            <nav aria-label={tr("Weitere Informationen")}>
              <a href="#/methodik">{tr("Bewertung & Quellen")}</a>
              <a href="#/impressum">{tr("Impressum")}</a>
              <a href="#/datenschutz">{tr("Datenschutz")}</a>
              <a href={repositoryUrl} target="_blank" rel="noreferrer">
                {tr("GitHub")}
                <ArrowUpRight size={13} />
              </a>
            </nav>
          </div>
          <small>
            {tr("Recherche ")}
            {tr(dateLabel(RESEARCH_DATE))}
            {tr(
              " \u00B7 Preise k\u00F6nnen sich \u00E4ndern \u00B7 Keine eigenen Praxistests",
            )}
          </small>
        </div>
      </footer>
      {compare.length > 0 && !isWorkspace && (
        <div className="compare-bar">
          <span>
            <GitCompareArrows size={19} />
            {compare.length}
            {tr("/3 ")}
            <small>{tr(groupLabels[compared[0].group])}</small>
          </span>
          <button className="button light" onClick={() => setCompareOpen(true)}>
            {tr("Vergleich \u00F6ffnen")}
            <ArrowRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={tr("Vergleich leeren")}
            onClick={() => setCompare([])}
          >
            <X size={19} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {tr(toast)}
        </div>
      )}
      {storageError && (
        <div className="storage-notice" role="status">
          {tr(
            "Dein Browser blockiert lokalen Speicher. Die Auswahl bleibt nur in dieser Sitzung erhalten.",
          )}
        </div>
      )}
      {details && (
        <Modal
          title={tr("{0} \u00B7 {1}", {
            "0": details.brand,
            "1": details.name,
          })}
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
              {tr("Zum Outfit")}
            </button>
            <ShopButton p={details} />
          </div>
        </Modal>
      )}
      {compareOpen && (
        <Modal
          title={tr("Dein Produktvergleich")}
          wide
          onClose={() => setCompareOpen(false)}
        >
          <p className="muted">
            {tr(
              "Bis zu drei Produkte derselben Produktgruppe. Redaktionelle Eignung, kein eigener Praxistest.",
            )}
          </p>
          {compared.length ? (
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>{tr("Merkmal")}</th>
                    {compared.map((p) => (
                      <th key={p.id}>
                        <ProductImage product={p} compact />
                        <span>
                          {tr(p.brand)}
                          <br />
                          {tr(p.name)}
                        </span>
                        <button
                          className="text-button"
                          onClick={() =>
                            setCompare((ids) => ids.filter((id) => id !== p.id))
                          }
                        >
                          {tr("Entfernen")}
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
                      <th>{tr(row)}</th>
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
            <p>{tr("Dein Vergleich ist leer.")}</p>
          )}
        </Modal>
      )}
      {favoritesOpen && (
        <Modal
          title={tr("Deine Merkliste \u00B7 {0}", { "0": favorites.length })}
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
              <h3>{tr("Gute Ausr\u00FCstung im Blick behalten.")}</h3>
              <p>
                {tr(
                  "Tippe auf das Herz einer Produktkarte. Deine Merkliste wird nur in deinem Browser gespeichert.",
                )}
              </p>
              <button
                className="button"
                onClick={() => setFavoritesOpen(false)}
              >
                {tr("Produkte entdecken")}
              </button>
            </div>
          )}
        </Modal>
      )}
      {copyFallback && (
        <Modal
          title={tr("Einkaufsliste kopieren")}
          onClose={() => setCopyFallback("")}
        >
          <p>
            {tr(
              "Der Browser erlaubt gerade keinen direkten Zugriff auf die Zwischenablage. Markiere und kopiere die Liste hier.",
            )}
          </p>
          <textarea
            className="copy-fallback"
            readOnly
            value={copyFallback}
            aria-label={tr("Einkaufsliste zum manuellen Kopieren")}
            onFocus={(e) => e.target.select()}
          />
        </Modal>
      )}
    </div>
  );
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
        {tr(p.retailOnly ? "Offizielle Produktseite" : "Beim Händler öffnen")}
        <ArrowUpRight size={16} />
      </a>
      {link.affiliate && (
        <small className="affiliate-note">{tr(link.label)}</small>
      )}
    </div>
  );
}
function ProductDetails({ p }: { p: Product }) {
  const score = scoreOf(p);
  const w = weights[p.group];
  const photo = photoFor(p.id);
  return (
    <>
      <div className="detail-product">
        <ProductImage product={p} />
        <div>
          <span className="eyebrow">
            {tr(tierLabels[p.tier])}
            {tr(" \u00B7 ")}
            {tr(p.shop)}
            {tr(p.retailOnly ? " · NUR FILIALE" : "")}
          </span>
          <strong>
            {tr(
              p.price === null
                ? "Preis nicht überprüfbar"
                : `${p.priceKind === "from" ? "ab " : ""}${money(p.price)}`,
            )}
          </strong>
          <p>{tr(p.priceNote)}</p>
          <small>
            {tr("Recherche / Preisbeobachtung: ")}
            {tr(dateLabel(p.checked))}
            {tr(
              p.sourceMethod === "catalogue"
                ? " · öffentlicher Händlerkatalog"
                : " · öffentlich recherchierte Produktseite / Suchindex",
            )}
          </small>
        </div>
      </div>
      {photo && (
        <p className="photo-source">
          {tr(photo.credit)}
          {tr(". ")}
          {tr(photo.variant)}
          {tr(" Farbe und Ausf\u00FChrung im Shop pr\u00FCfen.")}
          {tr(" ")}
          <a href={photo.source} target="_blank" rel="noopener noreferrer">
            {tr(
              photo.delivery === "local-press"
                ? "Bildquelle / Pressebereich ↗"
                : "Originalfoto: Produktseite ↗",
            )}
          </a>
        </p>
      )}
      <p className="lead">{tr(p.use)}</p>
      {p.caution && (
        <div className="notice">
          <b>{tr("Anwendungshinweis")}</b>
          <p>{tr(p.caution)}</p>
        </div>
      )}
      {p.badge && (
        <div className="notice green">
          <b>{tr(p.badge.label)}</b>
          <p>{tr(p.badge.reason)}</p>
        </div>
      )}
      <div className="detail-columns">
        <div>
          <h3>{tr("Was daf\u00FCr spricht")}</h3>
          <ul>
            {p.pros.map((s) => (
              <li key={s}>{tr(s)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{tr("Wo die Grenzen liegen")}</h3>
          <ul>
            {p.cons.map((s) => (
              <li key={s}>{tr(s)}</li>
            ))}
          </ul>
        </div>
      </div>
      <dl className="detail-facts">
        <dt>{tr("N\u00E4sseschutz")}</dt>
        <dd>
          {tr(waterLabels[p.water])}
          {tr(". ")}
          {tr(p.waterNote)}
        </dd>
        <dt>{tr("W\u00E4rme")}</dt>
        <dd>{tr(p.warmthNote)}</dd>
        <dt>{tr("Material / Aufbau")}</dt>
        <dd>{tr(p.material)}</dd>
        <dt>{tr("Datenlage")}</dt>
        <dd>{tr(p.uncertainty)}</dd>
        {p.compatibility && (
          <>
            <dt>{tr("Kompatibilit\u00E4t")}</dt>
            <dd>
              {tr(
                p.compatibility === "flatshoe"
                  ? "Nur für passende Flat-Pedal-MTB-Schuhe; vollständig flache Sohle oder versenkte Cleats. Keine Kompatibilität mit beliebigen Alltagsschuhen."
                  : p.compatibility === "flatbar"
                    ? "Nur für passende gerade oder City-Lenker. Bremsen, Schaltung und freies Herausziehen der Hände vor der Fahrt prüfen."
                    : p.compatibility === "spd"
                      ? "MTB-/SPD-Konstruktion; passende Pedale bzw. Plattformsitz prüfen."
                      : p.compatibility === "road"
                        ? "Für Rennradschuhe; nicht für beliebige Alltagsschuhe."
                        : "Für Gravel-Radschuhe; passende Sohlenöffnungen prüfen.",
              )}
            </dd>
          </>
        )}
      </dl>
      <h3>
        {tr("Redaktionelle Eignung:")}
        {tr(" ")}
        {tr(score.score === null ? "Daten unzureichend" : `${score.score}/100`)}
      </h3>
      <p className="muted">
        {tr(
          score.score === null
            ? "Wesentliche Eigenschaften sind unzureichend dokumentiert. Wir vergeben keine scheinpräzise Zahl."
            : `Gewichtete Datenabdeckung ${score.coverage} %. Auf fünf Punkte gerundet; keine Kundenrezension und kein eigener Praxistest.`,
        )}
      </p>
      {p.assessment && (
        <table className="score-table">
          <thead>
            <tr>
              <th>{tr("Kriterium")}</th>
              <th>{tr("Stufe")}</th>
              <th>{tr("Gewicht")}</th>
            </tr>
          </thead>
          <tbody>
            {criterionLabels.map((c, i) => (
              <tr key={c}>
                <th>{tr(c)}</th>
                <td>
                  {tr(
                    p.assessment![i] === null
                      ? "Nicht belegt"
                      : `${p.assessment![i]}/5`,
                  )}
                </td>
                <td>
                  {w[i]}
                  {tr(" %")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        <a href="#/methodik">{tr("Bewertungsregeln und Gewichtungen lesen")}</a>
      </p>
      <p className="source-note">
        {tr("Prim\u00E4rquelle:")}
        {tr(" ")}
        <a href={p.url} target="_blank" rel="noreferrer">
          {tr(p.shop)}
          {tr(": konkrete Produktseite \u2197")}
        </a>
        {p.independentSource && (
          <>
            {tr(" ")}
            {tr("\u00B7")}
            {tr(" ")}
            <a href={p.independentSource} target="_blank" rel="noreferrer">
              {tr("Erg\u00E4nzende Test- oder Kundenquelle \u2197")}
            </a>
          </>
        )}
      </p>
    </>
  );
}
