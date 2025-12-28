import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export interface CurrentUser {
  id: string
  clerkId: string
  email: string
  name: string | null
  image: string | null
  role: 'ADMIN' | 'CUSTOMER'
}

/**
 * 获取当前登录用户信息
 * @returns 用户信息或 null
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
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
      image: true,
      role: true,
    },
  })

  if (!user) {
    return null
  }

  return user as CurrentUser
}




