import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        if (body.date) body.date = new Date(body.date)
        if (body.amount) body.amount = parseFloat(body.amount)

        const invoice = await prisma.invoice.update({
            where: { id },
            data: body,
        })
        return NextResponse.json(invoice)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.invoice.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }
}