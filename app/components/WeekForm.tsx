'use client'

import { useState, useEffect } from 'react'
import { WeeklyReport } from '@/lib/types'

interface WeekFormProps {
    onCreated: (week: WeeklyReport) => void
    weekCount: number
}

// ── Date helpers ──────────────────────────────────────────────

const DAYS        = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December']

function ordinal(n: number): string {
    const s = ['th','st','nd','rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// "June 22nd through June 26th"
function buildFullRange(start: Date, end: Date): string {
    const sMonth = MONTHS_SHORT[start.getMonth()]
    const eMonth = MONTHS_SHORT[end.getMonth()]
    const sDay   = ordinal(start.getDate())
    const eDay   = ordinal(end.getDate())
    if (sMonth === eMonth) return `${sMonth} ${sDay} - ${eDay}`
    return `${sMonth} ${sDay} - ${eMonth} ${eDay}`
}

// "MON 22 – FRI 26"
function buildShortRange(start: Date, end: Date): string {
    return `${DAYS[start.getDay()]} ${start.getDate()} – ${DAYS[end.getDay()]} ${end.getDate()}`
}

// Final label sent to DB: "Week 3 — June 22nd through June 26th"
function buildFinalLabel(name: string, start: Date, end: Date): string {
    return `${name.trim()} — ${buildFullRange(start, end)}`
}

// Calendar helpers
function startOfMonth(y: number, m: number) { return new Date(y, m, 1) }
function daysInMonth(y: number, m: number)  { return new Date(y, m + 1, 0).getDate() }
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}
function isBetween(d: Date, a: Date, b: Date) { return d > a && d < b }

// ── Mini Calendar ─────────────────────────────────────────────

interface CalendarProps {
    year: number
    month: number
    startDate: Date | null
    endDate: Date | null
    hoverDate: Date | null
    onDayClick: (d: Date) => void
    onDayHover: (d: Date) => void
    onPrev: () => void
    onNext: () => void
    showPrev: boolean
    showNext: boolean
}

function Calendar({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover, onPrev, onNext, showPrev, showNext }: CalendarProps) {
    const firstDow = startOfMonth(year, month).getDay()
    const total    = daysInMonth(year, month)
    const cells: (Date | null)[] = []

    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d))

    const rangeEnd = endDate ?? hoverDate

    function dayState(d: Date) {
        if (startDate && isSameDay(d, startDate)) return 'start'
        if (endDate   && isSameDay(d, endDate))   return 'end'
        if (startDate && !endDate && hoverDate && isSameDay(d, hoverDate)) return 'hover-end'
        if (startDate && rangeEnd && isBetween(d, startDate, rangeEnd))    return 'in-range'
        return 'none'
    }

    const bgMap: Record<string, string> = {
        start:      '#0070f3',
        end:        '#0070f3',
        'hover-end':'rgba(0,112,243,0.5)',
        'in-range': 'rgba(0,112,243,0.15)',
        none:       'transparent',
    }

    return (
        <div style={{ width: 240 }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button type="button" onClick={onPrev} disabled={!showPrev}
                        style={{ background: 'none', border: 'none', color: showPrev ? '#94a3b8' : 'transparent', cursor: showPrev ? 'pointer' : 'default', padding: '2px 8px', fontSize: 16, borderRadius: 4 }}>
                    ‹
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    {MONTHS_LONG[month]} {year}
                </span>
                <button type="button" onClick={onNext} disabled={!showNext}
                        style={{ background: 'none', border: 'none', color: showNext ? '#94a3b8' : 'transparent', cursor: showNext ? 'pointer' : 'default', padding: '2px 8px', fontSize: 16, borderRadius: 4 }}>
                    ›
                </button>
            </div>

            {/* DOW headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <span key={d} style={{ fontSize: 10, fontWeight: 700, color: '#475569', padding: '2px 0' }}>{d}</span>
                ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                {cells.map((d, i) => {
                    if (!d) return <div key={i} />
                    const state = dayState(d)
                    const isEdge = state === 'start' || state === 'end' || state === 'hover-end'
                    return (
                        <div key={i} onClick={() => onDayClick(d)} onMouseEnter={() => onDayHover(d)}
                             style={{
                                 textAlign: 'center', padding: '5px 0', fontSize: 12,
                                 fontWeight: isEdge ? 700 : 400,
                                 color: isEdge ? '#fff' : state === 'in-range' ? '#93c5fd' : '#cbd5e1',
                                 background: bgMap[state],
                                 borderRadius: isEdge ? 6 : 0,
                                 cursor: 'pointer', transition: 'background 0.1s', userSelect: 'none',
                             }}>
                            {d.getDate()}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────

export default function WeekForm({ onCreated, weekCount }: WeekFormProps) {
    const [open, setOpen]       = useState(false)
    const [loading, setLoading] = useState(false)

    const now = new Date()
    const [calYear,  setCalYear]  = useState(now.getFullYear())
    const [calMonth, setCalMonth] = useState(now.getMonth())

    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate,   setEndDate]   = useState<Date | null>(null)
    const [hoverDate, setHoverDate] = useState<Date | null>(null)
    const [picking,   setPicking]   = useState<'start' | 'end'>('start')

    // Only the short name — synced with weekCount once DB data arrives
    const [weekName, setWeekName] = useState(`Week ${weekCount + 1}`)
    useEffect(() => {
        setWeekName(`Week ${weekCount + 1}`)
    }, [weekCount])
    const [contactsNeeded, setContactsNeeded] = useState('')

    const fullRange  = startDate && endDate ? buildFullRange(startDate, endDate)  : ''
    const shortRange = startDate && endDate ? buildShortRange(startDate, endDate) : ''
    const finalLabel = startDate && endDate ? buildFinalLabel(weekName, startDate, endDate) : ''

    function handleDayClick(d: Date) {
        if (picking === 'start' || (startDate && d < startDate)) {
            setStartDate(d)
            setEndDate(null)
            setHoverDate(null)
            setPicking('end')
        } else {
            setEndDate(d)
            setPicking('start')
        }
    }

    function handleDayHover(d: Date) {
        if (picking === 'end' && startDate) setHoverDate(d)
    }

    function prevMonth() {
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
        else setCalMonth(m => m - 1)
    }
    function nextMonth() {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
        else setCalMonth(m => m + 1)
    }

    const cal2Month = calMonth === 11 ? 0 : calMonth + 1
    const cal2Year  = calMonth === 11 ? calYear + 1 : calYear

    function resetAll() {
        setStartDate(null); setEndDate(null); setHoverDate(null); setPicking('start')
        setWeekName(`Week ${weekCount + 1}`)
        setContactsNeeded('')
        setCalYear(now.getFullYear()); setCalMonth(now.getMonth())
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!startDate || !endDate) return
        setLoading(true)
        try {
            const res = await fetch('/api/weeks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label:          finalLabel,
                    range:          fullRange,
                    shortRange:     shortRange,
                    contactsNeeded: contactsNeeded,
                }),
            })
            if (!res.ok) throw new Error('Failed')
            const week = await res.json()
            onCreated(week)
            setOpen(false)
            resetAll()
        } catch {
            alert('Error creating weekly report')
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="add-week-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Weekly Report
            </button>
        )
    }

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); resetAll() } }}>
            <div className="modal-card" style={{ maxWidth: 580 }}>
                <div className="modal-header">
                    <h2 className="modal-title">New Weekly Report</h2>
                    <button className="modal-close" onClick={() => { setOpen(false); resetAll() }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* ── 1. Week Name ── */}
                    <div className="form-group">
                        <label className="form-label">Week Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Week 6"
                            value={weekName}
                            onChange={e => setWeekName(e.target.value)}
                            required
                        />
                        {/* Final label preview */}
                        {finalLabel && (
                            <div style={{ marginTop: 6, fontSize: 11, color: '#475569' }}>
                                Label: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{finalLabel}</span>
                            </div>
                        )}
                    </div>

                    {/* ── 2. Date Range ── */}
                    <div className="form-group">
                        <label className="form-label">
                            Date Range
                            <span style={{ marginLeft: 8, fontWeight: 400, color: '#475569', textTransform: 'none', letterSpacing: 0 }}>
                                {picking === 'start' ? '— select start date' : '— now select end date'}
                            </span>
                        </label>

                        <div style={{
                            display: 'flex', gap: 24,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, padding: '16px 20px',
                        }}>
                            <Calendar
                                year={calYear} month={calMonth}
                                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                                onDayClick={handleDayClick} onDayHover={handleDayHover}
                                onPrev={prevMonth} onNext={() => {}}
                                showPrev={true} showNext={false}
                            />
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                            <Calendar
                                year={cal2Year} month={cal2Month}
                                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                                onDayClick={handleDayClick} onDayHover={handleDayHover}
                                onPrev={() => {}} onNext={nextMonth}
                                showPrev={false} showNext={true}
                            />
                        </div>

                        {/* Range preview pills */}
                        {startDate && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Preview:</span>
                                <span style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)', color: '#60a5fa', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                                    {endDate ? fullRange : `${MONTHS_LONG[startDate.getMonth()]} ${ordinal(startDate.getDate())} → pick end`}
                                </span>
                                {endDate && (
                                    <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                                        {shortRange}
                                    </span>
                                )}
                                <button type="button"
                                        onClick={() => { setStartDate(null); setEndDate(null); setHoverDate(null); setPicking('start') }}
                                        style={{ background: 'none', border: 'none', color: '#475569', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>
                                    ✕ clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── 3. Contacts Needed ── */}
                    <div className="form-group">
                        <label className="form-label">Contacts Needed</label>
                        <input
                            className="form-input"
                            placeholder="e.g. 21.5k"
                            value={contactsNeeded}
                            onChange={e => setContactsNeeded(e.target.value)}
                            required   // ← esto
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={() => { setOpen(false); resetAll() }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || !startDate || !endDate}>
                            {loading ? 'Creating...' : 'Create Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}