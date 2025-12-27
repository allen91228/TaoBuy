"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: 'include', // 确保发送 cookie
      })
      
      const data = await response.json()

      console.log('[PRODUCTS] API Response:', {
        success: data.success,
        hasData: !!data.data,
        dataLength: data.data?.length,
        pagination: data.pagination,
        status: response.status
      })

      if (data.success) {
        setProducts(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalProducts(data.pagination?.total || 0)
      } else {
        console.error("獲取商品列表失敗:", data.error || data)
        alert(data.error || "無法獲取商品列表")
        // 即使失败也重置状态
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
      }
    } catch (error) {
      console.error("獲取商品列表錯誤:", error)
      alert("無法連接到伺服器，請檢查網路連線")
      // 发生错误时重置状态
      setProducts([])
      setTotalPages(1)
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, statusFilter])

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

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: 'include', // 确保发送 cookie
      })

      const data = await response.json()

      if (data.success) {
        fetchProducts()
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } else {
        alert(data.error || "刪除失敗")
      }
    } catch (error) {
      console.error("刪除商品錯誤:", error)
      alert("刪除失敗")
    }
  }

  const formatPrice = (price: any): string => {
    return `NT$ ${parseFloat(price.toString()).toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品管理</h1>
          <p className="text-muted-foreground">管理所有商品</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增商品
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜尋與篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋商品名稱或描述..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">全部狀態</option>
              <option value="PUBLISHED">已發布</option>
              <option value="DRAFT">草稿</option>
              <option value="SYNC_ERROR">同步錯誤</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 商品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
          <CardDescription>
            共 {totalProducts} 個商品
            {totalPages > 1 && `（第 ${page} 頁，每頁顯示 ${products.length} 個）`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無商品</div>
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
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setProductToDelete(product.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="確認刪除"
        description="確定要刪除此商品嗎？此操作無法復原。"
        confirmText="刪除"
        cancelText="取消"
        variant="destructive"
        onConfirm={() => {
          if (productToDelete) {
            handleDelete(productToDelete)
          }
        }}
      />
    </div>
  )
}

