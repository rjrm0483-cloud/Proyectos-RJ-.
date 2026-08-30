"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteFooter } from "@/components/site-footer";
import { confidenceLabels, coverageLabels } from "@/lib/labels";
import type { Coverage, FilterRecord } from "@/data/filters";

const focusOptions: Array<{ value: "All" | Coverage; label: string }> = [
  { value: "All", label: "Todas" },
  { value: "Central America", label: "Centroamérica" },
  { value: "International", label: "Internacional" },
  { value: "EV / premium", label: "EV / premium" },
];

// Ignora acentos para que "electrico" encuentre "eléctrico"; compact quita
// separadores para que "CU17001" encuentre "CU 17 001".
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
        coverageLabels[record.focus],
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
        <Link href="/" className="brand-lockup" aria-label="Inicio de Cabin Filter Guide">
          <span className="brand-mark">CFG</span>
          <span>
            <strong>Cabin Filter Guide</strong>
            <small>verificado con fuentes</small>
          </span>
        </Link>
        <span className="header-note">Centroamérica + demanda global</span>
      </header>

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">DIRECTORIO DE FILTROS DE CABINA / 001</p>
          <h1>El filtro de cabina correcto. A la primera.</h1>
          <p className="hero-deck">
            Primero los vehículos de uso diario en Centroamérica, más los
            modelos internacionales que el mundo busca. Cada ficha conserva su
            fuente.
          </p>
        </div>

        <div className="search-panel">
          <label htmlFor="vehicle-search">Busca por año, marca, modelo o referencia</label>
          <div className="search-field">
            <Search aria-hidden="true" />
            <Input
              id="vehicle-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Prueba Suzuki Fronx o Toyota Hilux"
              autoComplete="off"
            />
          </div>
          <p>{filtered.length} referencia{filtered.length === 1 ? "" : "s"} verificada{filtered.length === 1 ? "" : "s"}</p>
        </div>
      </section>

      <section className="metric-rail" aria-label="Datos del directorio">
        <div><strong>{records.length}</strong><span>fichas publicadas</span></div>
        <div><strong>{centralAmericaCount}</strong><span>enfoque Centroamérica</span></div>
        <div><strong>100%</strong><span>con fuente enlazada</span></div>
        <div><strong>$0</strong><span>influencia pagada</span></div>
      </section>

      <section className="directory-section" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EL REGISTRO</p>
            <h2 id="directory-title">Compatibilidad verificada</h2>
          </div>
          <p>Cada ficha muestra su fuente, su nivel de confianza y la cautela exacta que podría cambiar la compatibilidad.</p>
        </div>

        <div className="focus-filters" aria-label="Filtrar por enfoque de mercado">
          {focusOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={focus === option.value ? "active" : ""}
              aria-pressed={focus === option.value}
              onClick={() => setFocus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="record-grid" aria-live="polite">
          {filtered.map((record) => (
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
                <div><dt>Referencia</dt><dd>{record.partReference}</dd></div>
                <div><dt>Configuración</dt><dd>{record.filterCount}</dd></div>
              </dl>
              <Link href={`/filters/${record.slug}`} className="record-link">
                Abrir ficha completa <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search aria-hidden="true" />
              <h3>Aún no hay una ficha verificada</h3>
              <p>Solo se publica cuando la respuesta puede enlazarse a una fuente primaria u OEM.</p>
            </div>
          )}
        </div>
      </section>

      <section className="method-section">
        <div className="method-stamp"><ShieldCheck aria-hidden="true" /><span>FUENTE<br />ANTES QUE<br />ESCALA</span></div>
        <div>
          <p className="eyebrow">MEZCLA EDITORIAL</p>
          <h2>Utilidad local. Demanda global.</h2>
          <p>
            El objetivo es 60% Centroamérica, 30% vehículos internacionales de
            alta demanda y 10% eléctricos o premium. Un Tesla puede ganar
            búsquedas globales sin desplazar al Fronx, al Hilux o al Yaris
            Cross.
          </p>
        </div>
        <ol className="source-order">
          <li><span>01</span>Guía de servicio del fabricante</li>
          <li><span>02</span>Catálogo de repuestos OEM</li>
          <li><span>03</span>Catálogo del fabricante del filtro</li>
          <li><span>04</span>Listado de vendedor, nunca solo</li>
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
