import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// API Secret（從環境變數讀取，與 import-product API 使用相同的密鑰）
const API_SECRET = process.env.API_SECRET || 'sermon-museum-struggle-denim-bankable-strongly'

const ADMIN_SECRET_COOKIE = 'admin-api-secret'

/**
 * 從請求中獲取 API_SECRET（優先從 header，其次從 cookie）
 */
export function getApiSecretFromRequest(request: NextRequest): string | null {
  // 優先從 header 讀取
  const headerSecret = request.headers.get('x-api-secret')
  if (headerSecret) {
    return headerSecret
  }

  // 其次從 cookie 讀取
  const cookieSecret = request.cookies.get(ADMIN_SECRET_COOKIE)?.value
  return cookieSecret || null
}

/**
 * 驗證 API_SECRET 是否正確
 */
export function verifyApiSecret(secret: string | null): boolean {
  return secret === API_SECRET
}

/**
 * 檢查請求中的 API_SECRET 是否有效
 */
export function checkApiSecretAuth(request: NextRequest): boolean {
  const secret = getApiSecretFromRequest(request)
  return verifyApiSecret(secret)
}

/**
 * 從 cookie 讀取 API_SECRET（用於 Server Component）
 */
export async function getApiSecretFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_SECRET_COOKIE)?.value || null
}

/**
 * 檢查當前請求是否已通過 API_SECRET 驗證（用於 Server Component）
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = await getApiSecretFromCookie()
  return verifyApiSecret(secret)
}

/**
 * 設置 API_SECRET cookie
 */
export async function setApiSecretCookie(secret: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SECRET_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  })
}

/**
 * 清除 API_SECRET cookie（登出）
 */
export async function clearApiSecretCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SECRET_COOKIE)
}

