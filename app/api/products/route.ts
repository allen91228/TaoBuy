import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 獲取商品列表 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // 從資料庫讀取商品，只取得已上架的商品（isActive: true），按創建時間倒序排列
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        importStatus: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc', // 最新商品在最前面
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        images: true,
        category: true,
        stock: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    // 取得總數（用於分頁）
    const total = await prisma.product.count({
      where: {
        isActive: true,
        importStatus: 'PUBLISHED',
      },
    })
    
    return NextResponse.json({
      success: true,
      products,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('獲取商品列表錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取商品列表' },
      { status: 500 }
    )
  }
}


