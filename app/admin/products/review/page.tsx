"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Search, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  price: any
  category: string | null
  importStatus: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  images: string[]
}

export default function ReviewProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: "DRAFT", // 只显示草稿状态的商品
      })
      if (search) params.append("search", search)

      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: 'include',
      })
      
      const data = await response.json()

      console.log('[REVIEW] API Response:', {
        success: data.success,
        hasData: !!data.data,
        dataLength: data.data?.length,
        pagination: data.pagination,
      })

      if (data.success) {
        setProducts(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalProducts(data.pagination?.total || 0)
      } else {
        console.error("獲取審核商品列表失敗:", data.error || data)
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
      }
    } catch (error) {
      console.error("獲取審核商品列表錯誤:", error)
      setProducts([])
      setTotalPages(1)
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchProducts()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const formatPrice = (price: any): string => {
    return `NT$ ${parseFloat(price.toString()).toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">審核商品</h1>
        <p className="text-muted-foreground">審核待發布的商品</p>
      </div>

      {/* 搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>搜尋</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋商品名稱或描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* 商品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>待審核商品列表</CardTitle>
          <CardDescription>
            共 {totalProducts} 個待審核商品
            {totalPages > 1 && `（第 ${page} 頁，每頁顯示 ${products.length} 個）`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無待審核商品</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">商品名稱</th>
                      <th className="text-left p-4">分類</th>
                      <th className="text-left p-4">價格</th>
                      <th className="text-left p-4">狀態</th>
                      <th className="text-left p-4">建立時間</th>
                      <th className="text-right p-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="p-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.slug}</div>
                        </td>
                        <td className="p-4">{product.category || "-"}</td>
                        <td className="p-4">{formatPrice(product.price)}</td>
                        <td className="p-4">
                          <StatusBadge status={product.importStatus} />
                        </td>
                        <td className="p-4">
                          {new Date(product.createdAt).toLocaleDateString("zh-TW")}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/products/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/review/${product.id}`}>
                              <Button variant="default" size="sm">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                審核
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一頁
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      第 {page} 頁，共 {totalPages} 頁
                    </span>
                    {totalPages > 5 && (
                      <select
                        value={page}
                        onChange={(e) => setPage(parseInt(e.target.value))}
                        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <option key={p} value={p}>
                            第 {p} 頁
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一頁
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

