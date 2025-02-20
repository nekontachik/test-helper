/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

module.exports = nextConfig;
