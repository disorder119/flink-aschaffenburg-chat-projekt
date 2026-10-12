import { useEffect, useMemo, useState } from "react";
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
export function App() {
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
    [filters, favorites],
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
    if (
      ["base", "liner", "sock", "cover", "pogie"].includes(p.group) &&
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
            <a
              className={isWorkspace && route !== "outfit" ? "active" : ""}
              href="#/ausruestung"
            >
              Ausrüstung
            </a>
            <a className={route === "outfit" ? "active" : ""} href="#/outfit">
              Winter-Outfit
            </a>
            <a className={route === "wissen" ? "active" : ""} href="#/wissen">
              Wissen
            </a>
            <a href="#/methodik">Bewertung</a>
            <a href="#/impressum">Impressum</a>
            <a href="#/datenschutz">Datenschutz</a>
          </nav>
          <div className="header-actions">
            <button
              className="motion-button icon-button"
              aria-label={
                experience.motion
                  ? "Animationen ausschalten"
                  : "Animationen einschalten"
              }
              aria-pressed={experience.motion}
              onClick={() => experience.setMotion(!experience.motion)}
              title={
                experience.motion
                  ? "Animationen ausschalten"
                  : "Animationen einschalten"
              }
            >
              <Sparkles size={18} />
              <span>Effekte</span>
            </button>
            <button
              className="saved-button"
              onClick={() =>
                isWorkspace ? navigate("merkliste") : setFavoritesOpen(true)
              }
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
              Produkt-IDs aus Merkliste und Outfit sowie der gewählte Farbstil
              und die Einstellung für Effekte werden in localStorage auf deinem
              Gerät gespeichert. Die Anwendung sendet diese Auswahl nicht an
              einen Server. Die Daten bleiben bis zum Löschen oder Entfernen der
              Browserdaten bestehen. Bei blockiertem Speicher funktionieren die
              Auswahlen nur für die laufende Sitzung. Zweck ist die von dir
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
              Datenschutzerklärung des jeweiligen Händlers. Produktfotos,
              Illustrationen und Schriftdateien werden lokal mit der Website
              geladen; die Anwendung lädt keine externen Produktbilder,
              Werbepixel oder Schriftserver.
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
        {!isWorkspace &&
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
              Keine offizielle Website von Flink. Auch keine Partnerschaft mit
              Wolt, Uber Eats oder Lieferando.
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
      {compare.length > 0 && !isWorkspace && (
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
                        <ProductImage product={p} compact />
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
  const photo = photoFor(p.id);
  return (
    <>
      <div className="detail-product">
        <ProductImage product={p} />
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
      {photo && (
        <p className="photo-source">
          {photo.credit}. {photo.variant} Farbe und Ausführung im Shop prüfen.{" "}
          <a href={photo.source} target="_blank" rel="noopener noreferrer">
            Bildquelle / Pressebereich ↗
          </a>
        </p>
      )}
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
              {p.compatibility === "flatshoe"
                ? "Nur für passende Flat-Pedal-MTB-Schuhe; vollständig flache Sohle oder versenkte Cleats. Keine Kompatibilität mit beliebigen Alltagsschuhen."
                : p.compatibility === "flatbar"
                  ? "Nur für passende gerade oder City-Lenker. Bremsen, Schaltung und freies Herausziehen der Hände vor der Fahrt prüfen."
                  : p.compatibility === "spd"
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
