# Flink Aschaffenburg Chat Projekt

Ein unabhängiger Ausrüstungsberater für Lieferfahrer in Aschaffenburg. **Keine offizielle Website von Flink und keine Partnerschaft.**

Live: https://disorder119.github.io/flink-aschaffenburg-chat-projekt/

## Was die Anwendung bietet

- Eigenständige SVG-Fahrerfigur mit fünf per Touch und Tastatur auswählbaren Körperregionen.
- 67 recherchierte Modelle, mindestens drei pro Körperregion und Budgetstufe. 56 erhalten eine redaktionelle Eignungsbewertung; bei unzureichenden Daten bleibt die Zahl offen.
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
- `src/data/gripgrab-source.json`: 30 ausgewählte konkrete Modelle aus dem öffentlichen GripGrab-Katalog, inklusive beobachteter EUR-Preise.
- `src/lib/logic.ts`: nachvollziehbare Gewichtungen, Filter, Vergleichsgrenzen und Berechnung.
- `src/data/kits.ts`: Zusammenstellung der drei Sets.
- `research/RESEARCH.md`: Recherchenachweis und Einschränkungen.
- `qa/QA.md` und `qa/link-check.json`: dokumentierte Prüfungen.

Recherche: **11.10.2026**. Preise sind beobachtete Artikelpreise inkl. MwSt. und ohne Versand; keine Echtzeit-Preis- oder Lagerzusage. Hersteller-/Händlerseiten können Suchindexfassungen enthalten. Technische Eigenschaften werden nicht als eigene Messergebnisse ausgegeben. Eine unbekannte Eigenschaft bleibt ausdrücklich unbekannt.

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

Fahrer und Symbolabbildungen sind eigenständig erstellte SVGs, keine kopierten Markenlogos oder Produktfotos. Symbolabbildungen sind als solche gekennzeichnet. Manrope ist lokal eingebunden; die SIL-OFL steht in `public/manrope-OFL.txt`. Abhängigkeiten und deren Lizenzhinweise bleiben zu beachten.

```sh
npm run check:links
```

Der Linkcheck schreibt einen Bericht, aber ersetzt keine Prüfung der konkreten Produktidentität, Varianten und Preise. 403/429/Challenges gelten als nicht automatisiert verifizierbar, nicht als erfolgreiche Links. Externe Liveprüfungen blockieren nicht den Build, weil Händler Maschinenzugriffe sperren können.
