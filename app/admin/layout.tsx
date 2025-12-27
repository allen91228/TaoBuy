import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/api-secret-auth"
import { Sidebar } from "@/components/admin/Sidebar"
import { AdminHeader } from "@/components/admin/Header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 检查 API_SECRET 认证
  const authenticated = await isAdminAuthenticated()

  if (!authenticated) {
    redirect("/admin/login")
  }

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

