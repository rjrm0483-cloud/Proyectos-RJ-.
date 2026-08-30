import type { Metadata } from "next";
import { FilterDirectory } from "@/components/filter-directory";
import { filterRecords } from "@/data/filters";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} fitment directory`,
    numberOfItems: filterRecords.length,
    itemListElement: filterRecords.map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${record.year} ${record.make} ${record.model} cabin air filter`,
      url: `${SITE_URL}/filters/${record.slug}`,
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
      <FilterDirectory records={filterRecords} />
    </>
  );
}
