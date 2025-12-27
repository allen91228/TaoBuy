import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ImportStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// 獲取商品列表 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    
    // 定義查詢條件
    const whereCondition: any = {
      isActive: true,
      importStatus: ImportStatus.PUBLISHED, // 使用 enum 而不是字符串
    }

    // 如果有搜尋關鍵字，添加搜尋條件（搜尋商品名稱和描述）
    if (search.trim()) {
      whereCondition.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }
    
    // 記錄查詢條件（用於調試）
    console.log('查詢商品條件:', {
      ...whereCondition,
      limit,
      offset,
    })
    
    // 從資料庫讀取商品，只取得已上架的商品（isActive: true），按創建時間倒序排列
    const products = await prisma.product.findMany({
      where: whereCondition,
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
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    // 記錄查詢結果（用於調試）
    console.log('查詢結果:', {
      count: products.length,
      productIds: products.map(p => p.id),
      productNames: products.map(p => p.name),
    })
    
    // 取得總數（用於分頁）
    const total = await prisma.product.count({
      where: whereCondition,
    })
    
    console.log('商品總數:', total)
    
    return NextResponse.json({
      success: true,
      products,
      total,
      limit,
      offset,
    })
  } catch (error) {
    // 詳細的錯誤記錄
    console.error('獲取商品列表錯誤:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: '無法獲取商品列表',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}



