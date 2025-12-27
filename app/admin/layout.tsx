import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/api-secret-auth"
import { Sidebar } from "@/components/admin/Sidebar"
import { AdminHeader } from "@/components/admin/Header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // #region agent log
  console.log('[LAYOUT] AdminLayout entry - checking authentication')
  // #endregion

  // 检查 API_SECRET 认证
  const authenticated = await isAdminAuthenticated()
  
  // #region agent log
  console.log('[LAYOUT] Authentication check result', { authenticated })
  // #endregion

  if (!authenticated) {
    // #region agent log
    console.log('[LAYOUT] Not authenticated, redirecting to login')
    // #endregion
    redirect("/admin-login")
  }

  // #region agent log
  console.log('[LAYOUT] Authenticated, rendering admin layout')
  // #endregion

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

