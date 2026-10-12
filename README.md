# Flink Aschaffenburg Chat Projekt

Ein unabhängiger Ausrüstungsberater für Lieferfahrer in Aschaffenburg. **Keine offizielle Website von Flink und keine Partnerschaft.**

Live: https://disorder119.github.io/flink-aschaffenburg-chat-projekt/

## Was die Anwendung bietet

- Rosa Rider-Studio mit fünf auswählbaren Körperregionen, drehbarer 3D-Figur und leichter SVG-Ansicht. Farbstile für Flink, Wolt, Uber Eats, Lieferando und die Community, ohne Markenlogos oder behauptete Partnerschaften.
- Feste Konfiguratorfläche: Körperbereich, Budget, Artikel, Filter, Merkliste, Sets und Outfit wechseln auf demselben Bildschirm. Ein Produkt pro Ansicht mit Pfeiltasten und kompakter Direktwahl. Kaufaktionen und Live-Summe bleiben erreichbar; umfangreiche Filter und Informationen scrollen nur im Inhaltsbereich.
- 72 recherchierte Modelle, darunter zwei abnehmbare Lenkerstulpen. 61 erhalten eine redaktionelle Eignungsbewertung; bei unzureichenden Daten bleibt die Zahl offen.
- Fünf echte, modellgenau zugeordnete Pressefotos, sichtbare Bildquellen, Foto-Filter und Bilder in Produktdetails, Vergleich und Outfit. Übrige Produkte behalten gekennzeichnete Symbolbilder.
- Budget, exakter maximaler Artikelpreis, Wetter, Fahrzeug, Schichtdauer, Suche und Sortierung.
- Lokale Merkliste, Vergleich von maximal drei Artikeln derselben Produktgruppe und Körperregion.
- Outfit-Auswahl mit zusätzlichen Schichten, Cent-genauer Artikelsumme und kopierbarer Einkaufsliste.
- Drei vorbereitete Sets mit jeweils acht echten Artikeln. Die Preise werden aus Produktdaten berechnet.
- Deutsche Ratgeber-, Bewertungs-, Datenschutz- und Impressumsseiten.

## Lokal starten

Node.js 24 und npm verwenden:

```sh
npm ci
npm run dev
```

Die Vite-Base ist `/flink-aschaffenburg-chat-projekt/`. Die Anwendung läuft entsprechend unter diesem Pfad. Für die Produktionsvorschau:

```sh
npm test
npm run build
npm run preview
```

## Deployment

Der GitHub-Actions-Workflow `.github/workflows/pages.yml` führt Tests und Produktionsbuild aus und veröffentlicht `dist` über GitHub Pages. In den Repository-Einstellungen muss **Pages → Source: GitHub Actions** gesetzt sein. Änderungen auf `main` lösen das Deployment aus.

Hash-Navigation (`#/outfit`, `#/methodik` etc.) funktioniert auf Project Pages und bei direktem Aufruf ohne Server-Rewrites. Assets und lokal geladene Manrope-Schriftdateien nutzen die konfigurierte Vite-Base. Eine `.nojekyll`-Datei verhindert Jekyll-Verarbeitung.

## Produktdaten und Recherche

- `src/data/products.ts`: redaktionelle Produktangaben, Quellen, Preisbeobachtung, Stufen, Nachteile und Grenzen.
- `src/data/gripgrab-source.json`: 33 ausgewählte konkrete Modelle aus dem öffentlichen GripGrab-Katalog, inklusive beobachteter EUR-Preise.
- `src/data/photos.json`: Zuordnung von Foto, Modellvariante, Pressequelle, Nutzungsangebot und Prüfdatum.
- `src/lib/logic.ts`: nachvollziehbare Gewichtungen, Filter, Vergleichsgrenzen und Berechnung.
- `src/data/kits.ts`: Zusammenstellung der drei Sets.
- `research/RESEARCH.md`: Recherchenachweis und Einschränkungen.
- `qa/QA.md` und `qa/link-check.json`: dokumentierte Prüfungen.

Recherche: **11.10.2026**, Ergänzungen am **12.10.2026**. Preise sind beobachtete Artikelpreise inkl. MwSt. und ohne Versand; keine Echtzeit-Preis- oder Lagerzusage. Hersteller-/Händlerseiten können Suchindexfassungen enthalten. Technische Eigenschaften werden nicht als eigene Messergebnisse ausgegeben. Eine unbekannte Eigenschaft bleibt ausdrücklich unbekannt.

