"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
  price: number | string
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [itemsPerLoad, setItemsPerLoad] = useState(6) // 动态计算每次加载的数量
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // 根据屏幕宽度计算每次加载的商品数量
  const calculateItemsPerLoad = useCallback(() => {
    if (typeof window === 'undefined') return 6

    const width = window.innerWidth
    
    // 根据 Tailwind 断点计算列数
    let columns = 1 // 默认1列（移动端）
    if (width >= 1280) {
      columns = 4 // xl: 4列
    } else if (width >= 1024) {
      columns = 3 // lg: 3列
    } else if (width >= 640) {
      columns = 2 // sm: 2列
    }
    
    // 每次加载2-3行的商品，确保有足够的商品填充屏幕
    return columns * 2 // 2行商品
  }, [])

  // 监听窗口大小变化，更新每次加载的数量
  useEffect(() => {
    const updateItemsPerLoad = () => {
      setItemsPerLoad(calculateItemsPerLoad())
    }

    // 初始设置
    updateItemsPerLoad()

    // 监听窗口大小变化
    window.addEventListener('resize', updateItemsPerLoad)
    
    return () => {
      window.removeEventListener('resize', updateItemsPerLoad)
    }
  }, [calculateItemsPerLoad])

  // 初始加载商品（只在组件首次挂载时执行一次）
  useEffect(() => {
    let isMounted = true

    async function fetchProducts() {
      try {
        // 计算初始加载数量
        const initialLimit = typeof window !== 'undefined' 
          ? calculateItemsPerLoad() 
          : 6
        
        const response = await fetch(`/api/products?limit=${initialLimit}&offset=0`)
        const data = await response.json()
        
        if (data.success && isMounted) {
          setFeaturedProducts(data.products)
          setTotal(data.total || 0)
          setOffset(data.products.length)
          // 检查是否还有更多商品
          setHasMore(data.products.length < (data.total || 0))
        }
      } catch (err) {
        console.error('載入商品錯誤:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    // 确保在客户端执行
    if (typeof window !== 'undefined') {
      fetchProducts()
    }
    
    return () => {
      isMounted = false
    }
  }, [calculateItemsPerLoad]) // 依赖 calculateItemsPerLoad，但只在挂载时执行

  // 加载更多商品的函数
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || itemsPerLoad === 0) return

    setLoadingMore(true)
    try {
      const currentOffset = offset
      const limit = itemsPerLoad
      const response = await fetch(`/api/products?limit=${limit}&offset=${currentOffset}`)
      const data = await response.json()
      
      if (data.success && data.products.length > 0) {
        // 追加新商品到列表
        setFeaturedProducts(prev => {
          const newProducts = [...prev, ...data.products]
          // 检查是否还有更多商品
          setHasMore(newProducts.length < (total || 0))
          return newProducts
        })
        // 更新偏移量
        setOffset(prev => prev + data.products.length)
      } else {
        // 没有更多商品了
        setHasMore(false)
      }
    } catch (err) {
      console.error('載入更多商品錯誤:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, offset, total, itemsPerLoad])

  // Intersection Observer 检测滚动到底部
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreProducts()
        }
      },
      {
        rootMargin: '100px', // 提前100px开始加载
      }
    )
    
    // 观察底部触发器元素
    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current)
    }
    
    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current)
      }
      observer.disconnect()
    }
  }, [hasMore, loadingMore, loading, loadMoreProducts])

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
            看看新商品
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
          <>
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
            
            {/* 无限滚动触发器 */}
            <div ref={loadMoreTriggerRef} className="h-10" />
            
            {/* 加载状态提示 */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">載入更多商品...</p>
              </div>
            )}
            
            {/* 没有更多商品提示 */}
            {!hasMore && featuredProducts.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">沒有更多商品了</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

