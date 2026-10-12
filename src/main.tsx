import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerApp } from "./lib/pwa";
import { initializeLanguage } from "./i18n/core";
import "./styles.css";
import "./upgrade.css";
import "./photo.css";
import "./workspace.css";
import "./app.css";
registerApp();
initializeLanguage();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
