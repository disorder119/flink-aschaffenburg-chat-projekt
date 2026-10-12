# Originalbilder der Empfehlungen · 12.10.2026

Alle 72 Empfehlungen haben ein Foto des konkret verlinkten Modells. Der Schlüssel in `src/data/photos.json` ist die Produkt-ID; `productUrl`, `sourceTitle` und `reference` dokumentieren die Zuordnung. Quelle, Originaldatei, Auslieferungs-URL, Variante und Prüfdatum sind getrennt gespeichert. Bilder werden vollständig mit `object-fit: contain` und ohne Farbmischung gezeigt. Eine Marke oder ähnliche Produktgruppe reicht nicht für eine Zuordnung.

Die City 940 ist Artikel 8797364 (graphitgrau), mit Originalbild p3100863 aus ihrer Produktgalerie. Die City 900 ist Artikel 8735752, Bild p3222422. Sie teilen sich kein Foto. Das ältere MT900-Pressefoto mit FORCLAZ-Markierung wurde durch das aktuelle Galeriefoto p2572825 der verlinkten Artikelnummer 8655822 ersetzt.

## Quellen

- GripGrab: 33 Modelle anhand des öffentlichen Herstellerkatalogs `https://www.gripgrab.com/products.json?limit=250` mit exakt passendem Handle, Titel und SKU. Vier vorhandene Modell-Packshots aus der öffentlich verlinkten [AW24-Pressegalerie](https://visuals.gripgrab.com/aw24-press) bleiben lokal. Der [Medienzugang](https://visuals.gripgrab.com/gripgrab_media) bietet diese Bilder für Presse-/Mediennutzung an.
- Decathlon: 17 konkrete Produktseiten im Browser geöffnet, H1, Artikelnummer und Hauptgalerie-Foto abgelesen. Automatisierte HTML-Abfragen liefern HTTP 403; das ist im Rechercheprotokoll vermerkt. Die normalen Browserseiten und Bildserver waren frei erreichbar.
- Action: zehn konkrete deutsche Produktseiten mit Artikelnummer und eigener Hauptgalerie. Keine Fotos der vorgeschlagenen Nachbarprodukte übernommen. Artikel bleiben ausdrücklich Filialangebote; Einbettung macht sie nicht online bestellbar.
- Strauss: zwei exakte Produktdatensätze vom Typ `Product` mit Modell, schwarzer Farbe und aktuellem Produktfoto. Die Händlergalerien wurden zusätzlich gelesen.
- Lidl: drei exakt verlinkte Artikelnummern; die `og:image`-Originaldatei der jeweiligen Produktseite. Keine Motiv-/Markenbanner.
- VAUDE: vier Modellseiten und deren konkrete Hauptgalerie. Minaki III STX Artikel 48585 direkt vom Hersteller statt vom bei automatischer Bildprüfung blockierenden Händler.
- Shimano: SH-MW702, direkt aus der [Herstellerseite](https://bike.shimano.com/de-DE/products/apparel/pdp.P-SH-MW702.html), Hauptbild mit SH-MW702 im Dateinamen.
- Endura: RE8136BK aus der [Herstellerseite](https://www.endurasport.com/en-us/products/mens-mt500-waterproof-bib-trousers-black-re8136bk); gleiche Artikelserie wie die deutsche Händlerempfehlung. US-Preis oder Versanddaten wurden nicht übernommen.

Bildquelle und Verkaufslink können bei drei Artikeln unterschiedlich sein. Preise, Eigenschaften und deutsche Händlerempfehlungen wurden durch die Bildrecherche nicht ersetzt. Farb-/Größenvarianten im Shop können abweichen; gezeigt wird eine belegte Ausführung desselben Modells.

## Einbettung und Nutzung

68 Bilder werden als direkte HTTPS-Bilddateien vom öffentlich zugänglichen Originalserver eingebettet, ohne Kopie in GitHub, Bildproxy, Shop-Skripte, Werbeparameter oder Umgehung einer Einbettungssperre. Vier lokal angebotene Presse-Packshots haben den bisher dokumentierten redaktionellen Nutzungsrahmen. Sichtbare Credits und Quellen bleiben erhalten. Eine freie Bildlizenz oder Partnerschaft wird nicht behauptet.

Die technische Entscheidung zur direkten Einbettung orientiert sich an der Unterscheidung zwischen direkter Einbettung frei zugänglicher Inhalte und erneutem Hochladen von Kopien: [EuGH C-392/19](https://curia.europa.eu/jcms/upload/docs/application/pdf/2021-03/cp210036en.pdf), [EuGH C-161/17](https://curia.europa.eu/jcms/upload/docs/application/pdf/2018-08/cp180123en.pdf). Das ist eine begrenzte Umsetzung anhand der geprüften Quellen, keine verbindliche Rechtsprüfung aller denkbaren späteren Verwendungen. Bei Widerspruch oder künftiger technischer Sperre Bild deaktivieren und Rechte klären; keine Schutzmaßnahmen umgehen. Affiliate-Monetarisierung deaktiviert die Fotoanzeige weiterhin bis zur separaten Prüfung.

Die externen Bildanbieter erhalten IP-/Browserinformationen für die Auslieferung. `referrerPolicy="no-referrer"` vermeidet die Übermittlung der aufgerufenen Konfigurator-URL. Die Datenschutzhinweise erläutern die externen Bildquellen. Die Anwendung integriert keine Händler-Skripte und setzt keine Bild-Tracking-IDs.

## Prüfungen und Pflege

`node scripts/check-product-photos.mjs` prüft alle Originalbilder mit vier parallelen Anfragen. Der aktuelle Bericht `qa/exact-photo-check.json` enthält 72 erfolgreiche Antworten mit Bild-MIME, Dateigröße und Headern; keine nachgewiesene Cross-Origin-Resource-Policy-Sperre. Größte Datei etwa 131 kB. Browserprüfung erfolgt zusätzlich, da HTTP-Erreichbarkeit allein keine Darstellung garantiert.

Decathlon und Action liefern mobile Varianten, Shopify-Bilder sind auf 512 px begrenzt. Der Provider skaliert die Originaldatei; Motiv und Farbe werden nicht von der Anwendung verändert. Bilder laden lazy, mit festen Abmessungen und asynchroner Dekodierung. Ein Ladefehler führt zu „Foto nicht geladen“; keine Symbolzeichnung und kein ähnliches Produkt als Ersatz. Ein Fehler einer Datei bleibt beim Wechsel zu einem anderen Artikel nicht bestehen.

Die Recherche-Skripte schreiben nur Quellen/Metadaten nach `research/raw` (ignoriert). `scripts/build-exact-photo-map.mjs` erzeugt die feste Zuordnung, drei belegte Herstellerquellen stehen in `research/exact-photo-overrides.json`. Alle Zuordnungen werden im automatisierten Test geprüft; City 940 und City 900 besitzen einen zusätzlichen Variantentest.
