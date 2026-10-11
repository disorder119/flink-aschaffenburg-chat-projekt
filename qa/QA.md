# Qualitätssicherung

Stand: 11.10.2026. Ausführung in Node.js 24 und im verbundenen Microsoft-Edge-Browser. Ein tatsächliches iPhone / Safari war nicht verfügbar; **keinen bestandenen Realgeräte-Safari-Test behaupten**.

## Automatisierte Prüfungen

`npm test`: **8/8 bestanden**.

- 67 eindeutige Modelle / direkte HTTPS-Quellen; mindestens drei Produkte je Region und Budgetstufe; vollständige Metadaten, drei Vorteile und mindestens zwei Grenzen.
- Gewichtungen summieren sich auf 100; Scores in Fünferschritten; unzureichende Daten bleiben unbewertet.
- Starkregen- und zusammengesetzte Frost-/Regenfilter, ohne DWR als wasserdicht zu behandeln.
- Genauer Artikelpreisfilter, korrekter Packpreis, unbekannte Preise und Preisreihenfolge.
- Fahrzeuge, Suchfelder und Merkliste.
- Vergleichslimit und gleiche Produktgruppe **und** Körperregion.
- Echte Setreferenzen, Cent-genaue Summen, Ab- und Teilpreisszenarien.

`npm run build`: **TypeScript und Vite bestanden**. JavaScript ca. 104 kB gzip, CSS ca. 10,4 kB gzip, lokal geladene Manrope-Schrift ca. 24,8 kB. Keine extern geladenen Bilder oder Schriftserver.

## Browserinteraktionen

- Fünf Touch-Hotspots an der Figur aktivieren jeweils den richtigen Bereich, heben ihn hervor und öffnen den Produktbereich.
- Tastaturbedienung der SVG-Gruppe mit Enter geprüft. Der geometrische Mittelpunkt einer Gruppe mit getrennten Handschuh-/Schuhflächen ist kein sinnvoller Click-Target-Test; die tatsächlichen Teilflächen und separaten Touch-Buttons sind die Bedienziele.
- Budget + maximal 10 €: drei passende günstige Handartikel.
- Starkregen + Frost: zwei isolierte Membranhandschuhe; milde EDR-waterproof-Handschuhe ausgeschlossen.
- Merken / Entfernen, lokale Speicherung nach Reload, Produktdetails mit Quellen und Stufentabelle.
- Produktvergleich mit Preisen, Nässe, Wärme, Vorteilen, Grenzen und Shoplinks.
- Budget-Set 127,84 €. Austausch der Kopfkomponente von 9,99 € zu 40 € ergibt 157,85 €.
- Premium-Set nach korrigiertem VAUDE-Schuhpreis **ab 808,00 €**; Best Value 387,45 €.
- Kopieren der Einkaufsliste in die Browserzwischenablage einschließlich echter URLs bestätigt.
- Mobiles Menü, Methoden-Navigation aus dem Dialog und direkter Aufruf `#/outfit` bestätigt.
- Keine Warnungen oder Laufzeitfehler in der geprüften Browserkonsole.

Beobachtete Fehler wurden behoben: eine transparente SVG-Kartenfläche blockierte Herz-Schaltflächen; jetzt ignoriert die Symbolabbildung Pointer-Ereignisse. Eine fehlende JSX-Fragment-Schließung und ein ungültiger Font-Import wurden im Build gefunden und korrigiert. Smartphone-Karten wurden von schlecht lesbaren zwei Spalten auf große Einzelkarten umgestellt. Der mobil vollständig sichtbare Fahrer folgt direkt unter der Überschrift. Scrollverhalten verwendet Safari-kompatibles `auto`, Dialoge haben einen `vh`-Fallback.

## Responsive Sichtprüfung

Tatsächliche per Browser-Viewport gesetzte Breiten **375, 390, 430 px**, jeweils 844 px Höhe, und Desktop **1440 × 960 px**. Gemessene `innerWidth` stimmt mit den eingestellten Breiten überein. Kein horizontaler Seitenüberlauf; Figur vollständig innerhalb der Seitenbreite und im ersten Viewport sichtbar. Produktvergleich und Gewichtungstabellen scrollen absichtlich innerhalb ihres eigenen Containers.

Screenshots liegen lokal unter `qa/screenshots/` (nicht in Git): mobile Startansichten bei drei Breiten, Outfit und Desktop. iOS-Safari-Kompatibilität wurde durch Standards, große Touch-Ziele, SVG, lokale Assets, `dialog`, reduzierte Bewegung und Viewport-Fallback berücksichtigt. Das ersetzt keinen Test auf einem echten iPhone.

## Produktlinks

Automatischer Bericht: [link-check.json](link-check.json). Ergänzender Browserbericht: [manual-links.json](manual-links.json).

- 39 Produktseiten im HTTP-Check erfolgreich abgerufen.
- 28 Seiten sperren automatisierte Anfragen. **Alle 28** wurden zusätzlich im normalen Browser als konkrete Produktseiten geöffnet: 10 Action, 15 Decathlon, 3 Bike-Discount.
- Ein altes Regatta-Angebot lieferte 404 und wurde entfernt. Die alte Endura-MT500-Jackenseite zeigte im Browser „nicht gefunden“ und wurde durch die im selben Shop nachgewiesene MT500-Waterproof-Hose zu 144,99 € ersetzt.
- Shimano MW702 wurde von veralteten 119,99 € auf beobachtete 169,99 € korrigiert; VAUDE Minaki III STX von 139,99 € auf 168,00 €. Aktuelle Decathlon-Weiterleitung auf EDR Light und Komfortbereich 7–12 °C übernommen.
- HTTP-Erfolg und sichtbare Produktseite sind keine Zusage für Lagerbestand, konkrete Größe oder zukünftige Preise.

## Veröffentlichungsprüfung

Repository: https://github.com/disorder119/flink-aschaffenburg-chat-projekt

Pages-Ziel: https://disorder119.github.io/flink-aschaffenburg-chat-projekt/

Der endgültige Workflow-Status und der unabhängige Abruf der Produktionsassets werden nach Deployment in `deployment.json` festgehalten. Ein konfiguriertes Pages-Ziel allein zählt ausdrücklich nicht als erfolgreicher Live-Nachweis.

## Tatsächlich offene Angaben

Betreibername, ladungsfähige Anschrift und Kontakt-E-Mail fehlen. Die vorbereiteten Impressums- und Datenschutzseiten nennen dies sichtbar. Rechtliche Einordnung für die konkrete Betreiberkonstellation und spätere Affiliate-Programme vervollständigen. Keine Zugangsdaten oder privaten Betreiberidentitäten veröffentlicht. Keine Affiliate-Konten erfunden.
