"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  id: string
  quantity: number
  price: any
  variantId: string | null
  specifications: any
  product: {
    id: string
    name: string
    image: string | null
    images: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: any
  shippingAddress: string
  paymentMethod: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  items: OrderItem[]
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderId, setOrderId] = useState<string>("")
  const [formData, setFormData] = useState({
    status: "PENDING",
    paymentStatus: "PENDING",
  })

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`)
        const data = await response.json()

        if (data.success) {
          const o = data.data
          setOrder(o)
          setFormData({
            status: o.status,
            paymentStatus: o.paymentStatus,
          })
        }
      } catch (error) {
        console.error("獲取訂單錯誤:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/admin/orders")
      } else {
        alert(data.error || "更新失敗")
      }
    } catch (error) {
      console.error("更新訂單錯誤:", error)
      alert("更新失敗")
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: any): string => {
    return `NT$ ${parseFloat(price.toString()).toLocaleString()}`
  }

  if (loading) {
    return <div className="text-center py-8">載入中...</div>
  }

  if (!order) {
    return <div className="text-center py-8">訂單不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">訂單詳情</h1>
          <p className="text-muted-foreground">訂單號: {order.orderNumber}</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 訂單資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>訂單資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">訂單號</label>
              <p className="text-lg font-medium">{order.orderNumber}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">用戶</label>
              <p>{order.user.name || "-"}</p>
              <p className="text-sm text-muted-foreground">{order.user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">總金額</label>
              <p className="text-lg font-bold">{formatPrice(order.total)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">送貨地址</label>
              <p>{order.shippingAddress}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">支付方式</label>
              <p>{order.paymentMethod || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">建立時間</label>
              <p>{new Date(order.createdAt).toLocaleString("zh-TW")}</p>
            </div>
          </CardContent>
        </Card>

        {/* 狀態更新 */}
        <Card>
          <CardHeader>
            <CardTitle>更新狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">訂單狀態</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 mt-2"
                >
                  <option value="PENDING">待處理</option>
                  <option value="PROCESSING">處理中</option>
                  <option value="SHIPPED">已出貨</option>
                  <option value="DELIVERED">已送達</option>
                  <option value="CANCELLED">已取消</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">支付狀態</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 mt-2"
                >
                  <option value="PENDING">待付款</option>
                  <option value="PAID">已付款</option>
                  <option value="FAILED">付款失敗</option>
                  <option value="REFUNDED">已退款</option>
                </select>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "更新中..." : "更新狀態"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 訂單商品 */}
      <Card>
        <CardHeader>
          <CardTitle>訂單商品</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                <div className="relative w-20 h-20 shrink-0">
                  <Image
                    src={item.product.image || item.product.images[0] || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  {item.specifications && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.price)}</p>
                  <p className="text-sm text-muted-foreground">x {item.quantity}</p>
                  <p className="font-medium mt-1">
                    {formatPrice(parseFloat(item.price.toString()) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
