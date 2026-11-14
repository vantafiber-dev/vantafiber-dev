#!/usr/bin/env node
/**
 * Vanta Fiber local QA smoke: render check (desktop + mobile) against the dev
 * server, capture console/page errors, horizontal overflow and screenshots.
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = process.env.VANTA_SMOKE_URL || "http://127.0.0.1:8080/";
const OUT =
  process.env.VANTA_SMOKE_OUT ||
  "C:\\Users\\PlayNexus\\app-builder-workspace\\screenshots\\vanta-preview";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/join", name: "join" },
  { path: "/status", name: "status" },
  { path: "/seasons", name: "seasons" },
  { path: "/fair-play", name: "fair-play" },
  { path: "/help", name: "help" },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = {};
for (const vp of [
  { name: "desktop", width: 1280, height: 800, path: `${OUT}.png` },
  { name: "mobile", width: 390, height: 844, path: `${OUT}-mobile.png` },
]) {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = { consoleErrors: [], pageErrors: [] };
    page.on("console", (m) => {
      if (m.type() === "error") errors.consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => errors.pageErrors.push(String(e?.message || e)));
    const resp = await page.goto(new URL(route.path, BASE_URL).toString(), {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    const status = resp?.status() ?? 0;
    await page.waitForTimeout(900);
    const title = await page.title();
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    const shotPath = `${OUT}-${vp.name}-${route.name}.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    await page.close();
    results[`${vp.name}:${route.name}`] = {
      status,
      title,
      bodyTextLen: String(bodyText ?? "").trim().length,
      bodyTextPrefix: String(bodyText ?? "").trim().slice(0, 80),
      horizontalOverflow,
      consoleErrors: errors.consoleErrors,
      pageErrors: errors.pageErrors,
      screenshot: shotPath,
    };
  }
}

await browser.close();
const verdict = { url: BASE_URL, results };
writeFileSync(`${OUT}.json`, JSON.stringify(verdict, null, 2));
console.log(JSON.stringify(verdict, null, 2));
const bad = Object.keys(results).filter((key) => {
  const v = results[key];
  return (
    v.status >= 400 ||
    v.consoleErrors.length > 0 ||
    v.pageErrors.length > 0 ||
    Boolean(v.horizontalOverflow)
  );
});
process.exitCode = bad.length ? 1 : 0;
