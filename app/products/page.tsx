"use client"

import Link from "next/link"
import Image from "next/image"
import { mockProducts } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductsPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">商品列表</h1>
        <p className="text-muted-foreground">瀏覽我們精選的商品</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </Link>
            <CardHeader>
              <Link href={`/products/${product.slug}`}>
                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                  {product.name}
                </CardTitle>
              </Link>
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  NT$ {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  庫存: {product.stock}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/products/${product.slug}`} className="w-full">
                <Button className="w-full">查看詳情</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

