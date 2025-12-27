import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 定義哪些路徑是公開的（不需登入即可訪問）
// 注意：我們包含 '/api/admin/import-product' 讓它繞過 Clerk 的自動轉址
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/cart',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/products(.*)', // 👈 添加 API products 路由為公開
  "/api/admin/import-product(.*)", // 👈 加入這一行，這是關鍵！
])

export default clerkMiddleware((auth, req) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:19',message:'Middleware execution started',data:{path:req.nextUrl.pathname,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (isPublicRoute(req)) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:22',message:'Route is public, allowing access',data:{path:req.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return // 如果是公開路徑，直接放行，不做任何處理
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:28',message:'Route is protected, calling auth().protect()',data:{path:req.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
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

