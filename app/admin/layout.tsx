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
  fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/layout.tsx:11',message:'AdminLayout entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{})
  // #endregion

  // 检查 API_SECRET 认证
  const authenticated = await isAdminAuthenticated()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/layout.tsx:17',message:'Auth check result',data:{authenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
  // #endregion

  if (!authenticated) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/aee0e817-0704-4436-8dbf-1c0e88679cb4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/admin/layout.tsx:22',message:'Redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
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

