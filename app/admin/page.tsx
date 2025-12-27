import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { ImportStatus, OrderStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

async function getStats() {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalUsers,
    totalSales,
    recentOrders,
    recentProducts,
  ] = await Promise.all([
    // 商品统计
    prisma.product.count(),
    prisma.product.count({ where: { importStatus: ImportStatus.PUBLISHED } }),
    prisma.product.count({ where: { importStatus: ImportStatus.DRAFT } }),
    
    // 订单统计
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
    prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    
    // 用户统计
    prisma.user.count(),
    
    // 销售额（已支付订单的总和）
    prisma.order.aggregate({
      where: {
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      _sum: {
        total: true,
      },
    }),
    
    // 最近订单（最近10个）
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    
    // 最近商品（最近10个）
    prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        importStatus: true,
        createdAt: true,
      },
    }),
  ])

  return {
    products: {
      total: totalProducts,
      published: publishedProducts,
      draft: draftProducts,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    users: {
      total: totalUsers,
    },
    sales: {
      total: totalSales._sum.total?.toString() || '0',
    },
    recentOrders,
    recentProducts,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const formatPrice = (price: string): string => {
    return `NT$ ${parseFloat(price).toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">儀表板</h1>
        <p className="text-muted-foreground">歡迎來到後台管理系統</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總商品數</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.total}</div>
            <p className="text-xs text-muted-foreground">
              已發布: {stats.products.published} | 草稿: {stats.products.draft}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總訂單數</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              待處理: {stats.orders.pending} | 處理中: {stats.orders.processing}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總銷售額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.sales.total)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 最近訂單和商品 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近訂單</CardTitle>
                <CardDescription>最新的10筆訂單</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">查看全部</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">尚無訂單</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.name || order.user?.email || '未知用戶'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(order.total.toString())}</p>
                      <p className="text-xs text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近商品</CardTitle>
                <CardDescription>最新添加的10個商品</CardDescription>
              </div>
              <Link href="/admin/products">
                <Button variant="outline" size="sm">查看全部</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">尚無商品</p>
              ) : (
                stats.recentProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.importStatus}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(product.price.toString())}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

