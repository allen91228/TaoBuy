import { NextRequest, NextResponse } from 'next/server'
import { verifyApiSecret } from '@/lib/api-secret-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret } = body

    // #region agent log
    console.log('[LOGIN] Received login request', { hasSecret: !!secret, secretLength: secret?.length })
    // #endregion

    if (!secret) {
      return NextResponse.json(
        { error: '請輸入 API Secret' },
        { status: 400 }
      )
    }

    // 驗證 API_SECRET
    const isValid = verifyApiSecret(secret)
    // #region agent log
    console.log('[LOGIN] Secret verification', { isValid, secretLength: secret.length, expectedLength: process.env.API_SECRET?.length || 'default'.length })
    // #endregion

    if (!isValid) {
      // #region agent log
      console.log('[LOGIN] Secret verification failed', { 
        received: secret.substring(0, 10) + '...',
        expected: process.env.API_SECRET?.substring(0, 10) + '...' || 'default'.substring(0, 10) + '...'
      })
      // #endregion
      return NextResponse.json(
        { error: 'API Secret 不正確' },
        { status: 401 }
      )
    }

    // 創建響應並設置 cookie
    const isProduction = process.env.NODE_ENV === 'production'
    const response = NextResponse.json({
      success: true,
      message: '登入成功',
    })

    // 使用 NextResponse 設置 cookie（這是正確的方式）
    response.cookies.set('admin-api-secret', secret, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })

    // #region agent log
    console.log('[LOGIN] Cookie set in response', { 
      cookieName: 'admin-api-secret',
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      isProduction
    })
    // #endregion

    return response
  } catch (error) {
    console.error('登入錯誤:', error)
    return NextResponse.json(
      {
        error: '登入失敗',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

