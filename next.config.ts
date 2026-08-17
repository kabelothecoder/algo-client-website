import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only. Next blocks cross-origin requests to dev assets by default, so
  // opening the site from a phone on the same Wi-Fi shows a broken page
  // without this. Add your machine's LAN IP here if it changes.
  allowedDevOrigins: ["192.168.0.248", "localhost", "127.0.0.1"],
  experimental: {
    serverActions: {
      // Proof-of-payment screenshots and EA source archives move through
      // server actions; the 1 MB default rejects most phone screenshots.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
