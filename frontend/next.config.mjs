/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Allow clean cross-origin resource communications if proxying is ever required */
  async rewrites() {
    return [];
  },
};

export default nextConfig;