import { getUniqueDestinationSlugs, routeRecords } from "@/data/routes";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const lastModified = routeRecords.reduce(
    (latest, record) => (record.verifiedAt > latest ? record.verifiedAt : latest),
    "2026-09-03",
  );
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: lastModified, priority: "1.0" },
    ...routeRecords.map((record) => ({
      loc: `${SITE_URL}/routes/${record.slug}`,
      lastmod: record.verifiedAt,
      priority: "0.8",
    })),
    ...getUniqueDestinationSlugs().map((place) => ({
      loc: `${SITE_URL}/places/${place}`,
      lastmod: lastModified,
      priority: "0.7",
    })),
    { loc: `${SITE_URL}/essentials`, lastmod: lastModified, priority: "0.7" },
    ...["about", "disclosure", "privacy", "contact"].map((page) => ({
      loc: `${SITE_URL}/${page}`,
      lastmod: lastModified,
      priority: "0.5",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
