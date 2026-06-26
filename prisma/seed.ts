import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const WEEKS_DATA = [
    {
        label: "Week 1 — May 18–22",
        range: "May 18th through May 22nd",
        shortRange: "MON 18 – FRI 22",
        contactsNeeded: "21.0k",
        meta: [
            { name: "Reach", value: "46.3k" },
            { name: "Frequency", value: "1.74" },
            { name: "Impressions", value: "14.4k" },
        ],
        days: [
            { name: "MONDAY", leads: 1 },
            { name: "TUESDAY", leads: 7 },
            { name: "WEDNESDAY", leads: 6 },
            { name: "THURSDAY", leads: 7 },
            { name: "FRIDAY", leads: 5 },
        ],
    },
    {
        label: "Week 2 — May 25–29",
        range: "May 25th through May 29th",
        shortRange: "MON 25 – FRI 29",
        contactsNeeded: "21.5k",
        meta: [
            { name: "Reach", value: "67.5k" },
            { name: "Frequency", value: "1.98" },
            { name: "Impressions", value: "20.3k" },
        ],
        days: [
            { name: "MONDAY", leads: 3 },
            { name: "TUESDAY", leads: 10 },
            { name: "WEDNESDAY", leads: 3 },
            { name: "THURSDAY", leads: 2 },
            { name: "FRIDAY", leads: 9 },
        ],
    },
    {
        label: "Week 3 — Jun 1–5",
        range: "June 1st through June 5th",
        shortRange: "MON 1 – FRI 5",
        contactsNeeded: "22.5k",
        meta: [
            { name: "Reach", value: "71.3k" },
            { name: "Frequency", value: "1.98" },
            { name: "Impressions", value: "20.3k" },
        ],
        days: [
            { name: "MONDAY", leads: 5 },
            { name: "TUESDAY", leads: 3 },
            { name: "WEDNESDAY", leads: 4 },
            { name: "THURSDAY", leads: 9 },
            { name: "FRIDAY", leads: 6 },
        ],
    },
    {
        label: "Week 4 — Jun 8–12",
        range: "June 8th through June 12th",
        shortRange: "MON 8 – FRI 12",
        contactsNeeded: "22.5k",
        meta: [
            { name: "Reach", value: "71.3k" },
            { name: "Frequency", value: "1.98" },
            { name: "Impressions", value: "20.3k" },
        ],
        days: [
            { name: "MONDAY", leads: 13 },
            { name: "TUESDAY", leads: 10 },
            { name: "WEDNESDAY", leads: 4 },
            { name: "THURSDAY", leads: 2 },
            { name: "FRIDAY", leads: 3 },
        ],
    },
    {
        label: "Week 5 — Jun 15–19",
        range: "June 15th through June 19th",
        shortRange: "MON 15 – FRI 19",
        contactsNeeded: "19k",
        meta: [
            { name: "Reach", value: "41.75k" },
            { name: "Frequency", value: "1.51" },
            { name: "Impressions", value: "58.7k" },
        ],
        days: [
            { name: "Monday", leads: 10 },
            { name: "Tuesday", leads: 10 },
            { name: "Wednesday", leads: 10 },
            { name: "Thursday", leads: 10 },
            { name: "Friday", leads: 7 },
        ],
    },
]

async function main() {
    console.log('Seeding...')

    for (const week of WEEKS_DATA) {
        await prisma.weeklyReport.create({ data: week })
        console.log(`✓ ${week.label}`)
    }

    console.log('Done!')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())