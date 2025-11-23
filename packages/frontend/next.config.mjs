/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add these to prevent chunk issues
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.externals.push(
      "pino-pretty", 
      "lokijs", 
      "encoding",
      "@react-native-async-storage/async-storage"
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    // Add this to prevent chunk path issues
    if (!config.isServer) {
      config.output.chunkFilename = 'static/chunks/[name].js';
    }
    return config;
  },
}

export default nextConfig