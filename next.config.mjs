/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.cdn1.vip',
      },
      {
        protocol: 'https',
        hostname: 's41.ax1x.com',
      },
    ],
  },
};

export default nextConfig;
