import { tr } from "../i18n/core";
import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, WifiOff, RefreshCw } from "lucide-react";
import { Modal } from "./Modal";
import {
  canInstall,
  installApp,
  isStandalone,
  updateAvailable,
  offlineReady,
} from "../lib/pwa";
export function InstallPanel() {
  const [open, setOpen] = useState(false);
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((x) => x + 1);
    window.addEventListener("rider-install-state", update);
    return () => window.removeEventListener("rider-install-state", update);
  }, []);
  return (
    <>
      <button
        className="install-button icon-button"
        aria-label={tr("App zum Home-Bildschirm hinzufügen")}
        title={tr("Als App nutzen")}
        onClick={() => setOpen(true)}
      >
        <Download size={18} />
      </button>
      {open && (
        <Modal
          title={tr("Dein Rider-Studio als App")}
          onClose={() => setOpen(false)}
        >
          <div className="install-guide">
            <p>
              {tr(
                "Eigenes Symbol auf deinem Home-Bildschirm. \u00D6ffnet ohne Browserleisten. Keine Registrierung und kein App-Store n\u00F6tig.",
              )}
            </p>
            {isStandalone() ? (
              <p className="notice green">
                {tr("Du nutzt die App bereits im eigenst\u00E4ndigen Modus.")}
              </p>
            ) : canInstall() ? (
              <button className="button" onClick={() => void installApp()}>
                {tr("App installieren")}
              </button>
            ) : null}
            <h3>{tr("iPhone und iPad")}</h3>
            <ol>
              <li>{tr("Die Website in Safari \u00F6ffnen.")}</li>
              <li>
                <Share size={16} />
                {tr(
                  " Im Teilen-Men\u00FC \u201EZum Home-Bildschirm\u201C w\u00E4hlen.",
                )}
              </li>
              <li>
                <PlusSquare size={16} />
                {tr(
                  " Falls angezeigt, \u201EAls Web-App \u00F6ffnen\u201C aktivieren und \u201EHinzuf\u00FCgen\u201C antippen.",
                )}
              </li>
              <li>{tr("Danach \u00FCber das neue rosa Symbol starten.")}</li>
            </ol>
            <h3>{tr("Android")}</h3>
            <p>
              {tr(
                "Im Browser-Men\u00FC \u201EApp installieren\u201C oder \u201EZum Startbildschirm hinzuf\u00FCgen\u201C w\u00E4hlen.",
              )}
            </p>
            <h3>{tr("Unterwegs ohne Netz")}</h3>
            <p>
              {tr(
                "Nach dem ersten erfolgreichen Laden bleiben App und Artikeldaten offline erreichbar. Externe Produktfotos und H\u00E4ndlerseiten brauchen eine Internetverbindung. Preise sind gespeicherte Beobachtungen.",
              )}
            </p>
            <p className="notice" role="status">
              {tr(
                offlineReady()
                  ? "Für die Offline-Nutzung bereit."
                  : "Offline-Daten werden beim ersten Online-Aufruf vorbereitet.",
              )}
            </p>
            <p>
              {tr(
                "Eine fr\u00FCher hinzugef\u00FCgte Verkn\u00FCpfung gegebenenfalls entfernen und die aktualisierte Website erneut hinzuf\u00FCgen. Die Home-Bildschirm-App kann einen getrennten lokalen Speicher verwenden; bestehende Browser-Favoriten werden dann nicht automatisch \u00FCbernommen.",
              )}
            </p>
            {updateAvailable() && (
              <button
                className="button"
                onClick={() =>
                  window.dispatchEvent(new Event("rider-activate-update"))
                }
              >
                <RefreshCw size={17} />
                {tr(" Neue App-Version laden")}
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const change = () => setOffline(!navigator.onLine);
    window.addEventListener("online", change);
    window.addEventListener("offline", change);
    return () => {
      window.removeEventListener("online", change);
      window.removeEventListener("offline", change);
    };
  }, []);
  return offline ? (
    <div className="offline-banner" role="status">
      <WifiOff size={14} />
      {tr(
        " Offline \u00B7 gespeicherte Artikeldaten. Fotos und Shops brauchen Netz.",
      )}
    </div>
  ) : null;
}
