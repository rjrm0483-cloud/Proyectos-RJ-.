import Link from "next/link";
import { SITE_NAME, SITE_SHORT, SITE_TAGLINE } from "@/lib/site";

export function SiteHeader({ note }: { note: string }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label={`${SITE_NAME} home`}>
        <span className="brand-mark">{SITE_SHORT}</span>
        <span>
          <strong>{SITE_NAME}</strong>
          <small>{SITE_TAGLINE}</small>
        </span>
      </Link>
      <span className="header-note">{note}</span>
    </header>
  );
}
