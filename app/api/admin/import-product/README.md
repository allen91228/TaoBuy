# 商品匯入 API

## 端點

`POST /api/admin/import-product`

## 說明

此 API 用於匯入商品到系統中。只有管理員（Admin）可以訪問此 API。

## 認證

- 需要登入（Clerk 認證）
- 需要管理員權限（資料庫中 User 的 role 必須為 `ADMIN`）

## 請求格式

### Headers

```
Content-Type: application/json
Authorization: Bearer <Clerk Session Token>
```

### Request Body

```json
{
  "sourceUrl": "https://item.taobao.com/item.htm?id=123456789",  // 必填：淘寶網址
  "title": "商品標題",                                              // 必填：商品標題
  "images": [                                                      // 必填：圖片陣列（至少一張）
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "originalPrice": 99.00,                                          // 必填：原始價格（人民幣）
  "price": 450.00,                                                 // 必填：本地售價（TWD）
  "description": "商品描述",                                        // 選填：商品描述
  "category": "電子產品",                                           // 選填：分類
  "specifications": {                                              // 選填：規格資料（任意 JSON 物件）
    "顏色": "紅色",
    "尺寸": "L",
    "材質": "純棉"
  },
  "externalId": "123456789"                                        // 選填：外部 ID（如果不提供則從 URL 提取）
}
```

## 回應格式

### 成功回應 (200)

```json
{
  "success": true,
  "message": "商品已建立" | "商品已更新",
  "product": {
    "id": "clx1234567890",
    "name": "商品標題",
    "slug": "商品標題",
    "externalId": "123456789",
    "importStatus": "DRAFT"
  }
}
```

### 錯誤回應

#### 401 Unauthorized
```json
{
  "error": "未授權：請先登入"
}
```

#### 403 Forbidden
```json
{
  "error": "禁止訪問：需要管理員權限"
}
```

#### 400 Bad Request
```json
{
  "error": "缺少必要欄位：sourceUrl, title, images 為必填"
}
```
或
```json
{
  "error": "價格必須為數字"
}
```

#### 409 Conflict
```json
{
  "error": "商品已存在或 slug 重複"
}
```

#### 500 Internal Server Error
```json
{
  "error": "伺服器錯誤：無法匯入商品"
}
```

## 邏輯說明

1. **認證檢查**：驗證用戶是否已登入
2. **權限檢查**：檢查用戶在資料庫中的角色是否為 `ADMIN`
3. **參數驗證**：驗證必要欄位是否存在且格式正確
4. **externalId 處理**：
   - 如果請求中提供了 `externalId`，則使用該值
   - 否則嘗試從 `sourceUrl` 中提取（支援常見的淘寶 URL 格式）
   - 如果都無法取得，則使用 URL 的 base64 編碼作為 fallback
5. **slug 生成**：從商品標題自動生成 URL-friendly slug
6. **Upsert 操作**：
   - 如果 `externalId` 已存在，則更新商品
   - 如果不存在，則建立新商品
7. **預設值**：
   - `importStatus`: `DRAFT`（草稿狀態）
   - `stock`: 0
   - `isActive`: true

## 範例請求

```bash
curl -X POST http://localhost:3000/api/admin/import-product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "sourceUrl": "https://item.taobao.com/item.htm?id=123456789",
    "title": "無線藍牙耳機",
    "images": ["https://example.com/earphone.jpg"],
    "originalPrice": 99.00,
    "price": 450.00,
    "description": "高品質無線藍牙耳機",
    "category": "電子產品",
    "specifications": {
      "顏色": "黑色",
      "電池續航": "30小時"
    }
  }'
```

## 注意事項

1. **用戶必須先在資料庫中存在**：使用此 API 前，用戶必須已經在資料庫的 `User` 表中存在，且 `role` 欄位必須設為 `ADMIN`
2. **externalId 的唯一性**：`externalId` 用於判斷商品是否已存在，相同的 `externalId` 會觸發更新而非新增
3. **草稿狀態**：所有匯入的商品預設為 `DRAFT` 狀態，需要人工確認後才能上架（更新 `importStatus` 為 `PUBLISHED`）
4. **Slug 唯一性**：如果生成的 slug 已存在，會自動加上時間戳來確保唯一性

