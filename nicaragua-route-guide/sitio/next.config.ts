import type { NextConfig } from "next";

// Static export for GitHub Pages: the site is served under /nicaragua on the
// Proyectos-RJ-. Pages site. When a custom domain is connected, drop basePath
// and update SITE_URL in lib/site.ts.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Proyectos-RJ-./nicaragua",
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
