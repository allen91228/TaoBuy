import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiSecretAuth } from '@/lib/api-secret-auth'
import { ImportStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const currentId = searchParams.get('currentId') || ''

    // 获取下一个待审核商品（DRAFT 状态）
    // 如果提供了 currentId，则获取该商品之后的下一个
    const where: any = {
      importStatus: ImportStatus.DRAFT,
    }

    let nextProduct
    if (currentId) {
      // 获取当前商品，然后找到创建时间更早的下一个
      const currentProduct = await prisma.product.findUnique({
        where: { id: currentId },
        select: { createdAt: true },
      })

      if (currentProduct) {
        nextProduct = await prisma.product.findFirst({
          where: {
            ...where,
            createdAt: {
              lt: currentProduct.createdAt,
            },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
          },
        })
      }
    }

    // 如果没有找到，获取最早的一个
    if (!nextProduct) {
      nextProduct = await prisma.product.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: nextProduct,
    })
  } catch (error) {
    console.error('獲取下一個待審核商品錯誤:', error)
    return NextResponse.json(
      {
        error: '無法獲取下一個待審核商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

