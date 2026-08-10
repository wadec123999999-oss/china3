import Link from "next/link";
import { SiteFooter, SiteNav } from "../components/SiteNav";
import "../home.css";

export default function HowItReadsPage() {
  return (
    <main className="page-shell">
      <SiteNav light />
      <section className="page-intro"><div className="wrap page-intro-grid"><div><div className="eyebrow mono">How it reads</div><h1>Every transfer should change the <i>story.</i></h1></div><p>We do not connect cities because a map makes it easy. We connect them when the contrast gives the traveler a better understanding of China.</p></div></section>
      <section className="reading-method"><div className="wrap method-grid"><div><span className="mono">01 / Read the real question</span><h2>What is the traveler actually trying to make room for?</h2></div><p>Days, energy, weather, companions and the thing they want to understand. A city is only useful if it answers the question behind the booking.</p><div><span className="mono">02 / Make the trade-offs visible</span><h2>Keep, cut, move and verify.</h2></div><p>One city may need to go. One afternoon may need to stay empty. The edit is the product.</p><div><span className="mono">03 / Leave the traveler in control</span><h2>Direction, not a tour operator.</h2></div><p>You book directly. We explain what to protect, what to check and what can wait.</p></div></section>
      <section className="method-contrast"><div className="wrap"><div className="section-rule mono">A route decision / Chengdu + Chongqing</div><div className="contrast-grid"><div><span className="mono">Chengdu</span><h2>Protect time.</h2><p>Tea, food, public life, an afternoon that does not need to be explained.</p></div><div><span className="mono">Chongqing</span><h2>Follow movement.</h2><p>Levels, rivers, stairs, the city revealing itself as you cross it.</p></div></div><p className="method-bottom">If you have two nights, choose the question. If you have four, let the contrast breathe.</p><Link className="button dark" href="/start">Bring us your route ↗</Link></div></section>
      <SiteFooter />
    </main>
  );
}
