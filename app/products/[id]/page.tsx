"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

interface Variant {
  id: string
  specifications: Record<string, string>
  price: number
  sku?: string | null
  image?: string | null // 變體主圖（可選）
  images?: string[] // 變體圖片陣列（可選）
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  images: string[]
  category: string | null
  price: number | string
  metadata?: any // 包含 variants 和 specificationOptions
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSpecifications, setSelectedSpecifications] = useState<Record<string, string>>({})
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  const formatPrice = (price: number | string): number => {
    if (typeof price === 'string') {
      return parseFloat(price)
    }
    return price
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()

        if (data.success && data.product) {
          setProduct(data.product)
          setSelectedImage(0) // 重置選中的圖片索引
          
          // 初始化價格：如果有變體，顯示最便宜的價格
          const variants = data.product.metadata?.variants
          if (variants && Array.isArray(variants) && variants.length > 0) {
            const cheapestVariant = variants.reduce((min: any, variant: any) => {
              const variantPrice = typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price
              const minPrice = typeof min.price === 'string' ? parseFloat(min.price) : min.price
              return variantPrice < minPrice ? variant : min
            })
            const cheapestPrice = typeof cheapestVariant.price === 'string' 
              ? parseFloat(cheapestVariant.price) 
              : cheapestVariant.price
            setCurrentPrice(cheapestPrice)
          } else {
            const initialPrice = formatPrice(data.product.price)
            setCurrentPrice(initialPrice)
          }
        } else {
          setError('商品不存在')
        }
      } catch (err) {
        console.error('載入商品錯誤:', err)
        setError('無法載入商品')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  // 解析變體數據
  const getVariants = (): Variant[] => {
    if (!product?.metadata?.variants) return []
    return product.metadata.variants.map((v: any) => ({
      id: v.id,
      specifications: v.specifications,
      price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
      sku: v.sku ?? null,
      image: v.image ?? null,
      images: v.images && Array.isArray(v.images) ? v.images : undefined,
    }))
  }

  // 解析規格數據 - 从变体中自动生成规格选项
  const getSpecificationOptions = (): Record<string, string[]> => {
    const variants = getVariants()
    
    // 如果数据库中有 specificationOptions，优先使用
    if (product?.metadata?.specificationOptions) {
      return product.metadata.specificationOptions
    }
    
    // 否则从变体中自动生成
    if (variants.length === 0) return {}
    
    const specOptions: Record<string, Set<string>> = {}
    
    variants.forEach((variant) => {
      Object.entries(variant.specifications || {}).forEach(([key, value]) => {
        if (!specOptions[key]) {
          specOptions[key] = new Set()
        }
        specOptions[key].add(value)
      })
    })
    
    // 转换为数组格式
    const result: Record<string, string[]> = {}
    Object.entries(specOptions).forEach(([key, values]) => {
      result[key] = Array.from(values)
    })
    
    return result
  }

  // 根據選擇的規格查找匹配的變體
  useEffect(() => {
    if (!product) return

    const variants = getVariants()
    const specOptions = getSpecificationOptions()
    
    // 如果沒有規格選項，使用基礎價格
    if (Object.keys(specOptions).length === 0) {
      setCurrentPrice(formatPrice(product.price))
      setCurrentVariant(null)
      return
    }

    // 檢查是否所有規格都已選擇
    const allSpecsSelected = Object.keys(specOptions).every(
      (key) => selectedSpecifications[key]
    )

    if (allSpecsSelected) {
      // 查找匹配的變體
      const matchedVariant = variants.find((variant) => {
        return Object.keys(selectedSpecifications).every(
          (key) => variant.specifications[key] === selectedSpecifications[key]
        )
      })

      if (matchedVariant) {
        setCurrentVariant(matchedVariant)
        setCurrentPrice(matchedVariant.price)
        // 當選擇變體時，重置圖片索引
        setSelectedImage(0)
        // 强制触发图片更新
        if (matchedVariant.images && matchedVariant.images.length > 0) {
          // 变体有图片，会通过 getDisplayImages 自动切换
        } else if (matchedVariant.image) {
          // 变体有单张图片，会通过 getDisplayImages 自动切换
        }
      } else {
        // 沒有匹配的變體，使用最便宜的變體價格
        if (variants.length > 0) {
          const cheapestVariant = variants.reduce((min, variant) => 
            variant.price < min.price ? variant : min
          )
          setCurrentVariant(null)
          setCurrentPrice(cheapestVariant.price)
        } else {
          setCurrentVariant(null)
          setCurrentPrice(formatPrice(product.price))
        }
      }
    } else {
      // 規格未完全選擇，顯示最便宜的變體價格
      if (variants.length > 0) {
        const cheapestVariant = variants.reduce((min, variant) => 
          variant.price < min.price ? variant : min
        )
        setCurrentVariant(null)
        setCurrentPrice(cheapestVariant.price)
        // 重置圖片索引（回到商品默認圖片）
        setSelectedImage(0)
      } else {
        setCurrentVariant(null)
        setCurrentPrice(formatPrice(product.price))
        // 重置圖片索引
        setSelectedImage(0)
      }
    }
  }, [selectedSpecifications, product])

  // 當變體改變時，重置圖片索引並確保圖片正確顯示
  useEffect(() => {
    if (!product) return
    
    // 當變體改變時，重置圖片索引為 0
    setSelectedImage(0)
  }, [currentVariant?.id, product])

  // 處理規格選擇：再次點擊相同選項時取消選擇
  const handleSpecificationChange = (specKey: string, value: string) => {
    setSelectedSpecifications((prev) => {
      // 如果點擊的是已經選中的選項，則取消選擇
      if (prev[specKey] === value) {
        const newSpecs = { ...prev }
        delete newSpecs[specKey]
        return newSpecs
      }
      // 否則設置為選中的值
      return {
        ...prev,
        [specKey]: value,
      }
    })
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    notFound()
  }

  // 移除 markdown 格式（如粗体标记）
  const removeMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除 **粗体**
      .replace(/__(.*?)__/g, '$1') // 移除 __粗体__
      .replace(/\*(.*?)\*/g, '$1') // 移除 *斜体*
      .replace(/_(.*?)_/g, '$1') // 移除 _斜体_
      .replace(/~~(.*?)~~/g, '$1') // 移除 ~~删除线~~
      .replace(/`(.*?)`/g, '$1') // 移除 `代码`
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，只保留文本
  }

  const handleAddToCart = () => {
    // 檢查是否有規格但未完全選擇
    const specOptions = getSpecificationOptions()
    const hasSpecs = Object.keys(specOptions).length > 0
    const allSpecsSelected = hasSpecs 
      ? Object.keys(specOptions).every((key) => selectedSpecifications[key])
      : true

    if (hasSpecs && !allSpecsSelected) {
      alert('請選擇所有規格')
      return
    }

    // 獲取當前顯示的圖片（優先使用變體圖片）
    const currentDisplayImage = allImages.length > 0 ? allImages[0] : (product.image || '')
    
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: currentDisplayImage,
      quantity,
      variantId: currentVariant?.id,
      specifications: Object.keys(selectedSpecifications).length > 0 
        ? selectedSpecifications 
        : undefined,
    })
    
    // 顯示提示（可以之後改用 toast）
    const specText = currentVariant 
      ? ` (${Object.values(selectedSpecifications).join(', ')})`
      : ''
    alert(`已將 ${product.name}${specText} x${quantity} 加入購物車！`)
  }

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // 合併所有圖片：優先使用商品默認圖片，只有當買家選擇變體且變體有圖片時，才切換到變體圖片
  const getDisplayImages = (): string[] => {
    // 如果有選中的變體且變體有圖片，使用變體圖片
    if (currentVariant) {
      if (currentVariant.images && currentVariant.images.length > 0) {
        return currentVariant.images
      }
      if (currentVariant.image) {
        return [currentVariant.image]
      }
    }
    
    // 優先使用商品 images 陣列
    if (product.images && product.images.length > 0) {
      return product.images
    }
    // 如果沒有 images 陣列，使用 image 主圖
    if (product.image) {
      return [product.image]
    }
    return []
  }
  
  const allImages = getDisplayImages()

  // 確保 selectedImage 不會超出範圍
  const currentImageIndex = Math.min(selectedImage, allImages.length - 1)
  const currentImage = allImages[currentImageIndex] || '/placeholder.jpg'

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 商品圖片區域 */}
        <div className="space-y-4">
          {/* 主圖 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* 縮圖 - 當有多張圖片時顯示 */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all bg-muted ${
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品資訊區域 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{removeMarkdown(product.name)}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                NT$ {currentPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 規格選擇器 */}
          {(() => {
            const specOptions = getSpecificationOptions()
            const variants = getVariants()
            
            if (Object.keys(specOptions).length === 0) {
              return null
            }

            return (
              <div className="space-y-4 pt-4 border-t">
                {Object.entries(specOptions).map(([specKey, options]) => (
                  <div key={specKey} className="space-y-2">
                    <span className="text-sm font-medium">{specKey}:</span>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => {
                        const isSelected = selectedSpecifications[specKey] === option
                        // 檢查該選項是否可用（是否有對應的變體）
                        // 临时禁用检查，让所有选项都可用
                        const isAvailable = true
                        // const isAvailable = variants.some((variant) => {
                        //   // 檢查該變體是否有這個選項值
                        //   if (variant.specifications[specKey] !== option) return false
                        //   // 檢查其他已選擇的規格是否匹配
                        //   return Object.keys(selectedSpecifications).every((key) => {
                        //     if (key === specKey) return true // 跳過當前規格
                        //     return !selectedSpecifications[key] || variant.specifications[key] === selectedSpecifications[key]
                        //   })
                        // })

                        return (
                          <button
                            key={option}
                            onClick={() => handleSpecificationChange(specKey, option)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-md border text-sm transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : isAvailable
                                ? 'bg-background hover:bg-muted border-border'
                                : 'bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {product.description && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                className="text-muted-foreground"
                components={{
                  h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                  li: ({ ...props }) => <li className="ml-4" {...props} />,
                  strong: ({ ...props }) => <strong className="font-bold" {...props} />,
                  em: ({ ...props }) => <em className="italic" {...props} />,
                  code: ({ inline, ...props }: any) => 
                    inline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                    ),
                  a: ({ ...props }: any) => (
                    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  img: ({ ...props }: any) => (
                    <img className="rounded-lg my-4 max-w-full" {...props} />
                  ),
                }}
              >
                {product.description}
              </ReactMarkdown>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            {/* 數量選擇 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">數量:</span>
              <div className="flex items-center gap-2 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncreaseQuantity}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 加入購物車按鈕 */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg"
              size="lg"
              disabled={
                (() => {
                  const specOptions = getSpecificationOptions()
                  const hasSpecs = Object.keys(specOptions).length > 0
                  if (!hasSpecs) return false
                  
                  const allSpecsSelected = Object.keys(specOptions).every(
                    (key) => selectedSpecifications[key]
                  )
                  return !allSpecsSelected
                })()
              }
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {(() => {
                const specOptions = getSpecificationOptions()
                const hasSpecs = Object.keys(specOptions).length > 0
                const allSpecsSelected = hasSpecs 
                  ? Object.keys(specOptions).every((key) => selectedSpecifications[key])
                  : true
                
                if (!allSpecsSelected) return '請選擇規格'
                return '加入購物車'
              })()}
            </Button>
          </div>

          {/* 商品詳情 */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">分類:</span>
              <span className="text-sm font-medium">{product.category || '未分類'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

