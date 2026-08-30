import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Divulgación de afiliados",
  description:
    "Divulgación de afiliados de Cabin Filter Guide: estado actual, reglas de identificación y por qué las comisiones nunca afectarán las fichas.",
  alternates: { canonical: `${SITE_URL}/disclosure` },
};

export default function DisclosurePage() {
  return (
    <StaticPage headerNote="Divulgación" breadcrumb="Divulgación de afiliados">
      <p className="eyebrow">DIVULGACIÓN DE AFILIADOS</p>
      <h1>Precisión antes que comisión.</h1>
      <p>
        <strong>Estado actual: no hay enlaces de afiliados activos en este sitio.</strong>{" "}
        Cabin Filter Guide no gana dinero por ningún enlace, producto o
        recomendación que publica.
      </p>

      <h2>Si en el futuro se añaden enlaces de afiliados</h2>
      <ul>
        <li>
          Todo enlace de afiliado o referido estará claramente identificado
          como tal en el lugar donde aparezca.
        </li>
        <li>
          Un enlace solo se añadirá después de verificar de forma independiente
          que el producto coincide con las fuentes de la ficha.
        </li>
        <li>
          Las comisiones nunca cambiarán lo que una ficha dice sobre
          compatibilidad, confianza o cautelas. Los datos se verifican primero;
          los enlaces de compra, si los hay, vienen después.
        </li>
        <li>Esta página se actualizará antes de activar cualquier programa.</li>
      </ul>

      <p>
        Sin importar cómo llegues a un vendedor, confirma siempre la
        compatibilidad con tu VIN, mercado y fecha de fabricación antes de
        comprar.
      </p>
    </StaticPage>
  );
}
