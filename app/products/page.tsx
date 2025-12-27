"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  images: string[]
  category: string | null
  price: number | string // Prisma Decimal 在 JSON 中可能是字串
  createdAt: string
  updatedAt: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = searchQuery 
          ? `/api/products?search=${encodeURIComponent(searchQuery)}`
          : '/api/products'
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products)
          setTotal(data.total || 0)
        } else {
          setError('無法載入商品列表')
        }
      } catch (err) {
        console.error('載入商品錯誤:', err)
        setError('無法載入商品列表')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [searchQuery])

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

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {searchQuery ? `搜尋結果: "${searchQuery}"` : '商品列表'}
        </h1>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `找到 ${products.length} 個商品` 
            : `我們有 ${total} 種商品`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">目前沒有商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={index < 8}
                    loading={index < 8 ? undefined : 'lazy'}
                  />
                </div>
              </Link>
              <CardHeader>
                <Link href={`/products/${product.id}`}>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {removeMarkdown(product.name)}
                  </CardTitle>
                </Link>
                {product.description && (
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <span className="text-2xl font-bold text-primary">
                  NT$ {formatPrice(product.price).toLocaleString()}
                </span>
              </CardContent>
              <CardFooter>
                <Link href={`/products/${product.id}`} className="w-full">
                  <Button className="w-full">查看詳情</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}

