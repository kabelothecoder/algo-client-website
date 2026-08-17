import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Proof-of-payment screenshots and EA source archives move through
      // server actions; the 1 MB default rejects most phone screenshots.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
