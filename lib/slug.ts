// 生成 URL-friendly slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 移除特殊字符，保留中英文、數字和空格
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    // 將空格和連續的連字符替換為單個連字符
    .replace(/[\s-]+/g, '-')
    // 移除開頭和結尾的連字符
    .replace(/^-+|-+$/g, '')
    // 如果結果為空，使用時間戳
    || `product-${Date.now()}`
}

// 從淘寶 URL 提取商品 ID
// 淘寶 URL 格式範例: https://item.taobao.com/item.htm?id=123456789
// 或: https://detail.tmall.com/item.htm?id=123456789
export function extractExternalIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // 嘗試從 id 參數提取
    const id = urlObj.searchParams.get('id')
    if (id) {
      return id
    }
    
    // 如果沒有 id 參數，嘗試從路徑中提取
    // 例如: /item/123456789.htm
    const pathMatch = urlObj.pathname.match(/\/(\d+)\.html?$/)
    if (pathMatch) {
      return pathMatch[1]
    }
    
    // 如果都無法提取，返回 null（讓調用方決定如何處理）
    return null
  } catch (error) {
    return null
  }
}

