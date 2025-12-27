"use client"

import { useEffect, useState } from "react"
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
  stock: number
  price: number | string
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 只取得最新的 6 個商品（已經按創建時間倒序）
        const response = await fetch('/api/products?limit=6')
        const data = await response.json()
        
        if (data.success) {
          setFeaturedProducts(data.products)
        }
      } catch (err) {
        console.error('載入商品錯誤:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  const formatPrice = (price: number | string): number => {
    if (typeof price === 'string') {
      return parseFloat(price)
    }
    return price
  }

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          歡迎來到淘買
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          現代化的全端電商平台，提供優質的購物體驗
        </p>
        <Link href="/products">
          <Button size="lg" className="text-lg px-8">
            瀏覽所有商品
          </Button>
        </Link>
      </div>

      {/* Featured Products Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">精選商品</h2>
          <Link href="/products">
            <Button variant="outline">查看全部</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">載入中...</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">目前沒有商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={index < 4}
                      loading={index < 4 ? undefined : 'lazy'}
                    />
                  </div>
                </Link>
                <CardHeader>
                  <Link href={`/products/${product.id}`}>
                    <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                  </Link>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      NT$ {formatPrice(product.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      庫存: {product.stock}
                    </span>
                  </div>
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
    </div>
  )
}

