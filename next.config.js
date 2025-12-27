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
  // 配置圖片域名：允許外部圖片（淘寶等）
  // 注意：Next.js 13+ 不支持 hostname: '**' 通配符
  // 使用 unoptimized 在開發環境中以允許所有外部圖片
  images: {
    unoptimized: true, // 禁用圖片優化以允許所有外部圖片
  },
}

module.exports = nextConfig

