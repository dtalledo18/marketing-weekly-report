export type Platform =
    | 'META'
    | 'TWITTER_X'
    | 'RUNWAY_AI'
    | 'SMS_VONAGE'
    | 'PROPSTREAM'
    | 'SMARTER_CONTACTS'
    | 'CHATGPT_ADS'
    | 'OTHER'

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE'

export interface DayData {
    name: string
    leads: number
}

export interface MetaData {
    name: string
    value: string
}

export interface Invoice {
    id: string
    date: string
    month: string
    description: string
    platform: Platform
    amount: number | null
    paymentStatus: PaymentStatus
    notes: string | null
    weeklyReportId: string
    createdAt: string
}

export interface WeeklyReport {
    id: string
    label: string
    range: string
    shortRange: string
    contactsNeeded: string
    days: DayData[]
    meta: MetaData[]
    createdAt: string
    invoices: Invoice[]
}

export const PLATFORM_LABELS: Record<Platform, string> = {
    META: 'Meta',
    TWITTER_X: 'Twitter/X',
    RUNWAY_AI: 'Runway AI',
    SMS_VONAGE: 'SMS/Vonage',
    PROPSTREAM: 'Propstream',
    SMARTER_CONTACTS: 'SmarterContacts',
    CHATGPT_ADS: 'ChatGPT Ads',
    OTHER: 'Other',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
    META:             '#60a5fa', // blue-400
    TWITTER_X:        '#e2e8f0', // slate-200
    RUNWAY_AI:        '#c084fc', // purple-400
    SMS_VONAGE:       '#fb7185', // rose-400
    PROPSTREAM:       '#34d399', // emerald-400
    SMARTER_CONTACTS: '#22d3ee', // cyan-400
    CHATGPT_ADS:      '#fbbf24', // amber-400
    OTHER:            '#94a3b8', // slate-400
}

export const STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
    PAID:    { bg: 'rgba(5,150,105,0.15)',  text: '#34d399', border: 'rgba(52,211,153,0.3)' },
    PENDING: { bg: 'rgba(217,119,6,0.15)',  text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    OVERDUE: { bg: 'rgba(225,29,72,0.15)',  text: '#fb7185', border: 'rgba(251,113,133,0.3)' },
}