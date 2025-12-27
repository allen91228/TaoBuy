"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Search, Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: any
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("獲取訂單列表錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchOrders()
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
        <h1 className="text-3xl font-bold">訂單管理</h1>
        <p className="text-muted-foreground">管理所有訂單</p>
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
                  placeholder="搜尋訂單號、用戶名稱或郵箱..."
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
              <option value="PENDING">待處理</option>
              <option value="PROCESSING">處理中</option>
              <option value="SHIPPED">已出貨</option>
              <option value="DELIVERED">已送達</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card>
        <CardHeader>
          <CardTitle>訂單列表</CardTitle>
          <CardDescription>共 {orders.length} 筆訂單</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無訂單</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">訂單號</th>
                      <th className="text-left p-4">用戶</th>
                      <th className="text-left p-4">總金額</th>
                      <th className="text-left p-4">訂單狀態</th>
                      <th className="text-left p-4">支付狀態</th>
                      <th className="text-left p-4">建立時間</th>
                      <th className="text-right p-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-4 font-medium">{order.orderNumber}</td>
                        <td className="p-4">
                          <div>{order.user.name || "-"}</div>
                          <div className="text-sm text-muted-foreground">{order.user.email}</div>
                        </td>
                        <td className="p-4">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="p-4">
                          {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
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
                  <span className="text-sm text-muted-foreground">
                    第 {page} 頁，共 {totalPages} 頁
                  </span>
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

