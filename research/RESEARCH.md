# Recherche und Quellenqualität

Recherche durchgeführt am **11.10.2026**. [Produktregister](PRODUCTS.md) mit 67 unterschiedlichen konkreten Modellen und direkten Hersteller-/Händlerseiten. Mindestens drei Modelle pro Körperregion und Budgetstufe. Recherchierte Daten und redaktionelle Interpretationen sind getrennte Felder.

## Primärquellen

- Action Deutschland: konkrete Produktseiten, deutsche Thermokleidungs- und Regenbekleidungskategorien. Geprüft wurden Thermohandschuhe, Wintermützen, Nackenwärmer, Thermoshirts/-hosen, Funktionswäsche, Thermosocken und Regenbekleidung. Die Regenjacke nennt je Variante widersprüchlich wasserdicht / wasserabweisend; deshalb **keine** Starkregen-Freigabe und keine Punktzahl. Das 12,95-€-Regenset hat keinen belegten technischen Dichtigkeitswert; ebenfalls keine Punktzahl. Lose Ponchos, Kinderartikel und allgemeine Kategorieversprechen wurden nicht zu geeigneter Kurierausrüstung erklärt. Die aufgeführten Artikel sind Filialware; keine Online-Bestellung behauptet.
- Decathlon Deutschland: konkrete VAN-RYSEL-, BTWIN-, QUECHUA- und SIMOND-Artikel. Wärmebereiche werden in den Grenzen erklärt, nicht von Gehen auf Radfahren übertragen. EDR waterproof (8–15 °C) ist kein Frosthandschuh. Der Raincut-Schutz ist laut Hersteller für ungefähr eine Stunde leichten Regen vorgesehen. Die Quelle zum Winterhandschuh 500 erklärt ihn ausdrücklich als nicht wasserdicht.
- Lidl Deutschland: konkrete CRIVIT-Artikel mit Artikelnummern. Beobachtete Produktseitenpreise können von Kategorien oder Aktionen abweichen. Diese Unterschiede stehen in den Preisnotizen. Handschuhe ohne belegte Dichtigkeit oder Radfunktion erhalten keinen vollständigen Eignungsscore.
- Strauss Deutschland: konkrete Unterhosen. **Einzelpreis mit Mehrwertsteuer** verwendet, nicht Netto- oder Dreier-Staffelpreis: 22,49 € basis-warm, 37,96 € thermo stretch-x-warm.
- VAUDE Deutschland: drei Regenhosen und Luminum-Regenjacke. Ab-Preise werden als solche dargestellt. Der API-/Seitenstatus enthält teils mehrere Verfügbarkeitszustände für Varianten; daher keine pauschale Lagerzusage. Die Luminum-Jacke ist eine Regenhülle, keine warme Winterjacke.
- Bike-Discount Deutschland: konkrete Endura-MT500-Regenhose, Shimano-MW702-Winterschuh und VAUDE-Minaki-III-STX-Winterschuh. Ein entfallenes Jackenangebot wurde über die sichtbare Shopsuche ersetzt. Aktuell im Browser beobachtet: Endura-Hose 144,99 €, Shimano 169,99 €, VAUDE-Schuh 168,00 €. Radschuh-/SPD-Einschränkungen sind sichtbar; keine Glatteis- oder Plattformgrip-Garantie.
- GripGrab: 30 individuell ausgewählte Modelle aus dem [öffentlichen offiziellen Produktkatalog](https://www.gripgrab.com/products.json?limit=250), direkt im Netzwerk abgerufen. EUR-Preise gegen angezeigte Produktseiten-/Suchindexwährung plausibilisiert. Keine Kinder- oder Sommermodelle und keine Farbvarianten als zusätzliche Modelle gezählt. Körper- und Einsatzmerkmale aus den Modellbeschreibungen. Keine Werbeaussagen zu Lebensdauer, Hygiene oder Heilwirkung übernommen.

Weitere angefragte Händler/Marken: Aldi, Regatta, GOREWEAR und Sealskinz. Ein recherchiertes Regatta-Matt-II-Angebot wurde nach HTTP-404 aus dem aktiven Katalog entfernt. Für Aldi wurde kein hinreichend belegtes aktuelles konkretes Angebot mit geeignetem Produktlink aufgenommen. GOREWEAR-Suchergebnisse enthielten Länder-/Altangebote ohne ausreichend verifizierten deutschen Kaufpreis. Sealskinz-Angebote wurden geprüft, aber nicht als zusätzliche unvollständig gelesene Modelle importiert. Es gibt keine erfundenen Ersatzangebote für diese Händler.

## Ergänzende Quellen

- [Cyclingnews: Winterhandschuhe 2026](https://www.cyclingnews.com/features/best-winter-cycling-gloves/): unabhängige Einordnung für GripGrab Polaris 2. Nur kurze eigene Zusammenfassung, keine reproduzierten Testtabellen oder Temperaturgarantie.
- [Decathlon EDR waterproof: Kundenberichte](https://www.decathlon.de/r/fahrrad-handschuhe-wasserdicht-zwischensaison-900-waterproof/347153/c382m8803784): gemischte Aussagen zur Dichtigkeit; keine eigenen Tests.
- [Decathlon City-900-Überschuhe: Kundenberichte](https://www.decathlon.de/r/fahrrad-uberschuhe-city-900-wasserdicht-schwarz/352807/c1m8872116): gemischte Aussagen zur Dichtigkeit; keine eigenen Tests.
- [ADFC: Kleidung bei Kälte](https://www.adfc.de/artikel/kleidung-bei-kaelte), [ADFC: Radfahren im Winter](https://www.adfc.de/dossier/radfahren-im-winter-sicher-unterwegs-trotz-eis-und-schnee): Grundlagen für den knappen Schicht-Ratgeber.
- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html), [GitHub-Pages-Datenerfassung](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): Rechts-/Datenschutzinformationen und klar benannte Lücken, keine erfundene Betreiberidentität.

## Preis- und Linkprüfung

Die Preisprüfung besteht aus Recherchebeobachtungen, **nicht** aus einer Livepreis-API sämtlicher Shops. Einige öffentlich recherchierte Seiten sind Suchindexfassungen mit eigener Crawl-Latenz. `checked` bezeichnet den Recherchetag. Bei abweichenden Kategorien, Varianten oder Staffelpreisen dokumentieren Preisnotizen diese Unsicherheit.

Ein automatischer GET-Linkcheck mit maximal vier parallelen Anfragen schreibt [qa/link-check.json](../qa/link-check.json). HTTP 200 belegt den Abruf, nicht automatisch Produktbestand oder Verfügbarkeit. Händler-Challenges werden als `automated-access-blocked` erfasst; sie werden nicht umgangen. Ergänzende Browserstichproben stehen in [qa/QA.md](../qa/QA.md).

## Redaktionelle Einordnung

56 Modelle haben mindestens 80 % gewichtete Datenabdeckung und keine wesentliche ungeklärte Produkteigenschaft. Elf bleiben ohne Gesamtpunktzahl. Stufen von 0–5 sind redaktionelle Ausstattungsurteile, keine Messdaten. Der 0–100-Score wird auf fünf Punkte gerundet. Die UI erklärt die Formel, Gewichtungen je Produktgruppe, Unsicherheit und Grenzen. Bewertungsdaten befinden sich zentral in `src/lib/logic.ts` und den einzelnen Produktdatensätzen.
