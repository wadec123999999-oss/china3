import Link from "next/link";
import { SiteFooter, SiteNav } from "../components/SiteNav";
import "../home.css";

export default function RoadbooksPage() {
  return (
    <main className="page-shell">
      <SiteNav light />
      <section className="page-intro"><div className="wrap page-intro-grid"><div><div className="eyebrow mono">Roadbooks / paid delivery</div><h1>Useful before it is <i>beautiful.</i></h1></div><p>Choose the depth of edit your trip needs. Every format starts from your actual days, not a pre-set package.</p></div></section>
      <section className="product-list"><div className="wrap"><article id="reality-check" className="product-row"><div className="mono">01 / Fast decision</div><div><h2>China Trip Reality Check</h2><p>A focused audit of the route you already have: what to keep, cut, move and verify before you book.</p><ul><li>One route edit</li><li>Transfer and night-count check</li><li>Delivered digitally</li></ul></div><strong>US$39</strong></article><article id="deep-roadbook" className="product-row featured"><div className="mono">02 / Deep delivery</div><div><h2>Deep City Roadbook</h2><p>One city, edited around your pace — neighbourhood logic, transitions, useful context and the details that make a day hold together.</p><ul><li>Main route + slower branch</li><li>Rain and energy alternatives</li><li>One human review before delivery</li></ul></div><strong>from US$99</strong></article></div></section>
      <section className="roadbook-sample"><div className="wrap roadbook-sample-grid"><div><div className="eyebrow mono">A sample spread</div><h2>Not a PDF full of places. A way to move through a day.</h2><p>A finished roadbook gives the route a main line, a slower version, and the decisions that keep you independent on the ground.</p><Link className="button dark" href="/start">Start with your route ↗</Link></div><div className="spread"><article className="spread-page"><div className="mono">Day 03 / Shanghai</div><h3>Read the city from the river edge.</h3><p>Start where the scale changes. Stay long enough for the second reading.</p><ul className="spread-list"><li>North Bund before the first tour groups</li><li>One architectural detour, not five</li><li>Rain branch: museum + lane walk</li></ul></article><article className="spread-page dark"><div className="mono">Route note / human edit</div><h3>Keep the afternoon open.</h3><p>Do not stack another landmark after this. The point is to notice the distance between buildings.</p><ul className="spread-list"><li>15 min buffer between districts</li><li>Local meal, not a “must-try” list</li><li>Book nothing after 18:00</li></ul></article></div></div></section>
      <SiteFooter />
    </main>
  );
}
