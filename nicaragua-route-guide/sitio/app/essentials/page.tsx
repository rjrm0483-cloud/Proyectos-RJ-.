import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { StaticPage } from "@/components/static-page";
import { getPartnerLinks } from "@/lib/monetizacion";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nicaragua travel essentials: entry fees, car rental rules, connectivity",
  description:
    "What to sort out before landing in Nicaragua: the US$10 tourist card, passport validity, car rental age and document rules, cash, eSIM and insurance, each with its source.",
  alternates: { canonical: `${SITE_URL}/essentials` },
};

const sources = [
  {
    label: "Visit Nicaragua (INTUR) — What you should know before traveling",
    url: "https://www.visitanicaragua.com/que-debes-saber-para-viajar-a-nicaragua/",
  },
  {
    label: "Ministerio del Interior — Entry requirements for visitors arriving by air",
    url: "https://www.migob.gob.ni/requisitos-de-ingreso-para-visitantes-de-otras-nacionalidades-via-aerea/",
  },
  {
    label: "Discover Cars — Car rental at Managua Airport (age, deposit, desk location)",
    url: "https://www.discovercars.com/nicaragua/managua/mga",
  },
  {
    label: "Things to do in Nicaragua — Car rental and driving guide (2026)",
    url: "https://thingstodoinnicaragua.com/transportation/car-rental/",
  },
  {
    label: "Banco de Costa Rica — Land exit tax (for onward travel to Costa Rica)",
    url: "https://www.bancobcr.com/wps/portal/bcr/bancobcr/personas/servicios_personas/punto_pais/pago_del_impuesto_de_salida/pago_impuesto_de_salida_terrestre",
  },
];

export default function EssentialsPage() {
  const links = [...getPartnerLinks("esim", "Nicaragua"), ...getPartnerLinks("insurance", "Nicaragua"), ...getPartnerLinks("cars", "Managua")];

  return (
    <StaticPage headerNote="Essentials" breadcrumb="Nicaragua travel essentials">
      <p className="eyebrow">BEFORE YOU LAND</p>
      <h1>The five things to sort before Nicaragua.</h1>
      <p>Checked 3 September 2026 against the sources listed at the end of this page.</p>

      <h2>1. Entry: passport and the US$10 tourist card</h2>
      <ul>
        <li>Your passport must be valid for more than six months on arrival.</li>
        <li>
          Every foreign visitor pays a US$10 tourist card at immigration (air or
          land), in cash. Citizens of the CA-4 countries (Guatemala, El Salvador,
          Honduras, Nicaragua) are exempt.
        </li>
        <li>
          Some nationalities need a visa in advance; check the Ministerio del
          Interior list for yours. A yellow-fever certificate is required only if
          you arrive from a country on the WHO risk list.
        </li>
      </ul>

      <h2>2. Cash</h2>
      <p>
        Small US dollar bills are accepted almost everywhere for transport and
        fees and are the practical currency for border charges, pangas and
        ferries. Córdobas are better for buses, taxis and markets. Airport ATMs
        dispense both; tell your bank you are traveling.
      </p>

      <h2>3. Renting a car</h2>
      <ul>
        <li>
          Rental desks sit in the arrivals hall at Managua airport. Comparison
          pricing starts around US$24 a day plus a credit-card deposit taken at
          pick-up.
        </li>
        <li>
          Companies generally set 25 as the minimum age; some accept 21–24 with a
          young-driver surcharge.
        </li>
        <li>
          A foreign licence in the Roman alphabet is accepted for up to 90 days.
          Carry passport, licence, registration and proof of insurance at all
          times; third-party liability is mandatory and included in the base
          rate.
        </li>
        <li>
          Rental cars normally cannot cross into Costa Rica or Honduras; plan a
          drop-off and a new rental on the other side.
        </li>
      </ul>

      <h2>4. Staying connected</h2>
      <p>
        An eSIM installed before departure means maps and messaging work from
        the moment you land, which matters when a driver is waiting in arrivals.
        Local SIMs from Claro and Tigo are cheap alternatives sold in Managua and
        most towns.
      </p>

      <h2>5. Travel medical insurance</h2>
      <p>
        Private clinics in Managua expect payment up front and island evacuation
        is by air. Carry a policy that covers medical care and evacuation, and
        note the surfing and volcano-boarding exclusions in the wording.
      </p>

      {links.length > 0 ? (
        <>
          <h2>Book the essentials · Affiliate links</h2>
          <ul>
            {links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer sponsored">
                  {link.etiqueta} <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p>We earn a commission if you buy through these links, at no extra cost to you.</p>
        </>
      ) : (
        <p>
          <strong>Affiliate status: not active.</strong> No booking links are
          shown on this page yet; buy eSIMs, insurance and car rental directly
          from providers you trust.
        </p>
      )}

      <h2>Sources</h2>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
          </li>
        ))}
      </ul>
    </StaticPage>
  );
}
