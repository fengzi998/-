/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出，用于 Docker 部署
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tencentyun.com',
      },
      {
        protocol: 'https',
        hostname: '**.cos.ap-guangzhou.myqcloud.com',
      },
    ],
  },
};

export default nextConfig;
