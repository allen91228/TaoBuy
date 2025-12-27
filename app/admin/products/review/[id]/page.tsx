"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ArrowLeft, Save, X, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Variant {
  id: string
  specifications: Record<string, string>
  price: number | string
  sku?: string | null
  image?: string | null
  images?: string[]
}

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

export default function ReviewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [] as string[],
    price: "",
    variants: [] as Variant[],
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
          
          // 解析变体数据
          const variants: Variant[] = p.metadata?.variants 
            ? p.metadata.variants.map((v: any) => ({
                id: v.id || `variant-${Date.now()}-${Math.random()}`,
                specifications: v.specifications || {},
                price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
                sku: v.sku || null,
                image: v.image || null,
                images: v.images && Array.isArray(v.images) ? v.images : undefined,
              }))
            : []
          
          setFormData({
            name: p.name || "",
            description: p.description || "",
            images: Array.isArray(p.images) ? [...p.images] : [],
            price: p.price?.toString() || "0",
            variants: variants,
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

  const handleDeleteImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleVariantPriceChange = (variantIndex: number, newPrice: string) => {
    const updatedVariants = [...formData.variants]
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      price: parseFloat(newPrice) || 0,
    }
    setFormData({ ...formData, variants: updatedVariants })
  }

  const getVariantDisplayName = (variant: Variant): string => {
    const specs = Object.entries(variant.specifications || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
    return specs || `變體 ${variant.id}`
  }

  const handleSave = async (publish: boolean = false) => {
    if (!productId || saving) return

    setSaving(true)

    try {
      // 更新 metadata 中的变体价格
      const updatedMetadata = product?.metadata ? { ...product.metadata } : {}
      if (formData.variants.length > 0) {
        updatedMetadata.variants = formData.variants.map(v => ({
          ...v,
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
        }))
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          images: formData.images,
          image: formData.images[0] || null,
          importStatus: publish ? "PUBLISHED" : "DRAFT",
          // 更新价格
          price: parseFloat(formData.price) || 0,
          // 保留其他字段不变
          slug: product?.slug,
          category: product?.category,
          originalPrice: product?.originalPrice,
          sourceUrl: product?.sourceUrl,
          externalId: product?.externalId,
          isActive: product?.isActive,
          metadata: updatedMetadata,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 获取下一个待审核商品
        const nextResponse = await fetch(`/api/admin/products/review/next?currentId=${productId}`, {
          credentials: 'include',
        })
        const nextData = await nextResponse.json()

        if (nextData.success && nextData.data) {
          // 跳转到下一个待审核商品
          router.push(`/admin/products/review/${nextData.data.id}`)
        } else {
          // 没有下一个了，返回列表
          router.push("/admin/products/review")
        }
      } else {
        alert(data.error || "儲存失敗")
        setSaving(false)
      }
    } catch (error) {
      console.error("儲存商品錯誤:", error)
      alert("儲存失敗")
      setSaving(false)
    }
  }

  const handleSaveAndNext = async () => {
    await handleSave(false)
  }

  const handlePublishAndNext = async () => {
    await handleSave(true)
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
          <h1 className="text-3xl font-bold">審核商品</h1>
          <p className="text-muted-foreground">審核並編輯商品資訊</p>
        </div>
        <Link href="/admin/products/review">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 商品資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>商品資訊</CardTitle>
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
              <label className="text-sm font-medium">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">分類</label>
              <p className="text-sm text-muted-foreground">{product.category || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-medium">基礎價格 (TWD) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                NT$ {parseFloat(formData.price || "0").toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">狀態</label>
              <div className="mt-1">
                <StatusBadge status={product.importStatus} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 圖片管理 */}
        <Card>
          <CardHeader>
            <CardTitle>圖片管理</CardTitle>
            <CardDescription>點擊圖片右上角的 X 刪除圖片</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.images.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">尚無圖片</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                        <Image
                          src={imageUrl}
                          alt={`商品圖片 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 變體管理 */}
      {formData.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>商品變體</CardTitle>
            <CardDescription>編輯每個變體的價格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium">變體規格</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getVariantDisplayName(variant)}
                    </p>
                    {variant.sku && (
                      <p className="text-xs text-muted-foreground mt-1">SKU: {variant.sku}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">變體價格 (TWD) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={typeof variant.price === 'string' ? variant.price : variant.price.toString()}
                      onChange={(e) => handleVariantPriceChange(index, e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      NT$ {parseFloat(
                        typeof variant.price === 'string' 
                          ? variant.price 
                          : variant.price.toString()
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-4">
        <Link href="/admin/products/review">
          <Button type="button" variant="outline">取消</Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveAndNext}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "儲存中..." : "儲存下一個"}
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handlePublishAndNext}
          disabled={saving}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {saving ? "發布中..." : "發布並下一個"}
        </Button>
      </div>
    </div>
  )
}

