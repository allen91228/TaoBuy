"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ArrowLeft, Save, CheckCircle2, Loader2, X } from "lucide-react"
import Link from "next/link"

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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
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
    variants: [] as Variant[],
  })
  const initialDataRef = useRef<string>("")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true)

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
          
          const initialFormData = {
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
            variants: variants,
          }
          setFormData(initialFormData)
          initialDataRef.current = JSON.stringify(initialFormData)
          isInitialLoadRef.current = false
        }
      } catch (error) {
        console.error("獲取商品錯誤:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // 自动保存功能
  useEffect(() => {
    // 如果还在加载或没有 productId，不执行
    if (loading || !productId || isInitialLoadRef.current) return

    // 检查数据是否有变化
    const currentData = JSON.stringify(formData)
    if (currentData === initialDataRef.current) {
      return // 数据没有变化，不需要保存
    }

    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 设置新的定时器，1.5秒后自动保存
    saveTimeoutRef.current = setTimeout(async () => {
      await autoSave()
    }, 1500)

    // 清理函数
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, productId, loading])

  const autoSave = async () => {
    if (!productId || saving) return

    setSaving(true)
    setSaveStatus('saving')

    try {
      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img.length > 0)

      // 更新 metadata 中的变体数据
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
          ...formData,
          images: imagesArray,
          price: parseFloat(formData.price) || 0,
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          metadata: updatedMetadata,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus('saved')
        initialDataRef.current = JSON.stringify(formData)
        // 3秒后隐藏"已保存"提示
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      } else {
        setSaveStatus('error')
        console.error("自動儲存失敗:", data.error)
      }
    } catch (error) {
      console.error("自動儲存錯誤:", error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async () => {
    if (!productId || saving) return

    setSaving(true)
    setSaveStatus('saving')

    try {
      const imagesArray = formData.images
        .split("\n")
        .map((img) => img.trim())
        .filter((img) => img.length > 0)

      // 更新 metadata 中的变体数据
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
          ...formData,
          images: imagesArray,
          price: parseFloat(formData.price) || 0,
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          metadata: updatedMetadata,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus('saved')
        initialDataRef.current = JSON.stringify(formData)
        // 3秒后隐藏"已保存"提示
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      } else {
        setSaveStatus('error')
        alert(data.error || "儲存失敗")
      }
    } catch (error) {
      console.error("手動儲存錯誤:", error)
      setSaveStatus('error')
      alert("儲存失敗")
    } finally {
      setSaving(false)
    }
  }

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
        // 手动保存成功后，更新初始数据引用
        initialDataRef.current = JSON.stringify(formData)
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
        <div className="flex items-center gap-4">
          {/* 保存状态提示 */}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>自動儲存中...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>已自動儲存</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <span>儲存失敗，請手動儲存</span>
            </div>
          )}
          <Link href="/admin/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </Link>
        </div>
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

          {/* 變體管理 */}
          {formData.variants.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>商品變體</CardTitle>
                <CardDescription>編輯每個變體的規格和價格</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.variants.map((variant, variantIndex) => (
                    <div key={variant.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">變體 {variantIndex + 1}</h3>
                      </div>
                      
                      {/* 規格編輯 */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">規格</label>
                        <div className="space-y-2">
                          {Object.entries(variant.specifications || {}).map(([key, value], specIndex) => (
                            <div key={specIndex} className="flex gap-2">
                              <Input
                                placeholder="規格名稱 (如: 顏色)"
                                value={key}
                                onChange={(e) => {
                                  const updatedVariants = [...formData.variants]
                                  const newSpecs = { ...updatedVariants[variantIndex].specifications }
                                  delete newSpecs[key]
                                  newSpecs[e.target.value] = value
                                  updatedVariants[variantIndex] = {
                                    ...updatedVariants[variantIndex],
                                    specifications: newSpecs,
                                  }
                                  setFormData({ ...formData, variants: updatedVariants })
                                }}
                                className="flex-1"
                              />
                              <Input
                                placeholder="規格值 (如: 紅色)"
                                value={value}
                                onChange={(e) => {
                                  const updatedVariants = [...formData.variants]
                                  updatedVariants[variantIndex] = {
                                    ...updatedVariants[variantIndex],
                                    specifications: {
                                      ...updatedVariants[variantIndex].specifications,
                                      [key]: e.target.value,
                                    },
                                  }
                                  setFormData({ ...formData, variants: updatedVariants })
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const updatedVariants = [...formData.variants]
                                  const newSpecs = { ...updatedVariants[variantIndex].specifications }
                                  delete newSpecs[key]
                                  updatedVariants[variantIndex] = {
                                    ...updatedVariants[variantIndex],
                                    specifications: newSpecs,
                                  }
                                  setFormData({ ...formData, variants: updatedVariants })
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedVariants = [...formData.variants]
                              updatedVariants[variantIndex] = {
                                ...updatedVariants[variantIndex],
                                specifications: {
                                  ...updatedVariants[variantIndex].specifications,
                                  [`新規格${Date.now()}`]: "",
                                },
                              }
                              setFormData({ ...formData, variants: updatedVariants })
                            }}
                          >
                            + 新增規格
                          </Button>
                        </div>
                      </div>

                      {/* 價格和SKU */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">變體價格 (TWD) *</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={typeof variant.price === 'string' ? variant.price : variant.price.toString()}
                            onChange={(e) => {
                              const updatedVariants = [...formData.variants]
                              updatedVariants[variantIndex] = {
                                ...updatedVariants[variantIndex],
                                price: parseFloat(e.target.value) || 0,
                              }
                              setFormData({ ...formData, variants: updatedVariants })
                            }}
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
                        <div>
                          <label className="text-sm font-medium">SKU</label>
                          <Input
                            value={variant.sku || ""}
                            onChange={(e) => {
                              const updatedVariants = [...formData.variants]
                              updatedVariants[variantIndex] = {
                                ...updatedVariants[variantIndex],
                                sku: e.target.value || null,
                              }
                              setFormData({ ...formData, variants: updatedVariants })
                            }}
                            placeholder="可選"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">取消</Button>
          </Link>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleManualSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "儲存中..." : "手動儲存"}
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "儲存中..." : "儲存並返回"}
          </Button>
        </div>
      </form>
    </div>
  )
}

