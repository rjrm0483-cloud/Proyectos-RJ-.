import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoryLabels, confidenceLabels } from "@/lib/labels";
import { DestinationPhoto } from "@/components/destination-photo";
import { getDestinationImage } from "@/data/images";
import { getRoutesByDestination, getUniqueDestinationSlugs } from "@/data/routes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type PlacePageProps = {
  params: Promise<{ place: string }>;
};

export function generateStaticParams() {
  return getUniqueDestinationSlugs().map((place) => ({ place }));
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { place } = await params;
  const records = getRoutesByDestination(place);
  if (records.length === 0) return {};

  const destination = records[0].destination;
  const title = `How to get to ${destination}, Nicaragua`;
  const description = `${records.length} source-checked route${records.length === 1 ? "" : "s"} to ${destination}: ${records
    .map((record) => record.origin)
    .join(", ")}. Costs, times and caveats for each option.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/places/${place}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/places/${place}`,
      title,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { place } = await params;
  const records = getRoutesByDestination(place);
  if (records.length === 0) notFound();

  const destination = records[0].destination;
  const photo = getDestinationImage(place);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Routes to ${destination}`,
    inLanguage: "en",
    numberOfItems: records.length,
    itemListElement: records.map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: record.title,
      url: `${SITE_URL}/routes/${record.slug}`,
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

      <SiteHeader note={`Destination: ${destination}`} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft aria-hidden="true" /> All routes</Link>
        <span>/</span>
        <span>{destination}</span>
      </nav>

      <section className="part-page-hero">
        <p className="eyebrow">DESTINATION</p>
        <h1>Getting to {destination}</h1>
        <p className="hero-deck">
          {records.length} route{records.length === 1 ? "" : "s"} with sources in this
          directory. Open one to compare every option, its cost, its timing and
          the caveat that could change the plan.
        </p>
      </section>

      {photo && <DestinationPhoto image={photo} />}

      <section className="directory-section" aria-label={`Routes to ${destination}`}>
        <div className="record-grid">
          {records.map((record) => (
            <article className="record-card" key={record.slug}>
              <div className="record-topline">
                <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
                  <CheckCircle2 aria-hidden="true" /> {confidenceLabels[record.confidence]}
                </Badge>
                <span>{record.sources[0].type}</span>
              </div>
              <p className="record-focus">{categoryLabels[record.category]}</p>
              <p className="record-year">{record.duration}</p>
              <h3>{record.title}</h3>
              <dl>
                <div><dt>From</dt><dd>{record.origin}</dd></div>
                <div><dt>Options</dt><dd>{record.options.length} compared</dd></div>
              </dl>
              <Link href={`/routes/${record.slug}`} className="record-link">
                Open the full route <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
