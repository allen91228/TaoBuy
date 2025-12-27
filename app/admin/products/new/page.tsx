"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    images: "",
    category: "",
    price: "",
    originalPrice: "",
    sourceUrl: "",
    externalId: "",
    importStatus: "DRAFT",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img.length > 0)

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: imagesArray,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/admin/products")
      } else {
        alert(data.error || "創建失敗")
      }
    } catch (error) {
      console.error("創建商品錯誤:", error)
      alert("創建失敗")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">新增商品</h1>
          <p className="text-muted-foreground">創建新商品</p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">商品名稱 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Slug (自動生成，可選)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="留空將自動生成"
                />
              </div>

              <div>
                <label className="text-sm font-medium">分類</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>價格與狀態</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">價格 (TWD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">原始價格 (CNY)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">狀態</label>
                <select
                  value={formData.importStatus}
                  onChange={(e) => setFormData({ ...formData, importStatus: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="DRAFT">草稿</option>
                  <option value="PUBLISHED">已發布</option>
                  <option value="SYNC_ERROR">同步錯誤</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  啟用商品
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>圖片</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">主圖 URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">圖片列表 (每行一個 URL) *</label>
                <textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>其他資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">來源 URL</label>
                <Input
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://item.taobao.com/item.htm?id=..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">外部 ID</label>
                <Input
                  value={formData.externalId}
                  onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">取消</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "創建中..." : "創建商品"}
          </Button>
        </div>
      </form>
    </div>
  )
}

