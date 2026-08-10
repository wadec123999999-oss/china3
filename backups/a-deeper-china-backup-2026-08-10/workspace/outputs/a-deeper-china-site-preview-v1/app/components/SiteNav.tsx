import Link from "next/link";

export function SiteNav({ light = false }: { light?: boolean }) {
  return (
    <header className={`site-nav ${light ? "page-nav" : ""}`} id="site-nav">
      <div className="wrap nav-inner">
        <Link className="brand" href="/" aria-label="A Deeper China home">A Deeper China<span>China, closely.</span></Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/cities">Cities</Link>
          <Link href="/how-it-reads">How it reads</Link>
          <Link href="/roadbooks">Roadbooks</Link>
          <Link className="nav-action" href="/start">Start with a route ↗</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return <footer><div className="wrap footer-inner"><span>© 2026 A Deeper China</span><span>Independent travel information · human-edited when scoped · no bookings</span></div></footer>;
}
