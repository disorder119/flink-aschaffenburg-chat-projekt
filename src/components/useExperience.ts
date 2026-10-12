import { useEffect, useState } from "react";
import {
  renderingPolicy,
  riderStyles,
  type RiderStyle,
} from "../lib/experience";
type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};
function storedStyle(): RiderStyle {
  try {
    const value = localStorage.getItem("rider-style-v1");
    return riderStyles.some((t) => t.id === value)
      ? (value as RiderStyle)
      : "flink";
  } catch {
    return "flink";
  }
}
export function useExperience() {
  const [style, setStyle] = useState<RiderStyle>(storedStyle);
  const [motion, setMotion] = useState(() => {
    try {
      return localStorage.getItem("rider-motion-v1") !== "off";
    } catch {
      return true;
    }
  });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [requested3d, setRequested3d] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("rider-style-v1", style);
      localStorage.setItem("rider-motion-v1", motion ? "on" : "off");
    } catch {}
  }, [style, motion]);
  const nav = navigator as ExtendedNavigator;
  const policy = renderingPolicy({
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    memory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    coarse: matchMedia("(pointer: coarse)").matches,
    reducedMotion: reduced,
  });
  const enable3d =
    motion && !reduced && !policy.constrained && (policy.auto3d || requested3d);
  return {
    style,
    setStyle,
    motion: motion && !reduced,
    setMotion,
    enable3d,
    request3d: () => setRequested3d(true),
    constrained: policy.constrained,
    reduced,
  };
}
