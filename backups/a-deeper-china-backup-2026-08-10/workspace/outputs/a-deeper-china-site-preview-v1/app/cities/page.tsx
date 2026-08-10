import Link from "next/link";
import { SiteFooter, SiteNav } from "../components/SiteNav";
import { archiveGroups, cities } from "../lib/cities";
import "../home.css";

export default function CitiesPage() {
  return (
    <main className="page-shell">
      <SiteNav light />
      <section className="page-intro">
        <div className="wrap page-intro-grid"><div><div className="eyebrow mono">The city archive</div><h1>Start with the question,<br /><i>not the checklist.</i></h1></div><p>Four core cities are open for a first reading. The wider archive is built around the same decision: what deserves the time you actually have?</p></div>
      </section>
      <section className="archive-featured"><div className="wrap"><div className="section-rule mono">Featured readings / 04</div><div className="city-card-grid">{cities.map((city, index) => <Link className="city-card" href={`/cities/${city.slug}`} key={city.slug}><img src={city.image} alt={city.imageAlt} /><span className="city-card-shade" /><div className="city-card-copy"><span className="mono">0{index + 1} / {city.kicker}</span><h2>{city.name}</h2><p>{city.summary}</p><span className="city-card-arrow">Open the reading ↗</span></div></Link>)}</div></div></section>
      <section className="archive-index"><div className="wrap archive-index-grid"><div><div className="eyebrow mono">The wider archive</div><h2>Routes are grouped by the contrast they create.</h2></div><div className="archive-groups">{archiveGroups.map((group) => <div key={group.label}><span className="mono">{group.label}</span><strong>{group.cities}</strong></div>)}</div></div></section>
      <SiteFooter />
    </main>
  );
}
