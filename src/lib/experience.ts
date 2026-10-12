export type RiderStyle = "flink" | "wolt" | "uber" | "lieferando" | "community";
export const riderStyles: {
  id: RiderStyle;
  label: string;
  color: string;
  light: string;
  dark: string;
  bag: string;
}[] = [
  {
    id: "flink",
    label: "Flink",
    color: "#e50078",
    light: "#ff85bb",
    dark: "#a10052",
    bag: "#ff329c",
  },
  {
    id: "wolt",
    label: "Wolt",
    color: "#0094c6",
    light: "#7edcf2",
    dark: "#005b7b",
    bag: "#24b9dd",
  },
  {
    id: "uber",
    label: "Uber Eats",
    color: "#087a46",
    light: "#7be9a1",
    dark: "#064c30",
    bag: "#0dac62",
  },
  {
    id: "lieferando",
    label: "Lieferando",
    color: "#d7470b",
    light: "#ffb16e",
    dark: "#963207",
    bag: "#ff731f",
  },
  {
    id: "community",
    label: "Alle Rider",
    color: "#7548cf",
    light: "#cab2ff",
    dark: "#44277f",
    bag: "#a47afa",
  },
];
export interface DeviceHints {
  saveData?: boolean;
  effectiveType?: string;
  memory?: number;
  cores?: number;
  coarse?: boolean;
  reducedMotion?: boolean;
}
export function renderingPolicy(hints: DeviceHints) {
  const constrained =
    !!hints.saveData ||
    ["slow-2g", "2g"].includes(hints.effectiveType ?? "") ||
    (hints.memory !== undefined && hints.memory <= 4) ||
    (hints.cores !== undefined && hints.cores <= 4);
  return {
    constrained,
    auto3d: !constrained && !hints.coarse && !hints.reducedMotion,
    animate: !hints.reducedMotion,
    pixelRatio: 1,
    maxFps: 24,
  };
}
