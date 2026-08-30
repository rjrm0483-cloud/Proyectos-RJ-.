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
    name: `Directorio de compatibilidad de ${SITE_NAME}`,
    inLanguage: "es",
    numberOfItems: filterRecords.length,
    itemListElement: filterRecords.map((record, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Filtro de cabina ${record.make} ${record.model} ${record.year}`,
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
