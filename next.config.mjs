// import NextPWA from 'next-pwa';

// PWA is disabled
// const withPWA = NextPWA({
//   dest: 'public',
//   disable: true,
//   register: false,
//   skipWaiting: true,
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-image-domain.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        worker_threads: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pino-pretty', 'thread-stream'],
  },
};

export default nextConfig; 