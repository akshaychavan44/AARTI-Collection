import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/profile/admin",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
