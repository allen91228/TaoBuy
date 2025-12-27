import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiSecretAuth } from '@/lib/api-secret-auth'
import { ImportStatus, OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 检查 API_SECRET 认证
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    // 获取统计数据
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

    return NextResponse.json({
      success: true,
      stats: {
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
      },
    })
  } catch (error) {
    console.error('獲取統計數據錯誤:', error)
    return NextResponse.json(
      {
        error: '無法獲取統計數據',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

