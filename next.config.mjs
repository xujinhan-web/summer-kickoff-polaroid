/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.cdn1.vip',
      },
      {
        protocol: 'https',
        hostname: 's41.ax1x.com',
      },
      {
        protocol: 'https',
        hostname: 'free.picui.cn',
      },
    ],
  },
};

export default nextConfig;
