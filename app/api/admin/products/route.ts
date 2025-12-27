import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiSecretAuth } from '@/lib/api-secret-auth'
import { ImportStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // #region agent log
    console.log('[API] GET /api/admin/products - checking auth')
    // #endregion
    
    if (!checkApiSecretAuth(request)) {
      // #region agent log
      console.log('[API] GET /api/admin/products - auth failed')
      // #endregion
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    // #region agent log
    console.log('[API] GET /api/admin/products - auth passed')
    // #endregion

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as ImportStatus | null
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.importStatus = status
    }

    if (category) {
      where.category = category
    }

    // 获取商品列表和总数
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          category: true,
          importStatus: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          images: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('獲取商品列表錯誤:', error)
    return NextResponse.json(
      {
        error: '無法獲取商品列表',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 验证必要字段
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: '缺少必要欄位：name, price 為必填' },
        { status: 400 }
      )
    }

    // 生成 slug
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-')

    // 检查 slug 是否已存在
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: '商品 slug 已存在' },
        { status: 409 }
      )
    }

    // 创建商品
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        image: body.image || body.images?.[0] || null,
        images: body.images || [],
        category: body.category || null,
        price: body.price,
        originalPrice: body.originalPrice || null,
        sourceUrl: body.sourceUrl || null,
        externalId: body.externalId || null,
        importStatus: body.importStatus || ImportStatus.DRAFT,
        isActive: body.isActive !== undefined ? body.isActive : true,
        metadata: body.metadata || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: '商品已建立',
      data: product,
    })
  } catch (error) {
    console.error('創建商品錯誤:', error)
    return NextResponse.json(
      {
        error: '無法創建商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

