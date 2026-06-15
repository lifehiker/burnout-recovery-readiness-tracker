import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["bcryptjs"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/\\(dashboard\\)/:path*",
          destination: "/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
