"use client";

import { FormEvent, useState } from "react";
import { SiteFooter, SiteNav } from "../components/SiteNav";
import "../home.css";

type RouteDirection = {
  mode: string;
  what_you_are_really_choosing: string;
  best_fit_city_direction: Array<{ city: string; for: string; cautions: string[] }>;
  trade_off: string[];
  what_i_still_need_to_know: string[];
  likely_unstated_needs_to_confirm: Array<{ confirmation_question?: string }>;
  boundary: string[];
};

export default function StartPage() {
  const [result, setResult] = useState<RouteDirection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/route-direction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: String(form.get("plan") || "") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The route reader could not respond.");
      setResult(data as RouteDirection);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The route reader could not respond.");
    } finally {
      setLoading(false);
    }
  }
  return <main className="page-shell"><SiteNav light /><section className="start-page"><div className="wrap start-page-grid"><div><div className="eyebrow mono">Bring your route</div><h1>Tell us what you want to <i>understand.</i></h1><p>Start with a city, a feeling or a half-formed plan. The route reader asks only what can change the decision.</p><div className="start-promise"><span>01</span><p>No sales call. No booking obligation.</p><span>02</span><p>First direction before a long questionnaire.</p><span>03</span><p>Research direction only — no booking or availability promise.</p></div></div>{result ? <div className="start-result" role="status" aria-live="polite"><span className="mono">Route direction / research draft</span><h2>{result.what_you_are_really_choosing}</h2><div className="result-block"><span className="mono">Best-fit direction</span>{result.best_fit_city_direction.map((item) => <article key={item.city}><strong>{item.city}</strong><p>{item.for}</p><small>{item.cautions.join(" · ")}</small></article>)}</div><div className="result-block"><span className="mono">The trade-off</span><ul>{result.trade_off.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="result-block"><span className="mono">Two useful questions</span><ul>{result.what_i_still_need_to_know.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul></div><button className="result-reset" type="button" onClick={() => setResult(null)}>Edit the route brief ↗</button></div> : <form className="start-form" onSubmit={handleSubmit}><label className="mono" htmlFor="plan">A city, a feeling, or the route you already have</label><textarea id="plan" name="plan" required placeholder="We have 10 days. We like architecture and food, and do not want a checklist trip." /><label className="mono" htmlFor="email">Email <span className="optional">optional for this preview</span></label><input id="email" name="email" type="email" placeholder="you@example.com" /><button className="button dark" type="submit" disabled={loading}>{loading ? "Reading the route…" : "Get a route direction →"}</button>{error ? <p className="form-error" role="alert">{error}</p> : null}</form>}</div></section><SiteFooter /></main>;
}
