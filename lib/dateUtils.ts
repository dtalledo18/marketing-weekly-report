// ── lib/dateUtils.ts ─────────────────────────────────────────
// All display strings derived from startDate / endDate.
// No more range or shortRange strings needed.

const DAYS_SHORT   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December']

function ordinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// "Jun 1st - 5th"  |  "Jun 29th - Jul 3rd"
export function buildFullRange(start: Date, end: Date): string {
    const sMonth = MONTHS_SHORT[start.getMonth()]
    const eMonth = MONTHS_SHORT[end.getMonth()]
    const sDay   = ordinal(start.getDate())
    const eDay   = ordinal(end.getDate())
    if (sMonth === eMonth) return `${sMonth} ${sDay} - ${eDay}`
    return `${sMonth} ${sDay} - ${eMonth} ${eDay}`
}

// "MON 1 – FRI 5"
export function buildShortRange(start: Date, end: Date): string {
    return `${DAYS_SHORT[start.getDay()]} ${start.getDate()} – ${DAYS_SHORT[end.getDay()]} ${end.getDate()}`
}

// Accepts ISO string or Date, returns { fullRange, shortRange } or fallback strings
export function getRangeStrings(startDate: string | Date | null, endDate: string | Date | null): {
    fullRange: string
    shortRange: string
} {
    if (!startDate || !endDate) return { fullRange: '—', shortRange: '—' }
    const s = new Date(startDate)
    const e = new Date(endDate)
    return {
        fullRange:  buildFullRange(s, e),
        shortRange: buildShortRange(s, e),
    }
}