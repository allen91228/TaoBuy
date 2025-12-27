import { NextRequest, NextResponse } from 'next/server'
import { verifyApiSecret, setApiSecretCookie } from '@/lib/api-secret-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret } = body

    if (!secret) {
      return NextResponse.json(
        { error: '請輸入 API Secret' },
        { status: 400 }
      )
    }

    // 驗證 API_SECRET
    if (!verifyApiSecret(secret)) {
      return NextResponse.json(
        { error: 'API Secret 不正確' },
        { status: 401 }
      )
    }

    // 設置 cookie
    await setApiSecretCookie(secret)

    return NextResponse.json({
      success: true,
      message: '登入成功',
    })
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

