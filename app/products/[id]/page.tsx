"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import ReactMarkdown from "react-markdown"

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
          setSelectedImage(0) // 重置選中的圖片索引
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

  // 移除 markdown 格式（如粗体标记）
  const removeMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除 **粗体**
      .replace(/__(.*?)__/g, '$1') // 移除 __粗体__
      .replace(/\*(.*?)\*/g, '$1') // 移除 *斜体*
      .replace(/_(.*?)_/g, '$1') // 移除 _斜体_
      .replace(/~~(.*?)~~/g, '$1') // 移除 ~~删除线~~
      .replace(/`(.*?)`/g, '$1') // 移除 `代码`
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，只保留文本
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
    setQuantity(quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // 合併所有圖片：優先使用 images 陣列，如果 images 為空但 image 有值，則包含 image
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : []

  // 確保 selectedImage 不會超出範圍
  const currentImageIndex = Math.min(selectedImage, allImages.length - 1)
  const currentImage = allImages[currentImageIndex] || '/placeholder.jpg'

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 商品圖片區域 */}
        <div className="space-y-4">
          {/* 主圖 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* 縮圖 - 當有多張圖片時顯示 */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all bg-muted ${
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品資訊區域 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{removeMarkdown(product.name)}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                NT$ {formatPrice(product.price).toLocaleString()}
              </span>
            </div>
          </div>

          {product.description && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                className="text-muted-foreground"
                components={{
                  h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                  li: ({ ...props }) => <li className="ml-4" {...props} />,
                  strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                  em: ({ ...props }) => <em className="italic" {...props} />,
                  code: ({ inline, ...props }: any) => 
                    inline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                    ),
                  a: ({ ...props }: any) => (
                    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  img: ({ ...props }: any) => (
                    <img className="rounded-lg my-4 max-w-full" {...props} />
                  ),
                }}
              >
                {product.description}
              </ReactMarkdown>
            </div>
          )}

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
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 加入購物車按鈕 */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              加入購物車
            </Button>
          </div>

          {/* 商品詳情 */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">分類:</span>
              <span className="text-sm font-medium">{product.category || '未分類'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

