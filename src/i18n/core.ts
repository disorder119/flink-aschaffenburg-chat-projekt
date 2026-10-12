export const languages = ["de", "en", "ar", "hi"] as const;
export type Language = (typeof languages)[number];
export const languageNames: Record<Language, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية",
  hi: "हिन्दी",
};
let language: Language = "de";
let dictionary: Record<string, string> = {};
let folded: Record<string, string> = {};
let revision = 0;
let request = 0;
const listeners = new Set<() => void>();
export const subscribeLanguage = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const languageRevision = () => revision;
export const currentLanguage = () => language;
export const currentLocale = () =>
  ({ de: "de-DE", en: "en-GB", ar: "ar-EG", hi: "hi-IN" })[language];
export const normalizeKey = (value: string) =>
  value.replace(/\s+/g, " ").trim();
let patterns: { regex: RegExp; value: string }[] = [];
const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function translateWith(
  source: string,
  entries: Record<string, string>,
  values: Record<string, unknown> = {},
): string {
  const key = normalizeKey(source);
  let result = entries[key] ?? source;
  for (const [name, value] of Object.entries(values))
    result = result.replaceAll(`{${name}}`, String(value));
  return result;
}
export function tr(
  source: string | number | null | undefined,
  values: Record<string, unknown> = {},
  depth = 0,
): string {
  if (source === null || source === undefined) return "";
  const text = String(source);
  if (language === "de") return translateWith(text, {}, values);
  const key = normalizeKey(text);
  let translated = dictionary[key] ?? folded[key.toLocaleLowerCase("de")];
  if (translated === undefined && depth < 3) {
    for (const pattern of patterns) {
      const match = key.match(pattern.regex);
      if (match) {
        translated = pattern.value.replace(/\{(\d+)\}/g, (_, n) =>
          tr(match[Number(n) + 1], {}, depth + 1),
        );
        break;
      }
    }
  }
  if (translated === undefined) translated = text;
  else {
    translated =
      (text.startsWith(" ") ? " " : "") +
      translated +
      (text.endsWith(" ") ? " " : "");
  }
  return translated.replace(/\{([^}]+)\}/g, (whole, name) =>
    name in values ? tr(String(values[name]), {}, depth + 1) : whole,
  );
}
export async function setLanguage(next: Language) {
  if (!languages.includes(next)) return;
  const token = ++request;
  const entries: Record<string, string> =
    next === "de"
      ? {}
      : (
          await {
            en: () => import("./locales/en.json"),
            ar: () => import("./locales/ar.json"),
            hi: () => import("./locales/hi.json"),
          }[next]()
        ).default;
  if (token !== request) return;
  language = next;
  dictionary = entries;
  folded = Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key.toLocaleLowerCase("de"),
      value,
    ]),
  );
  patterns = Object.entries(dictionary)
    .filter(
      ([key]) =>
        /\{\d+\}/.test(key) &&
        normalizeKey(key.replace(/\{\d+\}/g, "")).length > 2,
    )
    .map(([key, value]) => ({
      regex: new RegExp(
        "^" +
          key
            .split(/\{\d+\}/)
            .map(escaped)
            .join("(.*?)") +
          "$",
      ),
      value,
    }));
  document.documentElement.lang = next;
  document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  try {
    localStorage.setItem("rider-language-v1", next);
  } catch {
    /* Language remains available without storage. */
  }
  revision++;
  listeners.forEach((listener) => listener());
}
export function initializeLanguage() {
  try {
    const saved = localStorage.getItem("rider-language-v1") as Language;
    if (languages.includes(saved)) void setLanguage(saved);
  } catch {
    /* German default. */
  }
}
