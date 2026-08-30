import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description:
    "Cabin Filter Guide's affiliate disclosure: current status, labeling rules, and how commissions will never affect fitment records.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <StaticPage headerNote="Disclosure" breadcrumb="Affiliate disclosure">
      <p className="eyebrow">AFFILIATE DISCLOSURE</p>
      <h1>Accuracy before commission.</h1>
      <p>
        <strong>Current status: no affiliate links are active on this site.</strong>{" "}
        Cabin Filter Guide currently earns no money from any link, product, or
        recommendation it publishes.
      </p>

      <h2>If affiliate links are added later</h2>
      <ul>
        <li>
          Every affiliate or referral link will be clearly labeled as such where
          it appears.
        </li>
        <li>
          A link will only be added after the product match has been
          independently verified against the record&apos;s sources.
        </li>
        <li>
          Commissions will never change what a record says about fitment,
          confidence, or caveats. Fitment data is verified first; buying links,
          if any, come after.
        </li>
        <li>This page will be updated before any program goes live.</li>
      </ul>

      <p>
        Regardless of how you reach a seller, always confirm fitment for your
        VIN, market, and build date before purchase.
      </p>
    </StaticPage>
  );
}
