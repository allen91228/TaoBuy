"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [secret, setSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ secret }),
      })

      const data = await response.json()

      console.log('[CLIENT] Login response', { success: data.success, error: data.error })

      if (data.success) {
        console.log('[CLIENT] Login successful, redirecting to /admin')
        // 等待一小段时间确保 cookie 已设置
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push("/admin")
        router.refresh()
      } else {
        console.log('[CLIENT] Login failed', { error: data.error })
        setError(data.error || "登入失敗")
      }
    } catch (err) {
      console.error("登入錯誤:", err)
      setError("登入失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">後台登入</CardTitle>
          <CardDescription>請輸入 API Secret 以進入後台管理系統</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="secret" className="text-sm font-medium">
                API Secret
              </label>
              <Input
                id="secret"
                type="password"
                placeholder="輸入 API Secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "登入中..." : "登入"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

