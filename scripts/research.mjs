// Read public product pages. No images are copied into the application.
import { mkdir, writeFile } from "node:fs/promises";
const urls = process.argv.slice(2);
await mkdir("research/raw", { recursive: true });
for (const url of urls) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    const html = await res.text();
    const ld = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return m[1];
      }
    });
    const clean = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ");
    const key = new URL(url).pathname
      .split("/")
      .filter(Boolean)
      .join("-")
      .slice(-140);
    await writeFile(
      `research/raw/${key}.json`,
      JSON.stringify(
        {
          url,
          status: res.status,
          checkedAt: new Date().toISOString(),
          ld,
          text: clean,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify(
        {
          url,
          status: res.status,
          ld,
          text: clean.slice(
            Math.max(0, clean.indexOf("Beschreibung") - 300),
            clean.indexOf("Beschreibung") + 2200,
          ),
        },
        null,
        2,
      ).slice(0, 7000),
    );
  } catch (e) {
    console.log(JSON.stringify({ url, error: e.message }));
  }
}
