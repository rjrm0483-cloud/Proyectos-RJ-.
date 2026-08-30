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
import { confidenceLabels } from "@/lib/labels";
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

  const title = `Filtro de cabina ${record.make} ${record.model} ${record.year}`;
  const description = `${record.summary} Referencia: ${record.partReference}. Incluye fuentes y cautelas de compatibilidad.`;

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
      locale: "es_NI",
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
    headline: `Filtro de cabina ${record.make} ${record.model} ${record.year}`,
    description: record.summary,
    inLanguage: "es",
    dateModified: record.verifiedAt,
    mainEntityOfPage: `${SITE_URL}/filters/${record.slug}`,
    author: { "@type": "Organization", name: SITE_NAME },
    citation: record.sources.map((source) => source.url),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Todas las fichas",
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
        <Link href="/" className="brand-lockup" aria-label="Inicio de Cabin Filter Guide">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verificado con fuentes</small>
          </span>
        </Link>
        <span className="header-note">Ficha {record.slug}</span>
      </header>

      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link href="/"><ArrowLeft aria-hidden="true" /> Todas las fichas</Link>
        <span>/</span>
        <span>{record.make} {record.model}</span>
      </nav>

      <section className="detail-hero">
        <div>
          <div className="detail-badges">
            <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
              <CheckCircle2 aria-hidden="true" /> Compatibilidad {confidenceLabels[record.confidence].toLowerCase()}
            </Badge>
            <span>Revisada el {record.verifiedAt}</span>
          </div>
          <p className="detail-year">{record.year}</p>
          <h1>{record.make}<br />{record.model}</h1>
          <p className="detail-summary">{record.summary}</p>
        </div>

        <aside className="part-plate" aria-label="Referencia de la pieza">
          <p>REFERENCIA DE PIEZA</p>
          <strong>{record.partReference}</strong>
          <span>{record.filterCount} / {record.market}</span>
          <Link href={`/parts/${partSlug}`} className="part-plate-link">
            Todos los vehículos con esta pieza <ArrowUpRight aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section className="spec-grid" aria-label="Especificaciones de compatibilidad">
        <article>
          <PackageCheck aria-hidden="true" />
          <p>Configuración</p>
          <h2>{record.filterCount}</h2>
        </article>
        <article>
          <MapPin aria-hidden="true" />
          <p>Punto de acceso</p>
          <h2>{record.access}</h2>
        </article>
        <article>
          <Wind aria-hidden="true" />
          <p>Orientación del flujo</p>
          <h2>{record.airflow}</h2>
        </article>
        <article>
          <CalendarClock aria-hidden="true" />
          <p>Intervalo de reemplazo</p>
          <h2>{record.replacementInterval}</h2>
        </article>
      </section>

      <section className="evidence-section">
        <div>
          <p className="eyebrow">EVIDENCIA DE COMPATIBILIDAD</p>
          <h2>Cada dato.<br />Con su fuente.</h2>
          <p>
            Cabin Filter Guide separa una coincidencia confirmada de catálogo de
            una recomendación general de producto. Cuando la versión, el mercado
            o la fecha de fabricación pueden cambiar la respuesta, la ficha lo
            dice antes de enviarte a un vendedor. Algunas fichas usan una
            segunda fuente para separar la compatibilidad de la pieza de las
            instrucciones de instalación.
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
                Ver la fuente original <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="caution-strip">
        <AlertTriangle aria-hidden="true" />
        <div>
          <p>Qué podría cambiar esta compatibilidad</p>
          <strong>{record.caution}</strong>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-section" aria-labelledby="related-title">
          <p className="eyebrow">MISMA REFERENCIA</p>
          <h2 id="related-title">Vehículos que comparten este filtro</h2>
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
          <p className="eyebrow">ENLACES DE COMPRA</p>
          <h2>Precisión antes que comisión.</h2>
        </div>
        <div className="commerce-status">
          <span>Estado de afiliados</span>
          <strong>No activados</strong>
          <p>
            Solo se añadirán enlaces de compra claramente identificados cuando
            el comercio confirme términos rastreables y la coincidencia del
            producto haya sido verificada de forma independiente.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
