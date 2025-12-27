"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, User, Search } from "lucide-react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-store"

export function Header() {
  const { isSignedIn } = useUser()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <span className="text-xl font-bold">淘買</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="搜尋商品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
            <span className="sr-only">搜尋</span>
          </Button>
        </form>

        {/* Navigation Menu - 預留空間 */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* 導覽選單項目可以在此加入 */}
        </nav>

        {/* Right side: User & Cart */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Shopping Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">購物車</span>
            </Button>
          </Link>

          {/* User Authentication */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                登入
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}

