// import NextPWA from 'next-pwa';

// PWA configuration - disabled in development mode only
// To enable PWA, uncomment the following lines and remove the comment from the export line
// const withPWA = NextPWA({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
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

// If you want to enable PWA, replace this line with:
// export default withPWA(nextConfig);
export default nextConfig; 