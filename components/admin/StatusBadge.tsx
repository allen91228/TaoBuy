import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      // 订单状态
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      
      // 支付状态
      PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      
      // 商品状态
      PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      SYNC_ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      
      // 用户角色
      ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      CUSTOMER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    }
    
    return statusMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const getStatusText = (status: string) => {
    const statusTextMap: Record<string, string> = {
      PENDING: "待處理",
      PROCESSING: "處理中",
      SHIPPED: "已出貨",
      DELIVERED: "已送達",
      CANCELLED: "已取消",
      PAID: "已付款",
      FAILED: "付款失敗",
      REFUNDED: "已退款",
      PUBLISHED: "已發布",
      DRAFT: "草稿",
      SYNC_ERROR: "同步錯誤",
      ADMIN: "管理員",
      CUSTOMER: "客戶",
    }
    
    return statusTextMap[status] || status
  }

  return (
    <Badge className={cn(getStatusColor(status), className)}>
      {getStatusText(status)}
    </Badge>
  )
}


