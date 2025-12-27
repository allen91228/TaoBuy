"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { ShoppingCart, Plus, Minus } from "lucide-react"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  images: string[]
  category: string | null
  stock: number
  price: number | string
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()

        if (data.success && data.product) {
          setProduct(data.product)
        } else {
          setError('商品不存在')
        }
      } catch (err) {
        console.error('載入商品錯誤:', err)
        setError('無法載入商品')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    notFound()
  }

  const formatPrice = (price: number | string): number => {
    if (typeof price === 'string') {
      return parseFloat(price)
    }
    return price
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      image: product.image || '',
      quantity,
    })
    
    // 顯示提示（可以之後改用 toast）
    alert(`已將 ${product.name} x${quantity} 加入購物車！`)
  }

  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 商品圖片區域 */}
        <div className="space-y-4">
          {/* 主圖 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <Image
              src={product.images[selectedImage] || product.image || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* 縮圖 */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品資訊區域 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                NT$ {formatPrice(product.price).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                庫存: {product.stock} 件
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            {/* 數量選擇 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">數量:</span>
              <div className="flex items-center gap-2 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 加入購物車按鈕 */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock > 0 ? "加入購物車" : "已售完"}
            </Button>

            {product.stock === 0 && (
              <p className="text-sm text-destructive text-center">
                此商品目前缺貨
              </p>
            )}
          </div>

          {/* 商品詳情 */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">分類:</span>
              <span className="text-sm font-medium">{product.category || '未分類'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">商品編號:</span>
              <span className="text-sm font-medium">{product.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

