"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Search } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (search) params.append("search", search)
      if (roleFilter) params.append("role", roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("獲取用戶列表錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers()
      } else {
        alert(data.error || "更新失敗")
      }
    } catch (error) {
      console.error("更新用戶角色錯誤:", error)
      alert("更新失敗")
    } finally {
      setUpdatingRole(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用戶管理</h1>
        <p className="text-muted-foreground">管理所有用戶</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜尋與篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋用戶名稱或郵箱..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">全部角色</option>
              <option value="ADMIN">管理員</option>
              <option value="CUSTOMER">客戶</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用戶列表</CardTitle>
          <CardDescription>共 {users.length} 個用戶</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">載入中...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">尚無用戶</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">用戶名稱</th>
                      <th className="text-left p-4">郵箱</th>
                      <th className="text-left p-4">角色</th>
                      <th className="text-left p-4">註冊時間</th>
                      <th className="text-right p-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">{user.name || "-"}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">
                          <StatusBadge status={user.role} />
                        </td>
                        <td className="p-4">
                          {new Date(user.createdAt).toLocaleDateString("zh-TW")}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={updatingRole === user.id}
                              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                              <option value="ADMIN">管理員</option>
                              <option value="CUSTOMER">客戶</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一頁
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {page} 頁，共 {totalPages} 頁
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一頁
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

