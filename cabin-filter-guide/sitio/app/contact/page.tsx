import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cómo reportar un error de compatibilidad o sugerir un vehículo para Cabin Filter Guide.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <StaticPage headerNote="Contacto" breadcrumb="Contacto">
      <p className="eyebrow">CONTACTO</p>
      <h1>¿Encontraste un error? Cuéntanos.</h1>
      <p>
        Las correcciones son la vía más rápida para mejorar este directorio. Si
        una ficha no coincide con tu vehículo, o un enlace a una fuente está
        roto, queremos saberlo — y la ficha se volverá a verificar contra sus
        fuentes.
      </p>

      <h2>Qué ayuda más en un reporte</h2>
      <ul>
        <li>La ficha (año, marca, modelo) que estás reportando.</li>
        <li>El mercado de tu vehículo y, si es posible, el motor o la versión.</li>
        <li>Qué dice la ficha y qué encontraste tú.</li>
      </ul>

      <h2>Cómo escribirnos</h2>
      <p>
        La dirección pública de contacto de este sitio está en proceso de
        configurarse y se publicará en esta página. Mientras tanto, las
        correcciones detectadas en foros públicos y en actualizaciones de los
        catálogos de fabricantes se revisan en un ciclo nocturno.
      </p>
      {/* TODO(Rodrigo): publicar aquí el correo de contacto aprobado. */}
    </StaticPage>
  );
}
