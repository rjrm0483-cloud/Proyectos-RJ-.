import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description:
    "Affiliate disclosure for Nicaragua Route Guide: current status, labelling rules and why commission never affects a route.",
  alternates: { canonical: `${SITE_URL}/disclosure` },
};

export default function DisclosurePage() {
  return (
    <StaticPage headerNote="Disclosure" breadcrumb="Affiliate disclosure">
      <p className="eyebrow">AFFILIATE DISCLOSURE</p>
      <h1>Accuracy before commission.</h1>
      <p>
        <strong>Current status: there are no active affiliate links on this site.</strong>{" "}
        {SITE_NAME} earns nothing from any link, operator or recommendation it
        publishes today.
      </p>

      <h2>If affiliate links are added in the future</h2>
      <ul>
        <li>
          Every affiliate or referral link will be labelled as such where it
          appears, and will carry the sponsored link attribute.
        </li>
        <li>
          A link will be added only for services already named in the route on
          their own merits (a car rental desk at the airport, a transfer
          marketplace, an eSIM or insurance provider).
        </li>
        <li>
          Commission will never change what a route says about costs, timings,
          caveats or which option we recommend. Facts are checked first;
          booking links, if any, come after.
        </li>
        <li>This page will be updated before any program is activated.</li>
      </ul>

      <p>
        However you reach an operator, confirm the fare, the timetable and the
        pick-up point directly with them before you travel.
      </p>
    </StaticPage>
  );
}
