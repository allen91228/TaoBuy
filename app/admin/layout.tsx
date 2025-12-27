import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-auth"
import { getCurrentUser } from "@/lib/get-current-user"
import { Sidebar } from "@/components/admin/Sidebar"
import { AdminHeader } from "@/components/admin/Header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 检查管理员权限
  const adminUser = await requireAdmin()
  const currentUser = await getCurrentUser()

  if (!adminUser || !currentUser) {
    redirect("/")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={currentUser} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

