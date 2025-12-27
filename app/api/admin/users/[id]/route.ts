import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      )
    }

    // 更新用户角色
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: body.role as UserRole,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '用戶角色已更新',
      data: user,
    })
  } catch (error) {
    console.error('更新用戶角色錯誤:', error)
    return NextResponse.json(
      {
        error: '無法更新用戶角色',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

