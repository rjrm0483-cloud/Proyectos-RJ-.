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
  Route as RouteIcon,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoryLabels, confidenceHelp, confidenceLabels } from "@/lib/labels";
import { getOptionLinks, getPatrocinador, getTripLinks } from "@/lib/monetizacion";
import { getRelatedByDestination, getRouteRecord, routeRecords } from "@/data/routes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return routeRecords.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = getRouteRecord(slug);
  if (!record) return {};

  const title = `${record.title}: options, costs and times`;
  const description = `${record.summary} ${record.options.length} options compared, each with its source.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/routes/${record.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/routes/${record.slug}`,
      title,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function RouteDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const record = getRouteRecord(slug);
  if (!record) notFound();

  const related = getRelatedByDestination(record);
  const tripLinks = getTripLinks();
  const patrocinador = getPatrocinador(record.slug);
  const optionLinks = record.options.map((option) => getOptionLinks(record, option.partner));
  const anyAffiliate = tripLinks.length > 0 || optionLinks.some((links) => links.length > 0);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: record.title,
    description: record.summary,
    inLanguage: "en",
    dateModified: record.verifiedAt,
    mainEntityOfPage: `${SITE_URL}/routes/${record.slug}`,
    author: { "@type": "Organization", name: SITE_NAME },
    citation: record.sources.map((source) => source.url),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "All routes", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: record.destination,
        item: `${SITE_URL}/places/${record.destinationSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: record.title,
        item: `${SITE_URL}/routes/${record.slug}`,
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

      <SiteHeader note={`Route ${record.slug}`} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All routes</Link>
        <span>/</span>
        <Link href={`/places/${record.destinationSlug}`}>{record.destination}</Link>
        <span>/</span>
        <span>{record.title}</span>
      </nav>

      <section className="detail-hero">
        <div>
          <div className="detail-badges">
            <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
              <CheckCircle2 aria-hidden="true" /> {confidenceLabels[record.confidence]} figures
            </Badge>
            <span>Checked {record.verifiedAt}</span>
          </div>
          <p className="detail-year">{categoryLabels[record.category]}</p>
          <h1>{record.title}</h1>
          <p className="detail-summary">{record.summary}</p>
        </div>

        <aside className="part-plate" aria-label="Our recommendation">
          <p>OUR PICK</p>
          <strong>{record.recommended}</strong>
          <span>{record.duration}</span>
          <Link href={`/places/${record.destinationSlug}`} className="part-plate-link">
            All routes to {record.destination} <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section className="spec-grid" aria-label="Route facts">
        <article>
          <RouteIcon aria-hidden="true" />
          <p>Distance</p>
          <h2>{record.distance}</h2>
        </article>
        <article>
          <Timer aria-hidden="true" />
          <p>Typical time</p>
          <h2>{record.duration}</h2>
        </article>
        <article>
          <MapPin aria-hidden="true" />
          <p>Starts at</p>
          <h2>{record.origin}</h2>
        </article>
        <article>
          <CalendarClock aria-hidden="true" />
          <p>Last checked</p>
          <h2>{record.verifiedAt}</h2>
        </article>
      </section>

      <section className="evidence-section" aria-labelledby="options-title">
        <div>
          <p className="eyebrow">YOUR OPTIONS</p>
          <h2 id="options-title">Every way to do it.<br />What it costs.</h2>
          <p>{confidenceHelp[record.confidence]}</p>
        </div>

        <div className="source-stack">
          {record.options.map((option, index) => (
            <article className="source-card" key={option.mode}>
              <div className="source-card-top">
                <span>{option.duration}</span>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{option.mode}</h3>
              <p><strong>{option.cost}</strong></p>
              <p>{option.detail}</p>
              {optionLinks[index].map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer sponsored">
                  {link.etiqueta} (affiliate link) <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="caution-strip">
        <AlertTriangle aria-hidden="true" />
        <div>
          <p>What could change these numbers</p>
          <strong>{record.caution}</strong>
        </div>
      </section>

      <section className="evidence-section" aria-labelledby="sources-title">
        <div>
          <p className="eyebrow">SOURCES</p>
          <h2 id="sources-title">Every figure.<br />With its source.</h2>
          <p>
            {SITE_NAME} separates an operator&apos;s published tariff from a
            traveler&apos;s report. When a price or timetable can change with the
            season, the route says so before you plan around it.
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
                Open the original source <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-section" aria-labelledby="related-title">
          <p className="eyebrow">SAME DESTINATION</p>
          <h2 id="related-title">Other ways to reach {record.destination}</h2>
          <ul className="related-list">
            {related.map((other) => (
              <li key={other.slug}>
                <Link href={`/routes/${other.slug}`}>
                  <span>{categoryLabels[other.category]}</span>
                  <strong>{other.title}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="commerce-section">
        <div>
          <p className="eyebrow">BEFORE YOU GO</p>
          <h2>Accuracy before commission.</h2>
          {patrocinador && (
            <aside className="sponsor-box">
              <span>Local operator · Sponsored</span>
              <strong>{patrocinador.nombre}</strong>
              <p>{patrocinador.texto}</p>
              {patrocinador.url && (
                <a href={patrocinador.url} target="_blank" rel="noreferrer sponsored">
                  Visit the sponsor <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </aside>
          )}
        </div>
        {anyAffiliate ? (
          <div className="commerce-status">
            <span>Trip essentials · Affiliate links</span>
            <ul className="buy-links">
              {tripLinks.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer sponsored">
                    {link.etiqueta} <ArrowUpRight aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p>
              We earn a commission if you book through these links, at no extra
              cost to you. Commission never changes what a route says about
              costs, times or which option we recommend.
            </p>
          </div>
        ) : (
          <div className="commerce-status">
            <span>Affiliate status</span>
            <strong>Not active</strong>
            <p>
              Clearly labelled booking links will be added only when a partner
              confirms trackable terms. Until then, book directly with the
              operator named in each option.
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
