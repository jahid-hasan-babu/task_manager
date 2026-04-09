/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  // Optimize heavy package imports — reduces initial JS parse time significantly
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'lucide-react/dist/esm/icons'],
  },
  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
