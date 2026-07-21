/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
    viewTransition: true,
  },
};

module.exports = nextConfig;
