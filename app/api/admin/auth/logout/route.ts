import { NextRequest, NextResponse } from 'next/server'
import { clearApiSecretCookie } from '@/lib/api-secret-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await clearApiSecretCookie()

    return NextResponse.json({
      success: true,
      message: '已登出',
    })
  } catch (error) {
    console.error('登出錯誤:', error)
    return NextResponse.json(
      {
        error: '登出失敗',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


