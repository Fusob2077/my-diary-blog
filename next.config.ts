import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 生产环境优化
  output: 'standalone', // 启用独立输出模式，适合服务器部署
};

export default nextConfig;
