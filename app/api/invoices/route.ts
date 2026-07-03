import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log('POST /api/invoices body:', JSON.stringify(body, null, 2))

        const invoice = await prisma.invoice.create({
            data: {
                weeklyReportId: body.weeklyReportId,
                date:           new Date(body.date),
                month:          body.month,
                description:    body.description,
                platform:       body.platform,
                amount:         body.amount ? parseFloat(body.amount) : null,
                currency:       body.currency ?? 'USD',
                paymentStatus:  body.paymentStatus || 'PENDING',
                notes:          body.notes || null,
            },
        })
        return NextResponse.json(invoice, { status: 201 })
    } catch (e) {
        console.error('POST /api/invoices error:', e)
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}