import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  PackageCheck,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import {
  filterRecords,
  getFilterRecord,
  getRelatedByPart,
  partReferenceSlug,
} from "@/data/filters";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return filterRecords.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = getFilterRecord(slug);
  if (!record) return {};

  const title = `${record.year} ${record.make} ${record.model} cabin air filter`;
  const description = `${record.summary} Part reference: ${record.partReference}. Sources and fitment caveats included.`;

  return {
    title,
    description,
    alternates: { canonical: `/filters/${record.slug}` },
    openGraph: {
      type: "article",
      url: `/filters/${record.slug}`,
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function FilterDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const record = getFilterRecord(slug);
  if (!record) notFound();

  const related = getRelatedByPart(record);
  const partSlug = partReferenceSlug(record.partReference);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${record.year} ${record.make} ${record.model} cabin air filter fitment`,
    description: record.summary,
    dateModified: record.verifiedAt,
    mainEntityOfPage: `${SITE_URL}/filters/${record.slug}`,
    author: { "@type": "Organization", name: `${SITE_NAME} by Sam7` },
    citation: record.sources.map((source) => source.url),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "All fitment records",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${record.make} ${record.model}`,
        item: `${SITE_URL}/filters/${record.slug}`,
      },
    ],
  };

  return (
    <main className="detail-page">
      {[articleLd, breadcrumbLd].map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="Cabin Filter Guide home">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verified by Sam7</small>
          </span>
        </Link>
        <span className="header-note">Record {record.slug}</span>
      </header>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All fitment records</Link>
        <span>/</span>
        <span>{record.make} {record.model}</span>
      </nav>

      <section className="detail-hero">
        <div>
          <div className="detail-badges">
            <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
              <CheckCircle2 aria-hidden="true" /> {record.confidence} fitment
            </Badge>
            <span>Checked {record.verifiedAt}</span>
          </div>
          <p className="detail-year">{record.year}</p>
          <h1>{record.make}<br />{record.model}</h1>
          <p className="detail-summary">{record.summary}</p>
        </div>

        <aside className="part-plate" aria-label="Filter part reference">
          <p>PART REFERENCE</p>
          <strong>{record.partReference}</strong>
          <span>{record.filterCount} / {record.market}</span>
          <Link href={`/parts/${partSlug}`} className="part-plate-link">
            All vehicles using this part <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section className="spec-grid" aria-label="Fitment specifications">
        <article>
          <PackageCheck aria-hidden="true" />
          <p>Configuration</p>
          <h2>{record.filterCount}</h2>
        </article>
        <article>
          <MapPin aria-hidden="true" />
          <p>Access point</p>
          <h2>{record.access}</h2>
        </article>
        <article>
          <Wind aria-hidden="true" />
          <p>Airflow orientation</p>
          <h2>{record.airflow}</h2>
        </article>
        <article>
          <CalendarClock aria-hidden="true" />
          <p>Replacement timing</p>
          <h2>{record.replacementInterval}</h2>
        </article>
      </section>

      <section className="evidence-section">
        <div>
          <p className="eyebrow">FITMENT EVIDENCE</p>
          <h2>Every claim.<br />Visible sources.</h2>
          <p>
            Cabin Filter Guide separates a confirmed catalog match from a general product
            recommendation. When trim, market, or build date can change the answer,
            the record says so before sending you to a seller. Some records use a
            second source to separate part fitment from installation instructions.
          </p>
        </div>

        <div className="source-stack">
          {record.sources.map((source) => (
            <article className="source-card" key={source.url}>
              <div className="source-card-top">
                <span>{source.type}</span>
                <ExternalLink aria-hidden="true" />
              </div>
              <h3>{source.label}</h3>
              <p>{source.supports}</p>
              <a href={source.url} target="_blank" rel="noreferrer">
                Inspect original source <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="caution-strip">
        <AlertTriangle aria-hidden="true" />
        <div>
          <p>What could change this fitment</p>
          <strong>{record.caution}</strong>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-section" aria-labelledby="related-title">
          <p className="eyebrow">SAME PART REFERENCE</p>
          <h2 id="related-title">Vehicles that share this filter</h2>
          <ul className="related-list">
            {related.map((other) => (
              <li key={other.slug}>
                <Link href={`/filters/${other.slug}`}>
                  <span>{other.year}</span>
                  <strong>{other.make} {other.model}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="commerce-section">
        <div>
          <p className="eyebrow">BUYING LINKS</p>
          <h2>Accuracy before commission.</h2>
        </div>
        <div className="commerce-status">
          <span>Affiliate status</span>
          <strong>Not activated</strong>
          <p>
            Sam7 will only add clearly labeled buying links after the merchant
            confirms trackable terms and the product match is independently verified.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
