import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'

export interface AdminUser {
  id: string
  clerkId: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CUSTOMER'
}

/**
 * 检查当前用户是否为管理员
 * @returns 如果是管理员，返回用户信息；否则返回 null
 */
export async function checkAdminAuth(): Promise<AdminUser | null> {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return user as AdminUser
}

/**
 * 检查管理员权限，如果不是管理员则重定向
 * @param redirectTo 重定向路径，默认为首页
 * @returns 管理员用户信息
 */
export async function requireAdmin(redirectTo: string = '/'): Promise<AdminUser> {
  const user = await checkAdminAuth()
  
  if (!user) {
    redirect(redirectTo)
  }

  return user
}




