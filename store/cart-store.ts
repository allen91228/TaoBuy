import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // 商品 ID
  name: string
  price: number
  image?: string
  quantity: number
  variantId?: string // 變體 ID（可選）
  specifications?: Record<string, string> // 選擇的規格組合（可選）
}

// 辅助函数：生成购物车项目的唯一标识
const getItemKey = (item: CartItem): string => {
  const specKey = item.specifications 
    ? JSON.stringify(item.specifications) 
    : item.variantId || ''
  return `${item.id}:${specKey}`
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (item: CartItem) => void // 改为接受完整 item
  updateQuantity: (item: CartItem, quantity: number) => void // 改为接受完整 item
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const itemKey = getItemKey(item as CartItem)
        const existingItem = items.find((i) => getItemKey(i) === itemKey)
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              getItemKey(i) === itemKey
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          })
        }
      },
      
      removeItem: (item) => {
        const itemKey = getItemKey(item)
        set({
          items: get().items.filter((i) => getItemKey(i) !== itemKey),
        })
      },
      
      updateQuantity: (item, quantity) => {
        if (quantity <= 0) {
          get().removeItem(item)
          return
        }
        
        const itemKey = getItemKey(item)
        set({
          items: get().items.map((i) =>
            getItemKey(i) === itemKey ? { ...i, quantity } : i
          ),
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

