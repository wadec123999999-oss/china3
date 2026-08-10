import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "../../components/SiteNav";
import { cities, cityBySlug, type CitySlug } from "../../lib/cities";
import "../../home.css";

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cityBySlug[slug as CitySlug];
  if (!city) notFound();
  const related = cities.filter((item) => item.slug !== city.slug).slice(0, 2);

  return (
    <main className="page-shell city-detail-page">
      <SiteNav light />
      <section className="city-detail-hero"><img src={city.image} alt={city.imageAlt} /><span className="city-detail-shade" /><div className="wrap city-detail-copy"><div className="mono">{city.kicker}</div><h1>{city.title}</h1><p>{city.summary}</p><span className="city-credit">Image: {city.imageCredit}</span></div></section>
      <section className="city-facts"><div className="wrap city-facts-grid"><div><span className="mono">Read it as</span><strong>{city.readAs}</strong></div><div><span className="mono">Protect</span><strong>{city.protect}</strong></div><div><span className="mono">Suggested stay</span><strong>{city.nights}</strong></div><div><span className="mono">The useful question</span><strong>{city.question}</strong></div></div></section>
      <section className="city-reading"><div className="wrap city-reading-grid"><div><div className="eyebrow mono">Route reading</div><h2>{city.route}</h2><Link className="button dark" href="/start">Ask for this route ↗</Link></div><div className="city-notes"><div className="mono">Field notes / before you book</div><ul>{city.notes.map((note) => <li key={note}>{note}</li>)}</ul><p>This is direction, not a booking. The final roadbook is shaped around your dates, energy, weather and tolerance for transfers.</p></div></div></section>
      <section className="city-related"><div className="wrap"><div className="section-rule mono">Continue reading</div><div className="related-links">{related.map((item) => <Link href={`/cities/${item.slug}`} key={item.slug}><span className="mono">{item.kicker}</span><strong>{item.name}</strong><span>Open route ↗</span></Link>)}</div></div></section>
      <SiteFooter />
    </main>
  );
}
