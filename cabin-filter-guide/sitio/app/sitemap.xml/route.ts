import { filterRecords, getUniquePartSlugs } from "@/data/filters";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const lastModified = filterRecords.reduce(
    (latest, record) => (record.verifiedAt > latest ? record.verifiedAt : latest),
    "2026-08-30",
  );
  const urls = [
    { loc: origin, lastmod: lastModified, priority: "1.0" },
    ...filterRecords.map((record) => ({
      loc: `${origin}/filters/${record.slug}`,
      lastmod: record.verifiedAt,
      priority: "0.8",
    })),
    ...getUniquePartSlugs().map((ref) => ({
      loc: `${origin}/parts/${ref}`,
      lastmod: lastModified,
      priority: "0.7",
    })),
    ...["about", "disclosure", "privacy", "contact"].map((page) => ({
      loc: `${origin}/${page}`,
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
