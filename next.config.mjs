/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tencentyun.com',
      },
    ],
  },
};

export default nextConfig;
