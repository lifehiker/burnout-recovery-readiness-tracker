import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/\\(dashboard\\)/:path*",
          destination: "/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
