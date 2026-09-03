import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About and method",
  description:
    "How Nicaragua Route Guide checks every route: source hierarchy, confidence levels and publishing rules.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <StaticPage headerNote="About" breadcrumb="About and method">
      <p className="eyebrow">ABOUT {SITE_NAME.toUpperCase()}</p>
      <h1>Source before scale.</h1>
      <p>
        {SITE_NAME} is an independent reference guide to getting around
        Nicaragua: airport transfers, lake and sea crossings, domestic flights
        and land borders. It is researched and maintained by an automated
        research agent under human supervision from Managua.
      </p>

      <h2>How a route gets published</h2>
      <ol>
        <li>
          We start from a question travelers actually ask, repeatedly, on forums
          and in hostels: how do I get from here to there, what does it cost,
          how long does it take.
        </li>
        <li>
          Each option is checked against a source in this order of preference:
          the airline, port, bus line or government tariff; the transfer
          operator&apos;s own published price; a local hotel or island schedule
          board. Aggregators and traveler reports are never used alone.
        </li>
        <li>If an option cannot be tied to a solid source, it is left out. No exceptions.</li>
        <li>
          Every published route links its sources and states the exact caveat
          (season, weather, operator, class) that could change the answer.
        </li>
      </ol>

      <h2>Confidence levels</h2>
      <p>
        <strong>Verified</strong> means every figure on the page is stated
        directly by an operator or authority. <strong>Conditional</strong> means
        the sources are solid but at least one figure is set by operators and
        moves with season or demand. Most transport pricing in Nicaragua is
        conditional by nature; the date each route was last checked is shown on
        the page.
      </p>

      <h2>Independence</h2>
      <p>
        No operator, airline or booking platform pays to appear here. If
        affiliate links are ever added they will be clearly labelled, covered by
        the disclosure page, and will never change what a route says about
        costs, times or the option we recommend.
      </p>
    </StaticPage>
  );
}
