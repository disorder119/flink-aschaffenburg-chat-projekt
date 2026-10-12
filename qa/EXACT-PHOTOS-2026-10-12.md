# Originalfotos statt Symbolbilder

72 Empfehlungen, 72 eindeutig zugeordnete Originalfotos. Vier bestehende GripGrab-Presse-Packshots lokal; 68 Bilder als direkte Einbettung der öffentlich erreichbaren Originaldatei vom offiziellen Hersteller-/Händlerserver. Herkunft, Modellreferenz und Variante: `src/data/photos.json`; Nutzungsrahmen und Grenzen: `research/PHOTOS.md`.

## Prüfungen

- Alle 72 Bild-URLs: HTTP 200, Bild-MIME und mehr als 1.000 Bytes. Keine festgestellte Cross-Origin-Resource-Policy-Sperre. Größte Bilddatei 130.705 Bytes; Anbieterformate JPEG, WebP und JPEG/JPG. Bericht `exact-photo-check.json`.
- Alle 72 unterschiedlichen Artikel im Browser bei 390 × 844 über die sichtbare Navigation geöffnet. Jedes Bild nach `onLoad`, `complete` und `naturalWidth > 0` bestätigt. Bericht `exact-photo-browser.json`.
- Zwei erste Action-Anfragen (Kaytan-Shirt und Regenjacke) brauchten länger als die kurze Browser-Tool-Wartefrist. Beide luden anschließend korrekt; keine Anwendungskonsolenfehler. Externe Bildlatenz bleibt providerabhängig.
- City 940: graue Originalstulpen des Artikels 8797364, Bild p3100863. City 900: eigenes Galeriefoto p3222422 des Artikels 8735752. Vergleich zeigt beide echten unterschiedlichen Fotos. Keine rosa Farbmischung, keine gemeinsame Symbolzeichnung.
- City-900-Foto im Outfit sichtbar; eigene Testauswahl anschließend entfernt. Produktkarte, Direktwahl, Vergleich und Outfit nutzen dieselbe feste Fotozuordnung.
- Bei 390 × 844 kein Dokumentüberlauf. Preis- und Kaufaktionen bleiben über der Navigation erreichbar.
- 15 automatisierte Tests einschließlich vollständiger Bildzuordnung und zusätzlichem City-900/940-Variantentest. Produktionsbuild und TypeScript-Prüfung bestanden. Haupt-JavaScript etwa 117 kB gzip, CSS etwa 19 kB; keine neue Laufzeitabhängigkeit. Bestehende Vite-Warnung zum separaten optionalen 3D-Modul bleibt.
- Kein echter iPhone-/Safari-Hardwaretest. Die mobile Prüfung erfolgte im Codex-Browser.

## Fehlerverhalten und Datenschutz

Kein Ersatz durch Zeichnungen oder ähnliche Modelle. Fehlgeschlagene Dateien zeigen einen neutralen Hinweis; ein Bildfehler wirkt nicht auf das nächste Produkt. Aktive Produktbilder laden sofort, kompakte Listenbilder lazy. Feste Abmessungen, `object-fit: contain`, asynchrone Dekodierung, kein Seiten-Referrer. Datenschutzhinweise nennen externe Bildanbieter und die technisch übertragenen IP-/Browserinformationen. Keine Händler-Skripte, Werbepixel oder erfundenen Tracking-IDs.

## Veröffentlichung

Dieser Bericht wird vor dem Push erstellt. Aktueller GitHub-Actions-Lauf, Live-Buildpfade und mobile Live-Bilder werden nach Veröffentlichung separat geprüft; der aktuelle Live-Nachweis und Screenshot liegen danach im ignorierten Ordner `qa/screenshots/`.
