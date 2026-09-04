"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HeroArt } from "@/components/hero-art";
import { categoryLabels, confidenceLabels } from "@/lib/labels";
import { DestinationPhoto } from "@/components/destination-photo";
import type { DestinationImage } from "@/data/images";
import { categoryValues, type Category, type RouteRecord } from "@/data/routes";

const categoryOptions: Array<{ value: "All" | Category; label: string }> = [
  { value: "All", label: "All routes" },
  ...categoryValues.map((value) => ({ value, label: categoryLabels[value] })),
];

// Accent-insensitive so "leon" finds "León".
function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function RouteDirectory({
  records,
  images,
}: {
  records: RouteRecord[];
  images: Record<string, DestinationImage | null>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");

  const filtered = useMemo(() => {
    const needle = fold(query.trim());
    return records.filter((record) => {
      const matchesCategory = category === "All" || record.category === category;
      const haystack = [
        record.title,
        record.origin,
        record.destination,
        record.category,
        record.options.map((option) => option.mode).join(" "),
      ].join(" ");
      const matchesQuery = !needle || fold(haystack).includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, records]);

  const destinations = new Set(records.map((record) => record.destinationSlug)).size;
  const sources = new Set(records.flatMap((record) => record.sources.map((s) => s.url))).size;

  return (
    <main>
      <SiteHeader note="Airport, ferry, flight and border logistics" />

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Nicaragua · airport, lake, islands, borders</p>
          <h1>Getting around Nicaragua, with the numbers checked.</h1>
          <p className="hero-deck">
            Airport transfers, lake ferries, island flights and border crossings
            in Nicaragua, with real costs, timings and the caveat that could
            change them. Every figure links to its source.
          </p>
        </div>

        <div className="hero-side">
          <HeroArt />
          <div className="search-panel">
          <label htmlFor="route-search">Search by place, airport or transport mode</label>
          <div className="search-field">
            <Search aria-hidden="true" />
            <Input
              id="route-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Granada, Ometepe or shuttle"
              autoComplete="off"
            />
          </div>
          <p>{filtered.length} route{filtered.length === 1 ? "" : "s"} with sources</p>
          </div>
        </div>
      </section>

      <section className="metric-rail" aria-label="Directory facts">
        <div><strong>{records.length}</strong><span>routes published</span></div>
        <div><strong>{destinations}</strong><span>destinations covered</span></div>
        <div><strong>{sources}</strong><span>sources linked</span></div>
        <div><strong>$0</strong><span>paid placement</span></div>
      </section>

      <section className="directory-section" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The routes</p>
            <h2 id="directory-title">Routes with their sources</h2>
          </div>
          <p>Each route lists every realistic option, what it costs, how long it takes and the caveat that could change the answer.</p>
        </div>

        <div className="focus-filters" aria-label="Filter by route type">
          {categoryOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={category === option.value ? "active" : ""}
              aria-pressed={category === option.value}
              onClick={() => setCategory(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="record-grid" aria-live="polite">
          {filtered.map((record) => (
            <article className="record-card" key={record.slug}>
              {images[record.destinationSlug] && (
                <DestinationPhoto image={images[record.destinationSlug]!} variant="card" />
              )}
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
                <div><dt>Options</dt><dd>{record.options.length} compared</dd></div>
                <div><dt>Checked</dt><dd>{record.verifiedAt}</dd></div>
              </dl>
              <Link href={`/routes/${record.slug}`} className="record-link">
                Open the full route <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search aria-hidden="true" />
              <h3>No route with sources yet</h3>
              <p>A route is published only when its costs and timings can be linked to an operator or official source.</p>
            </div>
          )}
        </div>
      </section>

      <section className="method-section">
        <div className="method-stamp"><ShieldCheck aria-hidden="true" /><span>Source<br />before<br />scale</span></div>
        <div>
          <p className="eyebrow">How we choose</p>
          <h2>The trips people actually take.</h2>
          <p>
            Arrival logistics first (the airport to Granada, León, San Juan del
            Sur and the islands), then city-to-city legs and the land borders
            with Costa Rica and Honduras. Nothing is published without an
            operator, airline, port or government source.
          </p>
        </div>
        <ol className="source-order">
          <li><span>01</span>Airline, port, bus line or government tariff</li>
          <li><span>02</span>Transfer or shuttle operator&apos;s own published price</li>
          <li><span>03</span>Local hotel or island schedule board</li>
          <li><span>04</span>Route aggregator or traveler report, never alone</li>
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
