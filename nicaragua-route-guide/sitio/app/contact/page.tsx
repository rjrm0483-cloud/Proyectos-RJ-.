import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to report an outdated fare or timetable, or suggest a route, for Nicaragua Route Guide.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <StaticPage headerNote="Contact" breadcrumb="Contact">
      <p className="eyebrow">CONTACT</p>
      <h1>Found a price that changed? Tell us.</h1>
      <p>
        Corrections are the fastest way this guide improves. If a fare, a
        departure time or a fee on a route no longer matches what you were
        charged, or a source link is dead, we want to know, and the route will
        be re-checked against its sources.
      </p>

      <h2>What helps most in a report</h2>
      <ul>
        <li>The route you are reporting and the date you traveled.</li>
        <li>The operator you used and what you actually paid.</li>
        <li>What the route says and what you found instead.</li>
      </ul>

      <h2>How to reach us</h2>
      <p>
        The public contact address for this site is being set up and will be
        published on this page. Meanwhile, corrections spotted in public forums
        and on operators&apos; own pages are reviewed in a nightly cycle.
      </p>
      {/* TODO(Rodrigo): publicar aquí el correo de contacto aprobado. */}
    </StaticPage>
  );
}
