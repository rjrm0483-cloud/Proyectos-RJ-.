import type { NextConfig } from "next";

// STATIC_EXPORT=1 produce una exportación estática para GitHub Pages
// (npm run build:static). Sin la variable, la configuración queda vacía y
// aplica la compilación vinext del alojamiento original.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: "/Proyectos-RJ-./guia",
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
