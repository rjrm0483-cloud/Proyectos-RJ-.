import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-copy">
        <p>Cabin Filter Guide is an independent reference directory built by Sam7.</p>
        <p>
          Affiliate links, if added, will be labeled. Always confirm fitment for
          your VIN, market, and build date before purchase.
        </p>
      </div>
      <nav className="footer-nav" aria-label="Site pages">
        <Link href="/about">About &amp; methodology</Link>
        <Link href="/disclosure">Affiliate disclosure</Link>
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}
