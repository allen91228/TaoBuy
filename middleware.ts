import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 定義哪些路徑是公開的（不需登入即可訪問）
// 注意：我們包含 '/api/admin/import-product' 讓它繞過 Clerk 的自動轉址
// 後台路由使用 API_SECRET 驗證，不需要 Clerk 保護
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/cart',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/products(.*)', // 👈 添加 API products 路由為公開
  "/api/admin/import-product(.*)", // 👈 加入這一行，這是關鍵！
  '/api/admin/auth/login', // 後台登入 API 為公開
  '/api/admin/auth/logout', // 後台登出 API 為公開
  '/api/admin/products(.*)', // 後台商品管理 API 使用 API_SECRET 驗證，不需要 Clerk 保護
  '/api/admin/orders(.*)', // 後台訂單管理 API 使用 API_SECRET 驗證，不需要 Clerk 保護
  '/api/admin/users(.*)', // 後台用戶管理 API 使用 API_SECRET 驗證，不需要 Clerk 保護
  '/api/admin/stats(.*)', // 後台統計 API 使用 API_SECRET 驗證，不需要 Clerk 保護
  '/admin(.*)', // 後台路由使用 API_SECRET 驗證，不需要 Clerk 保護
  '/admin-login', // 後台登入頁面為公開
])

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return // 如果是公開路徑，直接放行，不做任何處理
  }
  
  // 其他路徑則啟用保護
  auth().protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

