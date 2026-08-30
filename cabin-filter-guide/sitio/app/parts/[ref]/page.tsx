import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import { getRecordsByPartSlug, getUniquePartSlugs } from "@/data/filters";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type PartPageProps = {
  params: Promise<{ ref: string }>;
};

export function generateStaticParams() {
  return getUniquePartSlugs().map((ref) => ({ ref }));
}

export async function generateMetadata({ params }: PartPageProps): Promise<Metadata> {
  const { ref } = await params;
  const records = getRecordsByPartSlug(ref);
  if (records.length === 0) return {};

  const partReference = records[0].partReference;
  const vehicles = records.map((r) => `${r.make} ${r.model}`).join(", ");
  const title = `${partReference} cabin air filter — vehicle applications`;
  const description = `Verified vehicle applications for cabin air filter ${partReference}: ${vehicles}. Every fitment keeps its source.`;

  return {
    title,
    description,
    alternates: { canonical: `/parts/${ref}` },
    openGraph: {
      type: "article",
      url: `/parts/${ref}`,
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function PartPage({ params }: PartPageProps) {
  const { ref } = await params;
  const records = getRecordsByPartSlug(ref);
  if (records.length === 0) notFound();

  const partReference = records[0].partReference;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${partReference} cabin air filter applications`,
    numberOfItems: records.length,
    itemListElement: records.map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${record.year} ${record.make} ${record.model}`,
      url: `${SITE_URL}/filters/${record.slug}`,
    })),
  };

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="Cabin Filter Guide home">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verified by Sam7</small>
          </span>
        </Link>
        <span className="header-note">Part {partReference}</span>
      </header>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All fitment records</Link>
        <span>/</span>
        <span>{partReference}</span>
      </nav>

      <section className="part-page-hero">
        <p className="eyebrow">PART REFERENCE</p>
        <h1>{partReference}</h1>
        <p className="hero-deck">
          {records.length} verified vehicle application{records.length === 1 ? "" : "s"} in
          this directory. Open a record to see sources, access point, airflow
          orientation, and the caveat that could change fitment.
        </p>
      </section>

      <section className="directory-section" aria-label="Vehicles using this part">
        <div className="record-grid">
          {records.map((record) => (
            <article className="record-card" key={record.slug}>
              <div className="record-topline">
                <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
                  <CheckCircle2 aria-hidden="true" /> {record.confidence}
                </Badge>
                <span>{record.sources[0].type}</span>
              </div>
              <p className="record-focus">{record.focus}</p>
              <p className="record-year">{record.year}</p>
              <h3>{record.make} {record.model}</h3>
              <dl>
                <div><dt>Market</dt><dd>{record.market}</dd></div>
                <div><dt>Configuration</dt><dd>{record.filterCount}</dd></div>
              </dl>
              <Link href={`/filters/${record.slug}`} className="record-link">
                Open fitment record <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
