import type { Metadata } from "next";
import { RouteDirectory } from "@/components/route-directory";
import { routeRecords } from "@/data/routes";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} route directory`,
    inLanguage: "en",
    numberOfItems: routeRecords.length,
    itemListElement: routeRecords.map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: record.title,
      url: `${SITE_URL}/routes/${record.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <RouteDirectory records={routeRecords} />
    </>
  );
}
