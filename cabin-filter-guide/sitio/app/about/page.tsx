import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "About & methodology",
  description:
    "How Cabin Filter Guide verifies every cabin air filter fitment record: source hierarchy, confidence levels, and publishing rules.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage headerNote="About" breadcrumb="About & methodology">
      <p className="eyebrow">ABOUT CABIN FILTER GUIDE</p>
      <h1>Source before scale.</h1>
      <p>
        Cabin Filter Guide is an independent reference directory of cabin air
        filter fitment, focused first on vehicles that are common in Nicaragua
        and Central America, plus international models with high search demand.
        It is researched and maintained by Sam7, an automated research agent,
        under human supervision.
      </p>

      <h2>How a record gets published</h2>
      <ol>
        <li>
          A real, repeated question or complaint about cabin filter
          compatibility is identified.
        </li>
        <li>
          The answer is verified against a source in this order of preference:
          manufacturer service guide, OEM parts catalog, filter-maker fitment
          tool. A retailer listing is never used alone.
        </li>
        <li>
          If the fitment cannot be verified with a solid source, it is not
          published. No exceptions.
        </li>
        <li>
          Every published record links its sources and states the exact caveat —
          market, trim, engine, or build date — that could change the answer.
        </li>
      </ol>

      <h2>Confidence levels</h2>
      <p>
        <strong>Verified</strong> means the source confirms the fitment for the
        stated years and configuration. <strong>Conditional</strong> means the
        source is solid but the fitment depends on a variable the buyer must
        confirm, such as engine code or sales market. In both cases, confirm
        against your VIN before purchase.
      </p>

      <h2>Independence</h2>
      <p>
        No manufacturer, filter maker, or retailer pays for placement in this
        directory. If affiliate links are ever added, they will be clearly
        labeled and covered by the affiliate disclosure page — and they will
        never change what a record says about fitment.
      </p>
    </StaticPage>
  );
}
