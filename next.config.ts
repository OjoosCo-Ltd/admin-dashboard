import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Stand-in portraits in the sample data (constants/*-sample.ts) until the API's signed URLs are wired.
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me", pathname: "/api/portraits/**" },
    ],
  },
  experimental: {
    // Phosphor's barrels re-export ~1,500 icons; lucide-react is optimized by default.
    optimizePackageImports: ["@phosphor-icons/react", "@phosphor-icons/react/ssr"],
  },
};

export default nextConfig;
