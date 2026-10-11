import type { Region } from "../types";
export type Outfit = {
  primary: Partial<Record<Region, string>>;
  extras: string[];
};
export const kits: {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  outfit: Outfit;
}[] = [
  {
    id: "budget",
    name: "Budget Rider Kit",
    subtitle: "Ein sinnvoller Einstieg",
    description:
      "Für kühle, überwiegend trockene Tage und kurze Schauer. Handschuhe sind nicht wasserdicht; die Raincut ist für begrenzten leichten Regen belegt. Helm, Licht und Sichtbarkeit ergänzen.",
    outfit: {
      primary: {
        kopf: "dec-cap",
        oberkoerper: "dec-raincut",
        haende: "dec-winter-gloves",
        beine: "dec-city-pants",
        fuesse: "dec-nh100",
      },
      extras: ["action-shirt", "action-pants", "action-socks"],
    },
  },
  {
    id: "value",
    name: "Best Value Rider Kit",
    subtitle: "Für den Alltag auf dem Rad",
    description:
      "Regenhüllen mit zusätzlicher Wärmeschicht und isolierten Membranhandschuhen. Wanderstiefel: Pedalgrip ausprobieren. Keine Temperatur- oder Schichtdauer-Garantie.",
    outfit: {
      primary: {
        kopf: "dec-balaclava",
        oberkoerper: "dec-city-jacket",
        haende: "gg-ride-2-waterproof-winter-gloves",
        beine: "dec-city900-pants",
        fuesse: "dec-nh100",
      },
      extras: [
        "gg-ride-winter-long-sleeve-base-layer",
        "strauss-basis",
        "gg-merino-winter-sock",
      ],
    },
  },
  {
    id: "premium",
    name: "Premium Winter Rider Kit",
    subtitle: "Für häufige Winterfahrten",
    description:
      "Sichtbare Regenhülle, Merino-Basis, isolierte Regenhose und PrimaLoft-Handschuhe. VAUDE-MTB-Schuhe: Pedalsystem und Größe prüfen. Keine geprüfte Eignung für Glatteis oder acht Stunden Frost.",
    outfit: {
      primary: {
        kopf: "gg-aviator-windproof-deep-winter-skull-cap",
        oberkoerper: "vaude-luminum",
        haende: "gg-polaris-2-waterproof-winter-gloves",
        beine: "vaude-escape-pants",
        fuesse: "vaude-minaki",
      },
      extras: [
        "gg-merino-blend-thermal-long-sleeve-base-layer",
        "gg-merino-lined-waterproof-winter-socks",
        "gg-aquaseal-waterproof-cycling-gaiter",
      ],
    },
  },
];
