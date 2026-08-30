import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Cabin Filter Guide: qué datos recopila el sitio y cuáles no.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage headerNote="Privacidad" breadcrumb="Política de privacidad">
      <p className="eyebrow">POLÍTICA DE PRIVACIDAD</p>
      <h1>Qué sabe este sitio de ti.</h1>
      <p>Última actualización: 30 de agosto de 2026.</p>

      <h2>Qué recopilamos</h2>
      <p>
        Cabin Filter Guide no requiere cuentas, no coloca cookies de rastreo
        propias y no pide información personal. El buscador de la portada
        filtra las fichas en tu navegador; las búsquedas no se envían ni se
        guardan en nuestros servidores.
      </p>

      <h2>Alojamiento</h2>
      <p>
        El sitio se sirve desde una plataforma de alojamiento de terceros, que
        puede registrar datos técnicos estándar (como dirección IP, tipo de
        navegador y páginas solicitadas) para operar y proteger el servicio,
        según la documentación de privacidad del propio proveedor.
      </p>

      <h2>Enlaces externos</h2>
      <p>
        Las fichas enlazan a guías de fabricantes, catálogos OEM y catálogos de
        fabricantes de filtros. Esos sitios tienen sus propias políticas de
        privacidad; esta política no los cubre.
      </p>

      <h2>Publicidad y analítica</h2>
      <p>
        Hoy no hay publicidad ni analítica de terceros activa en este sitio. Si
        en el futuro se añade publicidad, analítica o programas de afiliados,
        esta política se actualizará primero para describir exactamente qué
        cambia, incluidas las cookies o identificadores involucrados.
      </p>

      <h2>Cambios</h2>
      <p>
        Los cambios importantes de esta política se reflejarán en esta página
        con una nueva fecha de última actualización.
      </p>
    </StaticPage>
  );
}
