/** @type {import('next').NextConfig} */
// Note on `output: 'export'`:
//   TRD section 10 calls for static export for Cloudflare Pages. The TRD also
//   mandates POST route handlers at app/api/grade-briefing and app/api/save-certificate.
//   Next.js 14 cannot statically export non-GET route handlers, so we keep the
//   default Next.js output mode and deploy via @cloudflare/next-on-pages (or Vercel).
//   This is documented in CLAUDE.md.
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    // PGlite ships a large WASM binary; let it stay external on the server.
    serverComponentsExternalPackages: ["@electric-sql/pglite"],
  },
};

export default nextConfig;
