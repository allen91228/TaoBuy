import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug, extractExternalIdFromUrl } from '@/lib/slug'
import { generateProductId } from '@/lib/product-id'
import { ImportStatus, Prisma } from '@prisma/client'

// 強制動態執行，避免 Vercel Build Error (Failed to collect page data)
export const dynamic = 'force-dynamic'

// API Secret（從環境變數讀取，如果沒有則使用預設值）
const API_SECRET = process.env.API_SECRET || 'sermon-museum-struggle-denim-bankable-strongly'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-secret',
}

// 請求 Body 類型定義
interface ImportProductRequest {
  sourceUrl: string // 淘寶網址
  title: string // 標題
  images: string[] // 圖片陣列
  originalPrice: number // 原始價格（人民幣）
  price: number // 本地售價（TWD）
  specifications?: Record<string, any> // 規格（可選）
  description?: string // 商品描述（可選）
  category?: string // 分類（可選）
  externalId?: string // 外部 ID（可選，如果不提供則從 URL 提取）
}

// 處理 CORS 預檢請求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  try {
    // 1. 安全性檢查：檢查 API Secret
    const apiSecret = request.headers.get('x-api-secret')
    
    if (!apiSecret || apiSecret !== API_SECRET) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401, headers: corsHeaders }
      )
    }

    // 2. 解析請求 Body
    const body: ImportProductRequest = await request.json()

    // 3. 驗證必要欄位
    if (!body.sourceUrl || !body.title || !body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: '缺少必要欄位：sourceUrl, title, images 為必填' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (typeof body.originalPrice !== 'number' || typeof body.price !== 'number') {
      return NextResponse.json(
        { error: '價格必須為數字' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 4. 處理 externalId：優先使用提供的，否則從 URL 提取
    let externalId = body.externalId || extractExternalIdFromUrl(body.sourceUrl)
    
    if (!externalId) {
      // 如果無法從 URL 提取，使用 URL 的 hash 作為 fallback
      externalId = `url-${Buffer.from(body.sourceUrl).toString('base64').slice(0, 50)}`
    }

    // 5. 檢查商品是否已存在（根據 externalId）
    const existingProduct = await prisma.product.findUnique({
      where: { externalId: externalId },
      select: { id: true, slug: true },
    })

    // 6. 生成 slug
    let slug: string
    
    if (existingProduct) {
      // 如果是更新，保留原有的 slug（維持 URL 穩定性）
      slug = existingProduct.slug
    } else {
      // 如果是新商品，生成 slug 並確保唯一性
      slug = generateSlug(body.title)
      const existingSlug = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      })
      
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // 7. 準備商品資料
    // 確保 price 和 originalPrice 正確轉換為 Prisma Decimal 類型
    const productData = {
      name: body.title,
      slug: slug,
      description: body.description || null,
      image: body.images[0] || null,
      images: body.images,
      category: body.category || null,
      stock: 0, // 預設庫存為 0
      price: new Prisma.Decimal(body.price), // 轉換為 Prisma Decimal
      isActive: true, // 匯入的商品自動啟用並上架
      sourceUrl: body.sourceUrl,
      externalId: externalId,
      originalPrice: body.originalPrice ? new Prisma.Decimal(body.originalPrice) : null, // 轉換為 Prisma Decimal
      importStatus: ImportStatus.PUBLISHED, // 匯入後直接發布
      metadata: body.specifications ? (typeof body.specifications === 'object' ? body.specifications : null) : null,
    }

    // 7.1 驗證資料完整性
    if (!productData.name || !productData.slug || !productData.externalId) {
      console.error('資料驗證失敗:', {
        hasName: !!productData.name,
        hasSlug: !!productData.slug,
        hasExternalId: !!productData.externalId,
      })
      return NextResponse.json(
        { error: '資料驗證失敗：缺少必要欄位' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 7.2 記錄準備寫入的資料（用於調試）
    console.log('準備寫入商品資料:', {
      externalId: productData.externalId,
      name: productData.name,
      slug: productData.slug,
      price: productData.price.toString(),
      originalPrice: productData.originalPrice?.toString() || 'null',
      imagesCount: productData.images.length,
      importStatus: productData.importStatus,
    })

    // 8. 使用 Upsert 來建立或更新商品
    let product
    try {
      product = await prisma.product.upsert({
        where: {
          externalId: externalId,
        },
        update: {
          ...productData,
          updatedAt: new Date(),
          // 修正：強制轉型 metadata 以通過 Prisma 的嚴格檢查
          metadata: (productData.metadata || {}) as any,
        },
        create: {
          ...productData,
          // 修正：強制轉型 metadata 以通過 Prisma 的嚴格檢查
          metadata: (productData.metadata || {}) as any,
        },
      })
      
      console.log('商品寫入成功:', {
        id: product.id,
        name: product.name,
        slug: product.slug,
        externalId: product.externalId,
      })
    } catch (dbError) {
      console.error('資料庫寫入錯誤:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        productData: {
          externalId: productData.externalId,
          name: productData.name,
          slug: productData.slug,
        },
      })
      throw dbError // 重新拋出錯誤，讓外層 catch 處理
    }

    // 9. 生成自訂格式的商品ID
    const productCode = generateProductId()
    
    // 10. 返回成功回應（包含商品連結和自訂商品ID）
    // 優先使用環境變數，否則使用請求的實際域名（不依賴 origin header，因為可能是擴展 URL）
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const productUrl = `${baseUrl}/products/${product.slug}`
    
    return NextResponse.json(
      {
        success: true,
        message: existingProduct ? '商品已更新' : '商品已建立',
        product: {
          id: product.id, // Prisma 自動生成的 ID
          productCode: productCode, // 自訂格式的商品ID
          name: product.name,
          slug: product.slug,
          externalId: product.externalId,
          importStatus: product.importStatus,
          url: productUrl, // 商品連結
        },
      },
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    // 詳細的錯誤記錄
    console.error('匯入商品錯誤:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // 處理 Prisma 錯誤
    if (error instanceof Error) {
      // 如果是唯一約束違反（例如 slug 重複）
      if (error.message.includes('Unique constraint') || error.message.includes('Unique constraint violation')) {
        return NextResponse.json(
          { error: '商品已存在或 slug 重複', details: error.message },
          { status: 409, headers: corsHeaders }
        )
      }
      
      // 如果是 Prisma 驗證錯誤
      if (error.message.includes('Invalid value') || error.message.includes('Argument')) {
        return NextResponse.json(
          { error: '資料格式錯誤', details: error.message },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    return NextResponse.json(
      { 
        error: '伺服器錯誤：無法匯入商品',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