Action verkauft diese Artikel in Filialen. Die Website verlinkt offizielle Informationsseiten und behauptet keine Online-Bestellmöglichkeit. Packpreise (Thermosocken) und Strauss-Einzelpreise inkl. MwSt. werden korrekt verwendet; Staffelrabatte nicht als Einzelpreis dargestellt.

## Affiliate-Konfiguration

`src/config/affiliate.ts` ist zentral und zunächst leer:

```ts
export const affiliateLinks = {
  "dec-cap": {
    url: "HIER_DIE_EIGENE_GENEHMIGTE_HTTPS_AFFILIATE_URL",
    label: "Werbelink · Provision möglich",
  },
};
```

Dieses Muster ist eine Konfigurationsanleitung, kein funktionsfähiger Affiliate-Link. Nur eigene, tatsächlich genehmigte URLs hinterlegen. Keine erfundenen IDs, keine heimlichen Parameter und keine Weiterleitungsverschleierung. Vor Aktivierung Partnerregeln, Impressum und Datenschutzhinweise prüfen. Alle Einkaufswege verwenden denselben Resolver; vergütete Links erhalten sichtbare Kennzeichnung und `rel="sponsored"`.

## Betreiberangaben ergänzen

`src/config/operator.ts` enthält bewusst keine erfundene Identität. Name, ladungsfähige Anschrift und Kontakt-E-Mail müssen ergänzt werden; weitere Felder je nach Betreiberkonstellation. Das öffentliche Impressum und die Datenschutzhinweise zeigen den unvollständigen Status. Diese offenen rechtlichen Angaben können bereits für den öffentlichen Betrieb relevant sein und müssen vor kommerzieller Nutzung zwingend geprüft werden.

Die Anwendung setzt keine Tracker und keine eigenen Cookies ein. Favoriten und Outfit bleiben in localStorage. GitHub Pages protokolliert laut GitHub IP-Adressen zu Sicherheitszwecken. Shopanbieter erhalten Verbindungsdaten erst beim Öffnen ihres Links.

## Assets und Wartung

Fahrer, 3D-Modell und Symbolabbildungen sind eigenständig erstellt. Fünf echte Pressefotos von Decathlon und GripGrab werden lokal mit sichtbaren Credits im redaktionellen Kontext verwendet; Quellen und Grenzen stehen in `research/PHOTOS.md`. Die Foto-Zuordnung ersetzt keine Erlaubnis für Werbung: `photoFor` blendet Pressefotos bei aktivierter Affiliate-Konfiguration bis zu einer gesonderten Rechteprüfung aus. Symbolbilder bleiben ausdrücklich gekennzeichnet. Manrope ist lokal eingebunden; die SIL-OFL steht in `public/manrope-OFL.txt`. Abhängigkeiten und deren Lizenzhinweise bleiben zu beachten.

Auf Touch-Geräten und bei Bildschirmbreiten bis 760 Pixel startet die leichte SVG-Ansicht. Bei Datensparen, sehr langsamer Verbindung oder höchstens 4 GB RAM / vier CPU-Kernen wird WebGL nicht geladen. Auf geeigneten Geräten ist 3D optional, auf leistungsfähigen Desktop-Geräten automatisch. Die separate 3D-Datei wird dynamisch geladen; maximal 24 Bilder/s, Pixelverhältnis 1, Pause außerhalb des sichtbaren Bereichs. Reduzierte Bewegung wird respektiert, Effekte lassen sich ausschalten. Im Konfigurator ist jeweils eine kompakte Produktkarte gemountet; Fotos laden verzögert. Die Höhe folgt dem sichtbaren Browserfenster, Eingaben auf dem Handy erhalten mehr Platz. Keine neue Laufzeitabhängigkeit für diesen Umbau.

`src/components/RiderWorkspace.tsx` enthält den Konfigurator; `src/lib/workspace.ts` die Routen- und Auswahlregeln. Direkte Hash-Aufrufe von `#/filter`, `#/merkliste` und `#/sets` funktionieren zusätzlich zu den bestehenden Outfit- und Informationsseiten. Der Browser-Zurück-Knopf wechselt zwischen den Ansichten. Prüfungen dieses Umbaus stehen in `qa/WORKSPACE-2026-10-12.md`.

```sh
npm run check:links
```

Der Linkcheck schreibt einen Bericht, aber ersetzt keine Prüfung der konkreten Produktidentität, Varianten und Preise. 403/429/Challenges gelten als nicht automatisiert verifizierbar, nicht als erfolgreiche Links. Externe Liveprüfungen blockieren nicht den Build, weil Händler Maschinenzugriffe sperren können.
