import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Cabin Filter Guide's privacy policy: what data the site does and does not collect.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage headerNote="Privacy" breadcrumb="Privacy policy">
      <p className="eyebrow">PRIVACY POLICY</p>
      <h1>What this site knows about you.</h1>
      <p>Last updated: 30 August 2026.</p>

      <h2>What we collect</h2>
      <p>
        Cabin Filter Guide does not require accounts, does not set its own
        tracking cookies, and does not ask for personal information. The search
        box on the home page filters records in your browser; queries are not
        sent to or stored on our servers.
      </p>

      <h2>Hosting</h2>
      <p>
        The site is served by a third-party hosting platform, which may log
        standard technical data (such as IP address, browser type, and pages
        requested) to operate and secure the service, as described in the
        host&apos;s own privacy documentation.
      </p>

      <h2>External links</h2>
      <p>
        Records link to manufacturer guides, OEM catalogs, and filter-maker
        catalogs. Those sites have their own privacy policies; this policy does
        not cover them.
      </p>

      <h2>Advertising and analytics</h2>
      <p>
        No advertising or third-party analytics are active on this site today.
        If advertising, analytics, or affiliate programs are added in the
        future, this policy will be updated first to describe exactly what
        changes, including any cookies or identifiers involved.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes to this policy will be reflected on this page with a
        new &quot;last updated&quot; date.
      </p>
    </StaticPage>
  );
}
