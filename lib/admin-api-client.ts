/**
 * 后台 API 客户端工具
 * 自动在请求 header 中添加 API_SECRET（从 cookie 读取）
 */

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // 从 cookie 读取 API_SECRET
  const cookies = document.cookie.split(';')
  const apiSecretCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('admin-api-secret=')
  )
  const apiSecret = apiSecretCookie?.split('=')[1]

  // 添加 API_SECRET 到 header
  const headers = new Headers(options.headers)
  if (apiSecret) {
    headers.set('x-api-secret', apiSecret)
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 确保 cookie 被发送
  })
}


