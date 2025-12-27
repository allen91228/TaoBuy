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
          
          // 调试日志 - 详细检查 metadata 结构
          console.log('[REVIEW] Product metadata:', p.metadata)
          console.log('[REVIEW] Metadata type:', typeof p.metadata)
          console.log('[REVIEW] Metadata is null?', p.metadata === null)
          console.log('[REVIEW] Metadata is undefined?', p.metadata === undefined)
          
          // 处理 metadata 可能是字符串的情况
          let metadataObj: any = p.metadata
          if (typeof p.metadata === 'string') {
            try {
              metadataObj = JSON.parse(p.metadata)
              console.log('[REVIEW] Parsed metadata from string:', metadataObj)
            } catch (e) {
              console.error('[REVIEW] Failed to parse metadata string:', e)
              metadataObj = null
            }
          }
          
          console.log('[REVIEW] Variants from metadata:', metadataObj?.variants)
          console.log('[REVIEW] Variants type:', typeof metadataObj?.variants)
          console.log('[REVIEW] Variants is array?', Array.isArray(metadataObj?.variants))
          
          // 解析变体数据 - 改进解析逻辑
          let variants: Variant[] = []
          if (metadataObj?.variants && Array.isArray(metadataObj.variants)) {
            console.log('[REVIEW] Processing variants array, length:', metadataObj.variants.length)
            variants = metadataObj.variants
              .filter((v: any) => v !== null && v !== undefined) // 过滤掉 null/undefined
              .map((v: any, index: number) => {
                console.log(`[REVIEW] Processing variant ${index}:`, v)
                return {
                  id: v.id || `variant-${Date.now()}-${index}`,
                  specifications: v.specifications && typeof v.specifications === 'object' 
                    ? v.specifications 
                    : {},
                  price: v.price !== null && v.price !== undefined
                    ? (typeof v.price === 'string' ? parseFloat(v.price) : v.price)
                    : 0,
                  sku: v.sku || null,
                  image: v.image || null,
                  images: v.images && Array.isArray(v.images) ? v.images : undefined,
                }
              })
          } else {
            console.log('[REVIEW] No variants found or not an array')
          }
          
          console.log('[REVIEW] Parsed variants:', variants)
          console.log('[REVIEW] Variants count:', variants.length)
          
          setFormData({
            name: p.name || "",
            description: p.description || "",
            images: Array.isArray(p.images) ? [...p.images] : [],
            price: p.price?.toString() || "0",
            variants: variants,
          })
          
          console.log('[REVIEW] FormData variants:', variants)
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
      // 处理 metadata - 可能是字符串或对象
      let metadataObj: any = product?.metadata
      if (typeof product?.metadata === 'string') {
        try {
          metadataObj = JSON.parse(product.metadata)
        } catch (e) {
          console.error('[REVIEW] Failed to parse metadata:', e)
          metadataObj = {}
        }
      } else if (!metadataObj) {
        metadataObj = {}
      }
      
      // 更新 metadata 中的变体数据（包括规格和价格）
      const updatedMetadata = { ...metadataObj }
      if (formData.variants.length > 0) {
        updatedMetadata.variants = formData.variants.map(v => ({
          ...v,
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
          specifications: v.specifications || {},
          sku: v.sku || null,
        }))
      } else {
        // 如果没有变体，确保 variants 字段存在（即使是空数组）
        updatedMetadata.variants = []
      }
      
      console.log('[REVIEW] Updated metadata:', updatedMetadata)

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

      {/* 變體管理 - 始终显示 */}
      <Card>
        <CardHeader>
          <CardTitle>商品變體</CardTitle>
          <CardDescription>編輯每個變體的規格和價格</CardDescription>
        </CardHeader>
        <CardContent>
          {formData.variants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                尚無變體數據
              </p>
              <p className="text-xs text-muted-foreground">
                變體數據存儲在商品的 metadata.variants 中
              </p>
            </div>
          ) : (
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
                        onChange={(e) => handleVariantPriceChange(variantIndex, e.target.value)}
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
          )}
        </CardContent>
      </Card>

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

