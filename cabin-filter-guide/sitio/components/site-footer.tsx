import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-copy">
        <p>Cabin Filter Guide es un directorio de referencia independiente.</p>
        <p>
          Si algún día se añaden enlaces de afiliados, estarán claramente
          identificados. Confirma siempre la compatibilidad con tu VIN, mercado
          y fecha de fabricación antes de comprar.
        </p>
      </div>
      <nav className="footer-nav" aria-label="Páginas del sitio">
        <Link href="/about">Acerca de y metodología</Link>
        <Link href="/disclosure">Divulgación de afiliados</Link>
        <Link href="/privacy">Política de privacidad</Link>
        <Link href="/contact">Contacto</Link>
      </nav>
    </footer>
  );
}
