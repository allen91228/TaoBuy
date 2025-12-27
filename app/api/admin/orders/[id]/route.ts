import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiSecretAuth } from '@/lib/api-secret-auth'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('獲取訂單錯誤:', error)
    return NextResponse.json(
      {
        error: '無法獲取訂單',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkApiSecretAuth(request)) {
      return NextResponse.json(
        { error: '未授權：API Secret 不正確' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 检查订单是否存在
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      )
    }

    // 更新订单
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status as OrderStatus,
        paymentStatus: body.paymentStatus as PaymentStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                images: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: '訂單已更新',
      data: order,
    })
  } catch (error) {
    console.error('更新訂單錯誤:', error)
    return NextResponse.json(
      {
        error: '無法更新訂單',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

