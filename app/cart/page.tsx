"use client"

import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const totalItems = useCartStore((state) => state.getTotalItems())

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[60vh]">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold mb-2">購物車是空的</h1>
            <p className="text-muted-foreground mb-6">
              快去選購一些商品吧！
            </p>
            <Link href="/products">
              <Button size="lg">瀏覽商品</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">購物車</h1>
        <p className="text-muted-foreground">
          共有 {totalItems} 件商品
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 購物車商品列表 */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* 商品圖片 */}
                  {item.image && (
                    <Link href={`/products/${item.id}`}>
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    </Link>
                  )}

                  {/* 商品資訊 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.id}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        NT$ {item.price.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* 數量控制 */}
                        <div className="flex items-center gap-2 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* 移除按鈕 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      小計: NT$ {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 清空購物車按鈕 */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空購物車
            </Button>
          </div>
        </div>

        {/* 訂單摘要 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>訂單摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">商品數量</span>
                <span className="font-medium">{totalItems} 件</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">小計</span>
                <span className="font-medium">
                  NT$ {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">運費</span>
                <span className="font-medium">NT$ 0</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>總計</span>
                  <span className="text-primary">
                    NT$ {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                前往結帳
              </Button>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  繼續購物
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
