"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteFooter } from "@/components/site-footer";
import type { Coverage, FilterRecord } from "@/data/filters";

const focusOptions: Array<"All" | Coverage> = [
  "All",
  "Central America",
  "International",
  "EV / premium",
];

// Fold accents so "eléctrico" matches "electrico"; compact strips separators
// so "CU17001" still finds "CU 17 001".
function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compact(value: string) {
  return fold(value).replace(/[^a-z0-9]/g, "");
}

export function FilterDirectory({ records }: { records: FilterRecord[] }) {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<"All" | Coverage>("All");

  const filtered = useMemo(() => {
    const needle = fold(query.trim());
    const compactNeedle = compact(query);
    return records.filter((record) => {
      const matchesFocus = focus === "All" || record.focus === focus;
      const haystack = [
        record.year,
        record.make,
        record.model,
        record.partReference,
        record.market,
        record.focus,
      ].join(" ");
      const matchesQuery =
        !needle ||
        fold(haystack).includes(needle) ||
        (compactNeedle.length > 0 && compact(haystack).includes(compactNeedle));
      return matchesFocus && matchesQuery;
    });
  }, [focus, query, records]);

  const centralAmericaCount = records.filter(
    (record) => record.focus === "Central America",
  ).length;

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="Cabin Filter Guide home">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verified by Sam7</small>
          </span>
        </Link>
        <span className="header-note">Central America + global demand</span>
      </header>

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">CABIN FILTER FITMENT DIRECTORY / 001</p>
          <h1>The right cabin filter. First try.</h1>
          <p className="hero-deck">
            Everyday vehicles in Central America first, plus international
            models people search for at scale. Every fitment keeps its source.
          </p>
        </div>

        <div className="search-panel">
          <label htmlFor="vehicle-search">Search year, make, model, or part reference</label>
          <div className="search-field">
            <Search aria-hidden="true" />
            <Input
              id="vehicle-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Suzuki Fronx or Toyota Hilux"
              autoComplete="off"
            />
          </div>
          <p>{filtered.length} verified reference{filtered.length === 1 ? "" : "s"}</p>
        </div>
      </section>

      <section className="metric-rail" aria-label="Directory facts">
        <div><strong>{records.length}</strong><span>fitment pages</span></div>
        <div><strong>{centralAmericaCount}</strong><span>Central America focus</span></div>
        <div><strong>100%</strong><span>source-linked</span></div>
        <div><strong>$0</strong><span>paid influence</span></div>
      </section>

      <section className="directory-section" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE LEDGER</p>
            <h2 id="directory-title">Verified fitment</h2>
          </div>
          <p>Every page shows its source, confidence, and the exact caveat that could change fitment.</p>
        </div>

        <div className="focus-filters" aria-label="Filter by market focus">
          {focusOptions.map((option) => (
            <button
              type="button"
              key={option}
              className={focus === option ? "active" : ""}
              aria-pressed={focus === option}
              onClick={() => setFocus(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="record-grid" aria-live="polite">
          {filtered.map((record) => (
            <article className="record-card" key={record.slug}>
              <div className="record-topline">
                <Badge className={record.confidence === "Verified" ? "status-badge" : "status-badge conditional"}>
                  <CheckCircle2 aria-hidden="true" /> {record.confidence}
                </Badge>
                <span>{record.sources[0].type}</span>
              </div>
              <p className="record-focus">{record.focus}</p>
              <p className="record-year">{record.year}</p>
              <h3>{record.make} {record.model}</h3>
              <dl>
                <div><dt>Part reference</dt><dd>{record.partReference}</dd></div>
                <div><dt>Configuration</dt><dd>{record.filterCount}</dd></div>
              </dl>
              <Link href={`/filters/${record.slug}`} className="record-link">
                Open fitment record <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search aria-hidden="true" />
              <h3>No verified page yet</h3>
              <p>Sam7 only publishes after it can attach a primary or OEM source.</p>
            </div>
          )}
        </div>
      </section>

      <section className="method-section">
        <div className="method-stamp"><ShieldCheck aria-hidden="true" /><span>SOURCE<br />BEFORE<br />SCALE</span></div>
        <div>
          <p className="eyebrow">SAM7’S PUBLISHING MIX</p>
          <h2>Local usefulness. Global search demand.</h2>
          <p>
            Sam7 aims for 60% Central America, 30% international high-demand
            vehicles, and 10% EV or premium models. A Tesla can earn global
            searches without crowding out the Fronx, Hilux, or Yaris Cross.
          </p>
        </div>
        <ol className="source-order">
          <li><span>01</span>Manufacturer service guide</li>
          <li><span>02</span>OEM parts catalog</li>
          <li><span>03</span>Filter-maker fitment tool</li>
          <li><span>04</span>Retailer listing, never alone</li>
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
