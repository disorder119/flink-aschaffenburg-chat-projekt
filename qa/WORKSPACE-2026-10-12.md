# Fester Konfigurator · 12.10.2026

Die lange Start- und Outfit-Seite wurde durch ein Rider-Studio innerhalb des sichtbaren Browserfensters ersetzt. Szene und Navigation bleiben in Position; Körperbereich, Budget, Produkt, Filter, Merkliste, Sets und Outfit wechseln in derselben Fläche. Es gibt jeweils eine Produktkarte, Pfeiltasten und eine kompakte Direktwahl. Kaufaktionen sind außerhalb des scrollbaren Informationsbereichs angeordnet. Outfit-Anzahl und beobachtete Summe bleiben in der Navigation sichtbar.

## Bestandene Prüfungen

- 14 automatisierte Tests: Katalog, Bewertungen, Wetter-/Preis-/Fahrzeugfilter, Vergleichsgrenzen, Kit-Summen, Gerätepolitik, Foto-Dateien sowie neue Routen- und Auswahlregeln. Ungültige Routen einschließlich geerbter Objektschlüssel führen nicht in eine Konfiguratoransicht.
- TypeScript-Prüfung einschließlich `--noUnusedLocals` bestanden. Produktionsbuild erfolgreich. Haupt-JavaScript etwa 110 kB gzip, CSS etwa 19 kB gzip. Die bestehende Vite-Warnung betrifft das separate, optionale 3D-Modul (etwa 135 kB gzip / 533 kB unkomprimiert); keine neue Laufzeitabhängigkeit für den Umbau.
- Im Codex-Browser: 375×667, 390×844 und 430×932. Dokumentbreite und -höhe entsprechen dem jeweiligen Fenster; `scrollY` bleibt 0. Kauf-/Outfit-Aktionen liegen oberhalb der unteren Navigation. Bei 390×844 und 430×932 passt die Standard-Produktinformation vollständig in den Bereich; auf kurzen Displays dürfen umfangreiche Informationen innerhalb ihres Bereichs scrollen.
- Alle fünf Körperbereiche wechseln das passende Produkt. Bei 375×667 blieb die Fahrerfläche bei allen fünf Wechseln exakt an derselben Position (oberer Rand etwa 56,8 px, Höhe 125 px). Kein automatisches Scrollen zu einem Katalogabschnitt.
- Desktop 1280×800 und Tablet 800×700 ohne Dokumentüberlauf. Querformat 760×430 ohne Dokumentüberlauf; Preis liegt innerhalb der sichtbaren Produktinformation, Aktionen oberhalb der Navigation.
- Bis 760 px startet die leichte SVG-Ansicht; schmale Browseransicht nach Reload: kein WebGL-Canvas. Optionale 3D-Ansicht öffnet auf geeignetem Gerät einen Canvas; Ausschalten der Effekte entfernt ihn. Rider-Style-Wechsel zu Wolt und zurück zu Flink geprüft.
- Foto-Schnellzugriff zeigt fünf reale Modelle. Direktwahl von Arctic 2 Road und TrailBlazer funktioniert. Vergleich zeigt beide echten Fotos. Bereits veröffentlichte Fotoquellen und Produktdaten wurden nicht geändert.
- Produktauswahl bleibt beim Favorisieren erhalten. EXPLR Pants bleibt nach Favoritenklick ausgewählt; Merkliste und Outfit über Reload erhalten. Artikelsumme für diese Auswahl: 150,00 €.
- Maximalpreis 30 € mit Foto-Filter ergibt MT900, 27,99 €. Texteingabe vergrößert die Filterfläche; „Fertig“ stellt die Studioansicht wieder her. Die Höhe reagiert auf `visualViewport`-Änderungen. Das ist eine Prüfung im Desktop-Browser, kein Test einer echten iPhone-Tastatur.
- Lenkerstulpen-Gruppe mit Motorroller ergibt null Treffer. Grenzenhinweise bleiben sichtbar.
- Sets zeigen 127,84 €, 387,45 € und ab 808,00 €. Alle drei Set-Auswahlen bzw. Summen geprüft. Best Value lädt acht Artikel und 387,45 €. Set-Auswahl setzt alte Such-/Preisfilter zurück. Einkaufsliste-Kopieren meldet Erfolg.
- Browser-Zurück wechselt vom Outfit zur Set-Auswahl. Datenschutz und übrige Informationslinks bleiben zugänglich; außerhalb des Studios ist normales Lesen/Scrollen möglich. Testauswahl über die Datenschutzfunktion gelöscht.
- Keine Anwendungskonsolenfehler bei den beschriebenen Browserprüfungen.

## Umfang und Grenzen

Lange Filter, Einkaufsliste, Produktdetails und Vergleich dürfen innerhalb ihres Inhaltsbereichs scrollen. Der normale Auswahlweg benötigt keinen Seitensprung und keine lange vertikale Produktliste. Safari auf einem echten iPhone und ein physisches schwaches Telefon waren nicht verfügbar. Die bestehende Gerätepolitik, lokale Bilder und dynamische 3D-Einbindung bleiben erhalten.

Betreiberangaben und zusätzliche Bildfreigaben bleiben die bereits dokumentierten offenen Punkte. Keine neuen Produkt-, Preis-, Rechte- oder Lagerbehauptungen.

## Veröffentlichung

Der GitHub-Actions-Workflow baut und veröffentlicht diese Änderung auf `main`. Der aktuelle öffentliche Build wird nach dem Push separat über die echte HTTPS-URL und im Browser geprüft; dieser vor dem Push erstellte Bericht behauptet allein noch keinen Live-Status. Screenshots und der aktuelle HTTP-Nachweis werden lokal unter dem git-ignorierten Verzeichnis `qa/screenshots/` gespeichert.
