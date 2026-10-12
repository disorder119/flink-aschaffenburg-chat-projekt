import type { Product } from "../types.ts";
const base = {
  tier: "budget",
  checked: "2026-10-12",
  priceKind: "observed",
  sourceMethod: "page",
  water: "none",
  waterNote: "Kein Regenschutz. Trocken und nach Packungsanleitung verwenden.",
  warmth: 3,
  wind: false,
  material: "Wärmepad; genauer Aufbau laut Packung.",
  assessment: null,
  supplement: true,
  uncertainty:
    "Hersteller-/Händlerangaben, kein eigener Praxistest. Wärmezeit und Wirkung variieren mit Anwendung und Umgebung. Für diese Zusatzartikel vergeben wir keine unzureichend belegte Gesamtpunktzahl.",
  priceNote:
    "Beobachteter Preis für die ganze angegebene Packung, nicht pro Einzelpad; inkl. MwSt., zzgl. Versand.",
  caution:
    "Nur nach Packungsanleitung verwenden. Bei zu großer Hitze sofort entfernen. Wärmepads ersetzen keine passende Winterkleidung.",
} satisfies Partial<Product>;
const extra = (
  p: Partial<Product> &
    Pick<
      Product,
      | "id"
      | "name"
      | "brand"
      | "shop"
      | "region"
      | "group"
      | "price"
      | "url"
      | "pros"
      | "cons"
      | "use"
      | "warmthNote"
    >,
): Product => ({ ...base, retailOnly: p.shop === "Action", ...p }) as Product;
export const extras: Product[] = [
  extra({
    id: "action-click-warmer",
    name: "Klick-Handwärmer · 1 Stück",
    brand: "Action (Eigenangebot)",
    shop: "Action",
    region: "haende",
    group: "warmer",
    price: 0.89,
    url: "https://www.action.com/de-de/p/2542277/handwarmer/",
    warmthNote:
      "Etwa 30 Minuten Wärme laut Action; keine Lösung für eine ganze Schicht.",
    pros: [
      "Wiederverwendbar",
      "Aktivierung per Klick",
      "Klein für Jackentaschen",
    ],
    cons: [
      "Nur etwa 30 Minuten Wärme",
      "Regeneration nach Packungsanleitung; nur Filialkauf",
    ],
    use: "Kurze Aufwärmpause für die Hände, außerhalb der Fahrt.",
  }),
  extra({
    id: "action-thermofect-warmer",
    name: "Thermofect Handwärmer · 4 Stück",
    brand: "Thermofect",
    shop: "Action",
    region: "haende",
    group: "warmer",
    price: 0.99,
    url: "https://www.action.com/de-de/p/3003086/thermofect-handwarmer/",
    warmthNote:
      "Bis zu 10 Stunden laut Händler; tatsächliche Zeit ist anwendungsabhängig.",
    pros: [
      "4 Pads pro Packung",
      "Für Handschuhe oder Taschen",
      "Bis zu 10 Stunden laut Händler",
    ],
    cons: [
      "Verbrauchsartikel; Anleitung beachten",
      "Nur in Action-Filialen erhältlich",
    ],
    use: "Günstige Zusatzwärme für Hände und Aufwärmpausen.",
  }),
  extra({
    id: "dec-hand-warmers",
    name: "WEDZE Handwärmer · 10 Stück",
    brand: "WEDZE",
    shop: "Decathlon",
    region: "haende",
    group: "warmer",
    price: 6.99,
    url: "https://www.decathlon.de/p/handwarmer-10-stk/161196/c344m8827988",
    warmthNote:
      "5–6 Stunden laut Händler, mit Aufwärmzeit von etwa 10–15 Minuten.",
    pros: [
      "10 Pads pro Packung",
      "Luftaktiviert",
      "Bis zu 6 Stunden laut Händler",
    ],
    cons: [
      "Einmalgebrauch",
      "Nicht direkt auf Haut, nicht komprimieren; nicht für intensive Sportbelastung laut Händler",
    ],
    caution:
      "Nur für die Hände und gemäß Anleitung: kein direkter Hautkontakt, nicht komprimieren, nicht beim Schlafen. Händler rät von intensiver Sportbelastung und Nutzung beim Schwitzen ab.",
    use: "Für Aufwärmpausen oder den zugelassenen Einsatz in Taschen; beim Radfahren die Händlergrenzen beachten.",
  }),
  extra({
    id: "dec-foot-warmers",
    name: "WEDZE Fußwärmer · 10 Stück",
    brand: "WEDZE",
    shop: "Decathlon",
    region: "fuesse",
    group: "warmer",
    price: 6.99,
    url: "https://www.decathlon.de/p/fusswaermer-10/161192/c344m8983337",
    warmthNote:
      "Bis zu 5 Stunden laut Händler; nicht für eine ganze 8-Stunden-Schicht garantiert.",
    pros: [
      "10 Pads pro Packung",
      "Selbstklebend an Socken",
      "Bis zu 5 Stunden laut Händler",
    ],
    cons: ["Einmalgebrauch", "Passenden Platz im Schuh und Anleitung prüfen"],
    caution:
      "Laut Händler unter die Socken im Zehenbereich kleben; niemals direkt auf die Haut. Nur mit ausreichend Platz im Schuh und nach Anleitung verwenden.",
    use: "Zusatzwärme im Zehenbereich; warme und passende Schuhe bleiben erforderlich.",
  }),
  extra({
    id: "dec-body-warmers",
    name: "WEDZE Körperwärmer · 10 Stück",
    brand: "WEDZE",
    shop: "Decathlon",
    region: "oberkoerper",
    group: "warmer",
    price: 4.99,
    url: "https://www.decathlon.de/p/korperwarmer-10/161194/c344m8827990",
    warmthNote: "Etwa 5 Stunden laut Händler; Wärmezeit kann kürzer ausfallen.",
    pros: [
      "10 Pads pro Packung",
      "Auf Kleidung klebend",
      "Bis zu 5 Stunden laut Händler",
    ],
    cons: [
      "Einmalgebrauch",
      "Kein direkter Hautkontakt; nicht unter Druck verwenden",
    ],
    caution:
      "Auf Kleidung, niemals direkt auf Haut anbringen. Packungsanleitung und Einschränkungen beachten.",
    use: "Punktuelle Zusatzwärme bei kaltem Wetter, auf geeigneter Kleidung nach Anleitung.",
  }),
  extra({
    id: "heat-hand-warmer",
    name: "HEAT Handwärmer · 1 Paar",
    brand: "THE HEAT COMPANY",
    shop: "THE HEAT COMPANY",
    region: "haende",
    group: "warmer",
    price: 1.99,
    url: "https://www.theheatcompany.com/de-de/waermepads/handwaermer",
    warmthNote:
      "12 Stunden laut Hersteller; Luftkontakt und Umgebung beeinflussen die Wärme.",
    material:
      "Aktivkohle, Eisenpulver, Salz, Wasser und Vermikulit laut Hersteller.",
    pros: ["Luftaktiviert", "1 Paar pro Packung", "12 Stunden laut Hersteller"],
    cons: [
      "Einmalgebrauch",
      "1,99 € für ein Paar; günstigere Staffelpreise gelten erst bei größeren Mengen",
    ],
    priceNote:
      "1,99 € pro Paar bei 1–9 Packungen. Der niedrigere beworbene Staffelpreis gilt erst bei Großmengen. Inkl. MwSt., zzgl. Versand; Lieferadress-MwSt. an der Kasse prüfen.",
    use: "Luftaktivierte Zusatzwärme für zugelassene Handschuhfächer oder Taschen.",
  }),
  extra({
    id: "heat-toe-warmer",
    name: "HEAT Fuß-/Zehenwärmer · 1 Paar",
    brand: "THE HEAT COMPANY",
    shop: "THE HEAT COMPANY",
    region: "fuesse",
    group: "warmer",
    price: 1.99,
    url: "https://www.theheatcompany.com/de-de/waermepads/fusswaermer",
    warmthNote: "8 Stunden laut Hersteller; keine garantierte Schichtdauer.",
    material: "Luftaktiviertes Wärmepad laut Hersteller.",
    pros: [
      "Für den Zehenbereich",
      "1 Paar pro Packung",
      "8 Stunden laut Hersteller",
    ],
    cons: [
      "Einmalgebrauch",
      "Staffelpreise ab größeren Mengen; geeigneten Schuhplatz prüfen",
    ],
    priceNote:
      "1,99 € pro Paar bei 1–9 Packungen. Großmengenrabatte nicht als Einzelpreis übernommen. Inkl. MwSt., zzgl. Versand; Lieferadress-MwSt. an der Kasse prüfen.",
    use: "Zusatzwärme für Zehen in geeigneten Schuhen nach Packungsanleitung.",
  }),
  extra({
    id: "heat-sole-warmer",
    name: "HEAT Sohlenwärmer · 1 Paar",
    brand: "THE HEAT COMPANY",
    shop: "THE HEAT COMPANY",
    region: "fuesse",
    group: "warmer",
    price: 2.95,
    url: "https://www.theheatcompany.com/de-de/waermepads/sohlenwaermer",
    warmthNote: "8 Stunden laut Hersteller; keine garantierte Schichtdauer.",
    material:
      "Aktivkohle, Eisenpulver, Salz, Wasser und Vermikulit laut Hersteller.",
    pros: [
      "Dünne Einlegesohle",
      "Größen S bis XL",
      "1 Paar; 8 Stunden laut Hersteller",
    ],
    cons: ["Einmalgebrauch", "Größe und zusätzlichen Platz im Schuh prüfen"],
    priceNote:
      "2,95 € für ein Paar bei Einzelkauf. Der günstigere Preis ab 10 bzw. 30 Paar ist kein Einzelkaufpreis. Inkl. MwSt., zzgl. Versand; Lieferadress-MwSt. an der Kasse prüfen.",
    use: "Zusätzliche Wärmesohle, mit Textilseite nach oben gemäß Herstelleranleitung.",
  }),
  extra({
    id: "dec-helmet-cover",
    name: "BTWIN Helmüberzug 960 · neongelb",
    brand: "BTWIN",
    shop: "Decathlon",
    region: "kopf",
    group: "accessory",
    price: 12.99,
    url: "https://www.decathlon.de/p/helmuberzug-960-wasserdicht-sichtbarkeit-tag-und-nacht-neongelb/346776/c458m8801806",
    water: "waterproof",
    waterNote:
      "15.000 mm vor, 5.000 mm nach Wäsche laut Händler. Passform und sicheren Sitz am Helm prüfen.",
    warmth: 0,
    warmthNote: "Keine Isolation; hält Wind und Regen am Helm ab.",
    wind: true,
    material: "Polyester, wasserdichter Aufbau laut Händler.",
    pros: [
      "Wasserdichter Helmüberzug",
      "Neonfarbe und Reflexstreifen",
      "46 g laut Händler",
    ],
    cons: [
      "Ersetzt keinen Fahrradhelm",
      "Kompatibilität und Helmöffnungen prüfen",
    ],
    caution:
      "Nur über einem passenden Fahrradhelm verwenden; Sitz und Sichtfeld dürfen nicht beeinträchtigt werden.",
    use: "Zusätzlicher Regen- und Sichtbarkeitsschutz auf einem passenden Fahrradhelm.",
  }),
  extra({
    id: "dec-backpack-reflector",
    name: "BTWIN Reflektorband für Rucksack · neongelb",
    brand: "BTWIN",
    shop: "Decathlon",
    region: "oberkoerper",
    group: "visibility",
    price: 6.99,
    url: "https://www.decathlon.de/p/reflektorband-fur-rucksack-tag-und-nacht-sichtbar-neongelb/309396/c132m8551545",
    warmth: 0,
    warmthNote: "Keine Wärmewirkung.",
    material:
      "Signalfarbenes Band mit Reflexstreifen und Klettbefestigung laut Händler.",
    pros: ["Neonfarbe", "Reflexstreifen", "Klettbefestigung am Rucksack"],
    cons: [
      "Ersetzt keine Fahrradbeleuchtung",
      "Nicht verdecken; sicher befestigen",
    ],
    caution:
      "Beleuchtung und vorgeschriebene Reflektoren am Fahrrad zusätzlich verwenden. Das Band nicht verdecken und sicher befestigen.",
    use: "Ergänzende Sichtbarkeit am Liefer- oder Fahrradrucksack.",
  }),
];
