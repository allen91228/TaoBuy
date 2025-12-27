// 假資料用於商品展示

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number // TWD
  image: string
  images: string[]
  category: string
  stock: number
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "無線藍牙耳機",
    slug: "wireless-bluetooth-earphones",
    description: "高品質無線藍牙耳機，支援降噪功能，長效續航 30 小時，完美音質體驗。",
    price: 1299,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
    ],
    category: "電子產品",
    stock: 50,
  },
  {
    id: "2",
    name: "智能手錶",
    slug: "smart-watch",
    description: "多功能智能手錶，健康監測、運動追蹤、通知提醒，全天候陪伴您的生活。",
    price: 3999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
    ],
    category: "電子產品",
    stock: 30,
  },
  {
    id: "3",
    name: "時尚背包",
    slug: "fashion-backpack",
    description: "簡約時尚的背包設計，大容量多隔層，適合日常通勤和旅行使用。",
    price: 899,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500",
    ],
    category: "服飾配件",
    stock: 80,
  },
  {
    id: "4",
    name: "咖啡機",
    slug: "coffee-machine",
    description: "全自動咖啡機，一鍵製作香濃咖啡，支援多種咖啡類型，輕鬆享受咖啡時光。",
    price: 5999,
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500",
    images: [
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500",
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500",
    ],
    category: "家電",
    stock: 15,
  },
  {
    id: "5",
    name: "運動鞋",
    slug: "sports-shoes",
    description: "專業運動鞋，舒適透氣，緩震科技，適合跑步和日常運動。",
    price: 2499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500",
    ],
    category: "服飾配件",
    stock: 60,
  },
  {
    id: "6",
    name: "筆記型電腦",
    slug: "laptop",
    description: "高效能筆記型電腦，輕薄便攜，適合工作和娛樂，長效電池續航。",
    price: 29999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500",
    ],
    category: "電子產品",
    stock: 25,
  },
  {
    id: "7",
    name: "藍牙喇叭",
    slug: "bluetooth-speaker",
    description: "360度環繞音效藍牙喇叭，防水設計，戶外室內都適用，震撼音質體驗。",
    price: 1899,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    ],
    category: "電子產品",
    stock: 40,
  },
  {
    id: "8",
    name: "休閒 T 恤",
    slug: "casual-t-shirt",
    description: "純棉舒適休閒 T 恤，多種顏色選擇，簡約百搭設計。",
    price: 399,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
    ],
    category: "服飾配件",
    stock: 100,
  },
]

// 根據 slug 獲取商品
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug)
}

// 根據 ID 獲取商品
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id)
}

