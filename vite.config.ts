import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { workerSource } from "./src/lib/worker-source";
const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
export default defineConfig({
  plugins: [
    react(),
    {
      name: "rider-offline-shell",
      generateBundle(_, bundle) {
        const assets = Object.keys(bundle).filter(
          (name) =>
            /\.(?:js|css|woff2)$/.test(name) && !name.includes("riderScene"),
        );
        const shell = [
          "./",
          "index.html",
          "manifest.webmanifest",
          "favicon.svg",
          "icons/app-192.png",
          "icons/app-512.png",
          "icons/app-maskable-512.png",
          "icons/apple-touch-icon.png",
          ...assets,
        ];
        const version = createHash("sha256")
          .update(shell.join("|"))
          .update(workerSource("version", shell))
          .digest("hex")
          .slice(0, 12);
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: workerSource(version, shell),
        });
      },
    },
  ],
  base:
    process.env.VITE_BASE_PATH ??
    (repository?.endsWith(".github.io")
      ? "/"
      : "/flink-aschaffenburg-chat-projekt/"),
});
