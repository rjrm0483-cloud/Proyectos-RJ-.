import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for Nicaragua Route Guide: what the site collects and what it does not.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <StaticPage headerNote="Privacy" breadcrumb="Privacy policy">
      <p className="eyebrow">PRIVACY POLICY</p>
      <h1>What this site knows about you.</h1>
      <p>Last updated: 3 September 2026.</p>

      <h2>What we collect</h2>
      <p>
        {SITE_NAME} requires no account, sets no tracking cookies of its own and
        asks for no personal information. The search box on the home page
        filters routes inside your browser; searches are not sent to or stored
        on our servers.
      </p>

      <h2>Hosting</h2>
      <p>
        The site is served from a third-party hosting platform, which may log
        standard technical data (such as IP address, browser type and pages
        requested) to operate and protect the service, as described in the
        provider&apos;s own privacy documentation.
      </p>

      <h2>External links</h2>
      <p>
        Routes link to airlines, bus lines, ports, government offices, operators
        and travel guides. Those sites have their own privacy policies; this
        policy does not cover them.
      </p>

      <h2>Advertising and analytics</h2>
      <p>
        There is no third-party advertising or analytics active on this site
        today. If advertising, analytics or affiliate programs are added, this
        policy will be updated first to describe exactly what changes, including
        any cookies or identifiers involved.
      </p>

      <h2>Changes</h2>
      <p>Material changes to this policy will appear on this page with a new last-updated date.</p>
    </StaticPage>
  );
}
