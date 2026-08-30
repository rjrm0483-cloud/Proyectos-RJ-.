import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import { confidenceLabels, coverageLabels } from "@/lib/labels";
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
  const title = `Filtro de cabina ${partReference} — vehículos compatibles`;
  const description = `Aplicaciones verificadas del filtro de cabina ${partReference}: ${vehicles}. Cada ficha conserva su fuente.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/parts/${ref}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/parts/${ref}`,
      title,
      description,
      siteName: SITE_NAME,
      locale: "es_NI",
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
    name: `Aplicaciones del filtro de cabina ${partReference}`,
    inLanguage: "es",
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
        <Link href="/" className="brand-lockup" aria-label="Inicio de Cabin Filter Guide">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verificado con fuentes</small>
          </span>
        </Link>
        <span className="header-note">Pieza {partReference}</span>
      </header>

      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link href="/"><ArrowLeft aria-hidden="true" /> Todas las fichas</Link>
        <span>/</span>
        <span>{partReference}</span>
      </nav>

      <section className="part-page-hero">
        <p className="eyebrow">REFERENCIA DE PIEZA</p>
        <h1>{partReference}</h1>
        <p className="hero-deck">
          {records.length} aplicación{records.length === 1 ? "" : "es"} verificada{records.length === 1 ? "" : "s"} en
          este directorio. Abre una ficha para ver fuentes, punto de acceso,
          orientación del flujo y la cautela que podría cambiar la
          compatibilidad.
        </p>
      </section>

      <section className="directory-section" aria-label="Vehículos que usan esta pieza">
        <div className="record-grid">
          {records.map((record) => (
            <article className="record-card" key={record.slug}>
              <div className="record-topline">
                <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
                  <CheckCircle2 aria-hidden="true" /> {confidenceLabels[record.confidence]}
                </Badge>
                <span>{record.sources[0].type}</span>
              </div>
              <p className="record-focus">{coverageLabels[record.focus]}</p>
              <p className="record-year">{record.year}</p>
              <h3>{record.make} {record.model}</h3>
              <dl>
                <div><dt>Mercado</dt><dd>{record.market}</dd></div>
                <div><dt>Configuración</dt><dd>{record.filterCount}</dd></div>
              </dl>
              <Link href={`/filters/${record.slug}`} className="record-link">
                Abrir ficha completa <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
