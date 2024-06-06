/** @type {import('next').NextConfig} */
const nextConfig = {
  // すべてのAPIルートのタイムアウトを5分に設定
  api: {
    timeout: 300,
  },
};

export default nextConfig;
