import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export function StaticPage({
  headerNote,
  breadcrumb,
  children,
}: {
  headerNote: string;
  breadcrumb: string;
  children: React.ReactNode;
}) {
  return (
    <main className="detail-page">
      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="Cabin Filter Guide home">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verified by Sam7</small>
          </span>
        </Link>
        <span className="header-note">{headerNote}</span>
      </header>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All fitment records</Link>
        <span>/</span>
        <span>{breadcrumb}</span>
      </nav>

      <section className="prose-page">{children}</section>

      <SiteFooter />
    </main>
  );
}
