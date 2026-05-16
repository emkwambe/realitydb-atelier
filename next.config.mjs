/** @type {import("next").NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  serverExternalPackages: ["@electric-sql/pglite"],
};
export default nextConfig;