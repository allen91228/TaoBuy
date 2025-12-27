"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  images: string[]
  category: string | null
  price: any
  originalPrice: any | null
  sourceUrl: string | null
  externalId: string | null
  importStatus: string
  isActive: boolean
  metadata: any
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>("")
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

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          credentials: 'include',
        })
        const data = await response.json()

        if (data.success) {
          const p = data.data
          setProduct(p)
          setFormData({
            name: p.name || "",
            slug: p.slug || "",
            description: p.description || "",
            image: p.image || "",
            images: Array.isArray(p.images) ? p.images.join("\n") : "",
            category: p.category || "",
            price: p.price?.toString() || "",
            originalPrice: p.originalPrice?.toString() || "",
            sourceUrl: p.sourceUrl || "",
            externalId: p.externalId || "",
            importStatus: p.importStatus || "DRAFT",
            isActive: p.isActive !== undefined ? p.isActive : true,
          })
        }
      } catch (error) {
        console.error("獲取商品錯誤:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!productId) return

    try {
      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img.length > 0)

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
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
        alert(data.error || "更新失敗")
      }
    } catch (error) {
      console.error("更新商品錯誤:", error)
      alert("更新失敗")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">載入中...</div>
  }

  if (!product) {
    return <div className="text-center py-8">商品不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">編輯商品</h1>
          <p className="text-muted-foreground">編輯商品資訊</p>
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
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                <label className="text-sm font-medium">圖片列表 (每行一個 URL)</label>
                <textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
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
            {saving ? "儲存中..." : "儲存"}
          </Button>
        </div>
      </form>
    </div>
  )
}

