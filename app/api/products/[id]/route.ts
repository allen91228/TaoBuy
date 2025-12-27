import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ImportStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// 根據 ID 獲取單個商品
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 從資料庫讀取商品，只取得已上架的商品
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        isActive: true,
        importStatus: ImportStatus.PUBLISHED,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        images: true,
        category: true,
        price: true,
        metadata: true, // 包含規格和變體數據
        createdAt: true,
        updatedAt: true,
      },
    })

    // 如果商品不存在或未發布，返回 404
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('獲取商品錯誤:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        error: '無法獲取商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}



