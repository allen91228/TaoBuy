/** @type {import('next').NextConfig} */
const nextConfig = {
  // 跳過 build 時的類型檢查（可選，如果需要加速 build）
  typescript: {
    // 警告：這會跳過類型檢查，建議保留類型檢查
    // ignoreBuildErrors: false,
  },
  // 確保 API routes 在 build 時不會被預渲染
  experimental: {
    // 確保 API routes 是動態的
  },
}

module.exports = nextConfig

