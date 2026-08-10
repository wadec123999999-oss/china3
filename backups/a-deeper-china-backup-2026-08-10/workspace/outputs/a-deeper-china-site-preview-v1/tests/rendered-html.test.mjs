import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/", init = { headers: { accept: "text/html" } }) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, init),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the cinematic China route archive homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>A Deeper China — China, understood before you arrive\.<\/title>/i);
  assert.match(html, /A route is more than a list of/);
  assert.match(html, /Shanghai/);
  assert.match(html, /Chongqing/);
  assert.match(html, /Choose the question/);
  assert.match(html, /Deep City Roadbook/);
  assert.match(html, /US\$39/);
  assert.match(html, /from US\$99/);
  assert.match(html, /Start with a route/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton|ChatGPT/i);
});

test("connects the route intake to the formal direction layer", async () => {
  const response = await render("/api/route-direction", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Four nights, first visit, architecture and food, no rushing." }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.mode, "route_direction");
  assert.ok(Array.isArray(result.best_fit_city_direction));
  assert.ok(result.best_fit_city_direction.length > 0);
  assert.ok(Array.isArray(result.what_i_still_need_to_know));
  assert.ok(Array.isArray(result.boundary));
});

test("keeps the preview focused on the commercial editorial surface", async () => {
  const [page, roadbooks, start, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/roadbooks/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/start/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /className="hero-media"/);
  assert.match(page, /className="city-card"/);
  assert.match(roadbooks, /className="spread"/);
  assert.match(page, /className="home-products"/);
  assert.match(start, /onSubmit=\{handleSubmit\}/);
  assert.match(layout, /title: "A Deeper China/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|<Chat/);
  assert.doesNotMatch(layout, /_sites-preview|Starter Project/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("exposes predictable page routes for the commercial site", async () => {
  for (const pathname of ["/cities", "/cities/chongqing", "/roadbooks", "/how-it-reads", "/start"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    const html = await response.text();
    assert.match(html, /A Deeper China/);
    assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton/i);
  }
});
