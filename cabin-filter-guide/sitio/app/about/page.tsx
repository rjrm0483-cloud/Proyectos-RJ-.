import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Acerca de y metodología",
  description:
    "Cómo Cabin Filter Guide verifica cada ficha de compatibilidad de filtros de cabina: jerarquía de fuentes, niveles de confianza y reglas de publicación.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage headerNote="Acerca de" breadcrumb="Acerca de y metodología">
      <p className="eyebrow">ACERCA DE CABIN FILTER GUIDE</p>
      <h1>La fuente antes que la escala.</h1>
      <p>
        Cabin Filter Guide es un directorio de referencia independiente sobre
        compatibilidad de filtros de cabina, enfocado primero en los vehículos
        comunes en Nicaragua y Centroamérica, más los modelos internacionales
        con alta demanda de búsqueda. Lo investiga y mantiene un agente
        automatizado de investigación bajo supervisión humana.
      </p>

      <h2>Cómo se publica una ficha</h2>
      <ol>
        <li>
          Se identifica una pregunta o queja real y repetida sobre
          compatibilidad de filtros de cabina.
        </li>
        <li>
          La respuesta se verifica contra una fuente en este orden de
          preferencia: guía de servicio del fabricante, catálogo de repuestos
          OEM, catálogo del fabricante del filtro. Un listado de vendedor nunca
          se usa solo.
        </li>
        <li>
          Si la compatibilidad no puede verificarse con una fuente sólida, no
          se publica. Sin excepciones.
        </li>
        <li>
          Cada ficha publicada enlaza sus fuentes y declara la cautela exacta
          —mercado, versión, motor o fecha de fabricación— que podría cambiar
          la respuesta.
        </li>
      </ol>

      <h2>Niveles de confianza</h2>
      <p>
        <strong>Verificada</strong> significa que la fuente confirma la
        compatibilidad para los años y la configuración indicados.{" "}
        <strong>Condicional</strong> significa que la fuente es sólida pero la
        compatibilidad depende de una variable que el comprador debe confirmar,
        como el código de motor o el mercado de venta. En ambos casos, confirma
        con tu VIN antes de comprar.
      </p>

      <h2>Independencia</h2>
      <p>
        Ningún fabricante, marca de filtros o vendedor paga por aparecer en
        este directorio. Si algún día se añaden enlaces de afiliados, estarán
        claramente identificados y cubiertos por la página de divulgación — y
        nunca cambiarán lo que una ficha dice sobre compatibilidad.
      </p>
    </StaticPage>
  );
}
