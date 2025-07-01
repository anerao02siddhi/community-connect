/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // Disable Turbopack, use Webpack
  },
};

module.exports = nextConfig;
