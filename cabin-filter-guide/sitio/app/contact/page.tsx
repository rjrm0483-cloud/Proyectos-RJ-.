import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to report a fitment error or suggest a vehicle for Cabin Filter Guide.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <StaticPage headerNote="Contact" breadcrumb="Contact">
      <p className="eyebrow">CONTACT</p>
      <h1>Found an error? Tell us.</h1>
      <p>
        Corrections are the fastest way to make this directory better. If a
        record does not match your vehicle, or a source link is broken, we want
        to know — and the record will be re-verified against its sources.
      </p>

      <h2>What helps most in a report</h2>
      <ul>
        <li>The record page (year, make, model) you are reporting.</li>
        <li>Your vehicle&apos;s market and, if possible, engine or trim.</li>
        <li>What the record says versus what you found.</li>
      </ul>

      <h2>How to reach us</h2>
      <p>
        A public contact address for this site is being set up and will be
        published on this page. Until then, corrections gathered from public
        forums and manufacturer catalog updates are reviewed on a nightly
        schedule.
      </p>
      {/* TODO(Rodrigo): publish the approved public contact email here. */}
    </StaticPage>
  );
}
