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
      };
      
      // Exclude @mapbox/node-pre-gyp from client-side bundle
      config.externals = [...(config.externals || []), '@mapbox/node-pre-gyp'];
    }
    return config;
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
