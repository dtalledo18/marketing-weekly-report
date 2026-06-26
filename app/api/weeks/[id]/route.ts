import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const week = await prisma.weeklyReport.update({
            where: { id },
            data: body,
            include: { invoices: true },
        })
        return NextResponse.json(week)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update week' }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.weeklyReport.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete week' }, { status: 500 })
    }
}