import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiSecretAuth } from '@/lib/api-secret-auth'
import { ImportStatus, Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    // 调试日志：检查 metadata 结构
    console.log('[API] Product metadata:', product.metadata)
    console.log('[API] Metadata type:', typeof product.metadata)
    if (product.metadata && typeof product.metadata === 'object') {
      console.log('[API] Metadata keys:', Object.keys(product.metadata))
      console.log('[API] Has variants?', 'variants' in product.metadata)
      console.log('[API] Variants:', (product.metadata as any)?.variants)
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('獲取商品錯誤:', error)
    return NextResponse.json(
      {
        error: '無法獲取商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    // 如果更新 slug，检查是否与其他商品冲突
    if (body.slug && body.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: '商品 slug 已存在' },
          { status: 409 }
        )
      }
    }

    // 更新商品
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        images: body.images,
        category: body.category,
        price: body.price,
        originalPrice: body.originalPrice,
        sourceUrl: body.sourceUrl,
        externalId: body.externalId,
        importStatus: body.importStatus as ImportStatus,
        isActive: body.isActive,
        metadata: body.metadata,
        // 關稅資訊欄位
        customsDuty: body.customsDuty !== undefined && body.customsDuty !== null 
          ? new Prisma.Decimal(body.customsDuty) 
          : null,
        commodityTax: body.commodityTax !== undefined && body.commodityTax !== null 
          ? new Prisma.Decimal(body.commodityTax) 
          : null,
        businessTax: body.businessTax !== undefined && body.businessTax !== null 
          ? new Prisma.Decimal(body.businessTax) 
          : null,
        totalTax: body.totalTax !== undefined && body.totalTax !== null 
          ? new Prisma.Decimal(body.totalTax) 
          : null,
        hsCode: body.hsCode || null,
        needsBSMI: body.needsBSMI !== undefined ? body.needsBSMI : false,
        needsNCC: body.needsNCC !== undefined ? body.needsNCC : false,
        needsFDA: body.needsFDA !== undefined ? body.needsFDA : false,
        prohibitedFromChina: body.prohibitedFromChina !== undefined ? body.prohibitedFromChina : false,
        customsWarnings: body.customsWarnings !== undefined && Array.isArray(body.customsWarnings) && body.customsWarnings.length > 0
          ? body.customsWarnings
          : [],
      },
    })

    return NextResponse.json({
      success: true,
      message: '商品已更新',
      data: product,
    })
  } catch (error) {
    console.error('更新商品錯誤:', error)
    return NextResponse.json(
      {
        error: '無法更新商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    // 检查商品是否存在
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    // 删除商品
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: '商品已刪除',
    })
  } catch (error) {
    console.error('刪除商品錯誤:', error)
    return NextResponse.json(
      {
        error: '無法刪除商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

