import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="20" fill="#f2762e" />
      <circle cx="27" cy="13" r="5" fill="#ffe7a8" />
      <path d="M4 30 L15 15 L19 19 L23 14 L36 30 Z" fill="#1b2a3a" />
      <path d="M15 15 L17 17 L19 15 L21 17 L23 14" fill="none" stroke="#fff3c4" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M2 31 q9 -5 18 0 t18 0 v9 h-36z" fill="#1b8a9a" />
    </svg>
  );
}

export function SiteHeader({ note }: { note: string }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label={`${SITE_NAME} home`}>
        <span className="brand-mark"><BrandMark /></span>
        <span>
          <strong>{SITE_NAME}</strong>
          <small>{SITE_TAGLINE}</small>
        </span>
      </Link>
      <span className="header-note">{note}</span>
    </header>
  );
}
