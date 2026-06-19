/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: true,
  serverExternalPackages: ["@electric-sql/pglite"],
  // Premium dataset files live in /datasets (outside public/) and are read by
  // the /api/dataset route via fs. They are not imported, so Next's file
  // tracing won't bundle them into the function unless we include them here.
  outputFileTracingIncludes: {
    "/api/dataset/[company]/[variant]": ["./datasets/**"],
  },
};
export default nextConfig;
