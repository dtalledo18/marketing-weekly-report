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
        const { label, range, shortRange, contactsNeeded, days, meta, startDate, endDate } = body

        if (!label || !range || !shortRange) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const week = await prisma.weeklyReport.create({
            data: {
                label,
                range,
                shortRange,
                contactsNeeded: contactsNeeded || '0',
                startDate: startDate ? new Date(startDate) : null,
                endDate:   endDate   ? new Date(endDate)   : null,
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
        console.error('POST /api/weeks error:', e)
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}