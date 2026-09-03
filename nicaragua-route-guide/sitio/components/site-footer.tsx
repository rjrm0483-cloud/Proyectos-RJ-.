import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-copy">
        <p>{SITE_NAME} is an independent reference guide.</p>
        <p>
          If affiliate links are ever added they will be clearly labelled. Fares,
          timetables and fees change: confirm with the operator or authority
          before you travel.
        </p>
      </div>
      <nav className="footer-nav" aria-label="Site pages">
        <Link href="/essentials">Nicaragua travel essentials</Link>
        <Link href="/about">About and method</Link>
        <Link href="/disclosure">Affiliate disclosure</Link>
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}
