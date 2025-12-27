// 生成自訂格式的唯一商品ID
// 格式：PROD-YYYYMMDD-XXX (例如：PROD-20241227-001)

export function generateProductId(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
  
  // 使用時間戳的最後6位數作為唯一性保證
  const timestamp = Date.now().toString()
  const uniquePart = timestamp.slice(-6) // 取最後6位
  
  return `PROD-${dateStr}-${uniquePart}`
}

// 解析商品ID（如果需要）
export function parseProductId(productId: string): {
  date: string
  uniquePart: string
} | null {
  const match = productId.match(/^PROD-(\d{8})-(\d+)$/)
  if (!match) return null
  
  return {
    date: match[1], // YYYYMMDD
    uniquePart: match[2],
  }
}



