type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
let prompt: InstallPrompt | null = null;
let registration: ServiceWorkerRegistration | null = null;
let ready = false;
const notify = () => window.dispatchEvent(new Event("rider-install-state"));
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone
  );
}
export function canInstall() {
  return !!prompt;
}
export function updateAvailable() {
  return !!registration?.waiting;
}
export function offlineReady() {
  return ready;
}
export async function installApp() {
  if (!prompt) return;
  const pending = prompt;
  await pending.prompt();
  await pending.userChoice;
  prompt = null;
  notify();
}
export function activateUpdate() {
  registration?.waiting?.postMessage({ type: "ACTIVATE_UPDATE" });
}
export function registerApp() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    prompt = event as InstallPrompt;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    prompt = null;
    notify();
  });
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  let replacing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (replacing) window.location.reload();
  });
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    })
    .then((result) => {
      registration = result;
      navigator.serviceWorker.ready.then(() => {
        ready = true;
        notify();
      });
      notify();
      result.addEventListener("updatefound", () => {
        result.installing?.addEventListener("statechange", () => {
          if (result.waiting) notify();
        });
      });
      window.addEventListener("rider-activate-update", () => {
        replacing = true;
        activateUpdate();
      });
    })
    .catch(() => {
      /* Online site remains usable if offline storage is unavailable. */
    });
}
