import { useSyncExternalStore } from "react";
import { Globe2 } from "lucide-react";
import {
  currentLanguage,
  languages,
  languageNames,
  setLanguage,
  languageRevision,
  subscribeLanguage,
  tr,
  type Language,
} from "../i18n/core";
export function LanguagePicker() {
  useSyncExternalStore(subscribeLanguage, languageRevision);
  return (
    <label className="language-picker">
      <Globe2 size={17} aria-hidden="true" />
      <select
        value={currentLanguage()}
        aria-label={tr("Sprache auswählen")}
        onChange={(event) => void setLanguage(event.target.value as Language)}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {tr(languageNames[lang])}
          </option>
        ))}
      </select>
    </label>
  );
}
