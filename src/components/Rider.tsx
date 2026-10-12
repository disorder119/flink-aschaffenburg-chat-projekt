import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Box, Hand } from "lucide-react";
import type { Region } from "../types";
import type { RiderStyle } from "../lib/experience";
import type { SceneController } from "./riderScene";
import { RiderVector } from "./RiderVector";
export function Rider({
  selected,
  onSelect,
  style,
  enable3d,
  motion,
  constrained,
  onRequest3d,
}: {
  selected: Region | "all";
  onSelect: (r: Region) => void;
  style: RiderStyle;
  enable3d: boolean;
  motion: boolean;
  constrained: boolean;
  onRequest3d: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null),
    host = useRef<HTMLDivElement>(null),
    controller = useRef<SceneController | null>(null),
    select = useRef(onSelect);
  select.current = onSelect;
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [visible, setVisible] = useState(true),
    [foreground, setForeground] = useState(!document.hidden);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(stage.current);
    const change = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  useEffect(() => {
    if (!enable3d || failed || !host.current) return;
    let cancelled = false;
    import("./riderScene")
      .then(({ createRiderScene }) => {
        if (cancelled || !host.current) return;
        try {
          const scene = createRiderScene(
            host.current,
            style,
            (r) => select.current(r),
            () => setFailed(true),
          );
          if (cancelled) {
            scene.dispose();
            return;
          }
          controller.current = scene;
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
      setReady(false);
    };
  }, [enable3d, style, failed]);
  useEffect(() => {
    controller.current?.setActive(ready && visible && foreground && motion);
  }, [ready, visible, foreground, motion]);
  useEffect(() => {
    controller.current?.setSelected(selected);
  }, [ready, selected]);
  const active = (r: Region) => (selected === r ? "selected" : "");
  return (
    <div
      ref={stage}
      className={`rider-stage ${ready ? "has-webgl" : ""}`}
      data-visible={visible && foreground}
    >
      <div className="scene-orbit orbit-one" />
      <div className="scene-orbit orbit-two" />
      <div className="scene-dots" />
      <div className="stage-caption">
        <span /> DEIN WINTER-SETUP
      </div>
      <div className="scene-status">{ready ? "LIVE 3D" : "RIDER STUDIO"}</div>
      <div
        className={`fallback-scene ${ready ? "scene-hidden" : ""}`}
        aria-hidden={ready}
      >
        <RiderVector selected={selected} onSelect={onSelect} />
      </div>
      <div ref={host} className="webgl-scene" />
      <button
        className={`hotspot hotspot-head ${active("kopf")}`}
        onClick={() => onSelect("kopf")}
        aria-pressed={selected === "kopf"}
      >
        <span>01</span>Kopf<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-body ${active("oberkoerper")}`}
        onClick={() => onSelect("oberkoerper")}
        aria-pressed={selected === "oberkoerper"}
      >
        <span>02</span>Oberkörper<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-hands ${active("haende")}`}
        onClick={() => onSelect("haende")}
        aria-pressed={selected === "haende"}
      >
        <span>03</span>Hände<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-legs ${active("beine")}`}
        onClick={() => onSelect("beine")}
        aria-pressed={selected === "beine"}
      >
        <span>04</span>Beine<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-feet ${active("fuesse")}`}
        onClick={() => onSelect("fuesse")}
        aria-pressed={selected === "fuesse"}
      >
        <span>05</span>Füße<small>↗</small>
      </button>
      <div className="scene-controls">
        {ready ? (
          <>
            <button
              aria-label="Fahrer nach links drehen"
              onClick={() => controller.current?.turn(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              <Hand size={13} />
              Wischen & drehen
            </span>
            <button
              aria-label="Fahrer nach rechts drehen"
              onClick={() => controller.current?.turn(1)}
            >
              <ChevronRight size={17} />
            </button>
          </>
        ) : !constrained && motion && !failed ? (
          <button className="enable-3d" onClick={onRequest3d}>
            <Box size={16} />
            3D-Ansicht öffnen
          </button>
        ) : (
          <span>
            <Hand size={14} />
            Körperbereich antippen
          </span>
        )}
      </div>
    </div>
  );
}
