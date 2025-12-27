# 淘買 - 現代化全端電商網站

這是一個使用 Next.js 14+ (App Router)、TypeScript、Tailwind CSS、Prisma 和 Clerk 建立的現代化電商平台。

## 技術堆疊

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL (使用 Prisma ORM)
- **Auth**: Clerk
- **State Management**: Zustand (購物車)

## 專案結構

```
taobai/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根 Layout
│   ├── page.tsx           # 首頁
│   ├── (auth)/            # 認證相關路由
│   └── cart/              # 購物車頁面
├── components/
│   ├── ui/                # Shadcn UI 元件
│   └── layout/            # Layout 元件（Header, Footer）
├── lib/
│   ├── prisma.ts          # Prisma Client
│   └── utils.ts           # 工具函數
├── store/
│   └── cart-store.ts      # Zustand 購物車狀態管理
└── prisma/
    └── schema.prisma      # 資料庫 Schema
```

## 安裝步驟

1. **安裝依賴套件**
   ```bash
   npm install
   ```

2. **設定環境變數**

   建立 `.env.local` 檔案，並填入以下環境變數：

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/taobai?schema=public"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_key_here

   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

3. **設定 Clerk**

   - 前往 [Clerk Dashboard](https://dashboard.clerk.com/) 建立新應用
   - 取得 Publishable Key 和 Secret Key
   - 將上述 Key 填入 `.env.local`

4. **設定資料庫**

   - 確保 PostgreSQL 已安裝並運行
   - 更新 `.env.local` 中的 `DATABASE_URL`
   - 執行 Prisma migration：
     ```bash
     npx prisma generate
     npx prisma db push
     ```

5. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

   訪問 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 功能特色

- ✅ 響應式設計
- ✅ 使用者認證（Clerk）- 登入/註冊頁面
- ✅ 購物車狀態管理（Zustand）- 包含 LocalStorage 持久化
- ✅ 現代化 UI 元件（Shadcn UI）
- ✅ TypeScript 類型安全
- ✅ Prisma ORM 資料庫管理
- ✅ 商品列表頁面（Grid 展示）
- ✅ 商品詳情頁面（圖片、價格、加入購物車）
- ✅ 購物車頁面（商品管理、總金額計算）
- ✅ 首頁商品 Grid 展示

## 已實作功能

### 購物車 Store (Zustand)
- ✅ 新增商品到購物車
- ✅ 移除商品
- ✅ 更新商品數量
- ✅ 計算總金額
- ✅ LocalStorage 持久化儲存（key: `cart-storage`）

### 會員系統
- ✅ Clerk 認證整合
- ✅ 登入頁面 (`/sign-in`)
- ✅ 註冊頁面 (`/sign-up`)
- ✅ Header 顯示登入狀態和使用者頭像

### 商品展示
- ✅ 首頁商品 Grid（顯示前 6 個商品）
- ✅ 商品列表頁面 (`/products`)
- ✅ 商品詳情頁面 (`/products/[slug]`)
- ✅ 商品圖片、價格、描述展示
- ✅ 加入購物車功能
- ✅ 數量選擇功能

### 購物車功能
- ✅ 購物車頁面 (`/cart`)
- ✅ 顯示所有商品
- ✅ 數量調整
- ✅ 移除商品
- ✅ 計算總金額
- ✅ 清空購物車

## 假資料

目前使用 `lib/mock-data.ts` 中的假資料進行展示，包含 8 個範例商品。

## 後續開發

- [ ] 連接真實資料庫（Prisma）
- [ ] 訂單系統
- [ ] 付款整合
- [ ] 管理後台
- [ ] 商品搜尋與篩選
- [ ] 商品分類頁面

