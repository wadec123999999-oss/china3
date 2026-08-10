import Link from "next/link";
import { SiteFooter, SiteNav } from "./components/SiteNav";
import { cities } from "./lib/cities";
import "./home.css";

export default function Home() {
  const shanghai = cities[0];

  return (
    <main>
      <SiteNav />

      <section className="hero home-hero" id="top">
        <div className="hero-media"><img src={shanghai.image} alt={shanghai.imageAlt} /></div>
        <div className="hero-shade" />
        <div className="hero-meta">Shanghai / first reading / 01</div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker mono">Independent China travel / a living route archive</div>
            <h1>A route is more than a list of <em>places.</em></h1>
            <p className="hero-intro">We make China legible before you arrive: the scale of a city, the rhythm of a day, and the decisions that keep a good trip from becoming a rushed one.</p>
            <div className="hero-actions"><Link className="button" href="/cities">Enter the city archive ↓</Link><Link className="text-link" href="/start">Bring your route</Link></div>
          </div>
          <div className="hero-bottom">
            <div className="city-switcher" aria-label="Featured city chapters">
              {cities.map((city) => <Link key={city.slug} href={`/cities/${city.slug}`}>{city.name}</Link>)}
            </div>
            <div className="scroll-cue"><i /><span>Scroll to read the route</span></div>
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div className="wrap home-intro-grid">
          <div><div className="eyebrow mono">Not a booking engine</div><h2>Good routes leave something out.</h2></div>
          <div className="home-intro-copy"><p>The useful question is not “what can I fit in?” It is “what deserves the time I actually have?”</p><p>A Deeper China makes that decision visible before the trains, transfers and must-see list take over.</p><Link className="quiet-link" href="/how-it-reads">See how the edit works →</Link></div>
        </div>
      </section>

      <section className="home-archive" id="featured-cities">
        <div className="wrap">
          <div className="home-section-head"><div><div className="eyebrow mono">The city archive</div><h2>Choose the question,<br /><i>then the city.</i></h2></div><Link className="text-link dark-link" href="/cities">View all city routes →</Link></div>
          <div className="city-card-grid">
            {cities.map((city, index) => <Link className="city-card" href={`/cities/${city.slug}`} key={city.slug}><img src={city.image} alt={city.imageAlt} /><span className="city-card-shade" /><div className="city-card-copy"><span className="mono">0{index + 1} / {city.kicker}</span><h3>{city.name}</h3><p>{city.summary}</p><span className="city-card-arrow">Open the reading ↗</span></div></Link>)}
          </div>
        </div>
      </section>

      <section className="home-ledger">
        <div className="wrap home-ledger-grid">
          <div><div className="eyebrow mono">A route, delivered</div><h2>See the difference between advice and a roadbook.</h2></div>
          <div className="home-ledger-copy"><p>Start with a decision, then go deeper only where it earns the time.</p><div className="home-products"><Link href="/roadbooks#reality-check"><span className="mono">Fast decision</span><strong>China Trip Reality Check</strong><b>US$39 ↗</b></Link><Link href="/roadbooks#deep-roadbook"><span className="mono">Deep delivery</span><strong>Deep City Roadbook</strong><b>from US$99 ↗</b></Link></div></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
