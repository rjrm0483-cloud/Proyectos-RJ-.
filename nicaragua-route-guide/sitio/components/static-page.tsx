import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
      <SiteHeader note={headerNote} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All routes</Link>
        <span>/</span>
        <span>{breadcrumb}</span>
      </nav>

      <section className="prose-page">{children}</section>

      <SiteFooter />
    </main>
  );
}
