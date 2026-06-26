import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const weeks = await prisma.weeklyReport.findMany({
        include: { invoices: { orderBy: { date: 'asc' } } },
        orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(weeks)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { label, range, shortRange, contactsNeeded, days, meta } = body

        if (!label || !range || !shortRange) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const week = await prisma.weeklyReport.create({
            data: {
                label,
                range,
                shortRange,
                contactsNeeded: contactsNeeded || '0',
                days: days || [
                    { name: 'Monday',    leads: 0 },
                    { name: 'Tuesday',   leads: 0 },
                    { name: 'Wednesday', leads: 0 },
                    { name: 'Thursday',  leads: 0 },
                    { name: 'Friday',    leads: 0 },
                ],
                meta: meta || [
                    { name: 'Reach',       value: '0' },
                    { name: 'Frequency',   value: '0' },
                    { name: 'Impressions', value: '0' },
                ],
            },
            include: { invoices: true },
        })

        return NextResponse.json(week, { status: 201 })
    } catch (e) {
        console.error('POST /api/weeks error:', e)  // ← ya lo tienes
        return NextResponse.json({ error: String(e) }, { status: 500 })  // ← cambiar esto para ver el error real
    }
}