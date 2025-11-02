/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.appDir - it's default in Next.js 14
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/api',
  },
  webpack: (config, { isServer, webpack }) => {
    // Fix for Babylon.js on server-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    // Handle Babylon.js modules
    config.module.rules.push({
      test: /\.(glb|gltf|obj|fbx|stl|babylon)$/,
      type: 'asset/resource',
    })

    // Ignore Babylon.js on server-side
    if (isServer) {
      config.externals = [...(config.externals || []), '@babylonjs/core', '@babylonjs/loaders']
    }

    return config
  },
  // Transpile Babylon.js packages for client-side only
  transpilePackages: ['@babylonjs/core', '@babylonjs/loaders'],
}

module.exports = nextConfig