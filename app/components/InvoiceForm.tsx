'use client'

import { useState, useRef, useEffect } from 'react'
import { Invoice, Platform, PaymentStatus, Currency, PLATFORM_LABELS, PLATFORM_COLORS, STATUS_COLORS, CURRENCY_LABELS } from '@/lib/types'

interface InvoiceFormProps {
    weeklyReportId: string
    onCreated: (invoice: Invoice) => void
}

const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[]
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const STATUSES: PaymentStatus[] = ['PAID', 'PENDING', 'OVERDUE']
const CURRENCIES: Currency[] = ['USD', 'CREDITS']

const STATUS_LABELS: Record<PaymentStatus, string> = {
    PAID: 'Paid',
    PENDING: 'Pending',
    OVERDUE: 'Overdue',
}

// ── Custom Dropdown ───────────────────────────────────────────
function CustomDropdown<T extends string>({
                                              value,
                                              options,
                                              onChange,
                                              renderOption,
                                              renderSelected,
                                          }: {
    value: T
    options: T[]
    onChange: (v: T) => void
    renderOption: (v: T) => React.ReactNode
    renderSelected: (v: T) => React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    transition: 'border-color 0.2s',
                    ...(open ? { borderColor: '#0070f3' } : {}),
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {renderSelected(value)}
                </span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M1 1l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: '#0f1f33',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    zIndex: 9999,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                }}>
                    {options.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setOpen(false) }}
                            style={{
                                width: '100%',
                                background: opt === value ? 'rgba(0,112,243,0.1)' : 'transparent',
                                border: 'none',
                                padding: '9px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = opt === value ? 'rgba(0,112,243,0.1)' : 'transparent')}
                        >
                            {renderOption(opt)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Platform Badge ────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: Platform }) {
    const color = PLATFORM_COLORS[platform]
    return (
        <span style={{
            background: color + '22',
            color,
            border: `1px solid ${color}44`,
            borderRadius: 10,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
        }}>
            {PLATFORM_LABELS[platform]}
        </span>
    )
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: PaymentStatus }) {
    const s = STATUS_COLORS[status]
    return (
        <span style={{
            background: s.bg,
            color: s.text,
            border: `1px solid ${s.border}`,
            borderRadius: 10,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
        }}>
            {STATUS_LABELS[status]}
        </span>
    )
}

// ── Month Badge ───────────────────────────────────────────────
function MonthBadge({ month }: { month: string }) {
    return (
        <span style={{
            background: 'rgba(124,58,237,0.18)',
            color: '#c4b5fd',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 10,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
        }}>
            {month}
        </span>
    )
}

// ── Currency Badge ────────────────────────────────────────────
function CurrencyBadge({ currency }: { currency: Currency }) {
    const isCredits = currency === 'CREDITS'
    return (
        <span style={{
            background: isCredits ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
            color: isCredits ? '#fbbf24' : '#34d399',
            border: `1px solid ${isCredits ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
            borderRadius: 10,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
        }}>
            {CURRENCY_LABELS[currency]}
        </span>
    )
}

// ── Main Component ────────────────────────────────────────────
export default function InvoiceForm({ weeklyReportId, onCreated }: InvoiceFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

    const [form, setForm] = useState({
        date: today,
        month: currentMonth,
        description: '',
        platform: 'META' as Platform,
        amount: '',
        currency: 'USD' as Currency,
        paymentStatus: 'PAID' as PaymentStatus,
        notes: '',
    })

    const resetForm = () => setForm({
        date: today,
        month: currentMonth,
        description: '',
        platform: 'META',
        amount: '',
        currency: 'USD',
        paymentStatus: 'PAID',
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, weeklyReportId }),
            })
            if (!res.ok) throw new Error('Failed')
            const invoice = await res.json()
            onCreated(invoice)
            setOpen(false)
            resetForm()
        } catch {
            alert('Error creating invoice')
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="add-invoice-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Invoice
            </button>
        )
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">New Invoice</h2>
                    <button className="modal-close" onClick={() => setOpen(false)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* Date + Month */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Month</label>
                            <CustomDropdown<string>
                                value={form.month}
                                options={MONTHS}
                                onChange={v => setForm(f => ({ ...f, month: v }))}
                                renderSelected={v => <MonthBadge month={v} />}
                                renderOption={v => <MonthBadge month={v} />}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Credits Smarter Contact"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Platform + Amount + Currency */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Platform</label>
                            <CustomDropdown<Platform>
                                value={form.platform}
                                options={PLATFORMS}
                                onChange={v => setForm(f => ({ ...f, platform: v }))}
                                renderSelected={v => <PlatformBadge platform={v} />}
                                renderOption={v => <PlatformBadge platform={v} />}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount</label>
                            {/* Amount input with inline currency selector */}
                            <div style={{
                                display: 'flex',
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.05)',
                                transition: 'border-color 0.2s',
                            }}
                                 onFocusCapture={e => (e.currentTarget.style.borderColor = '#0070f3')}
                                 onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                            >
                                {/* Currency prefix select */}
                                <select
                                    value={form.currency}
                                    onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: 'none',
                                        borderRight: '1px solid rgba(255,255,255,0.1)',
                                        color: form.currency === 'CREDITS' ? '#fbbf24' : '#34d399',
                                        fontFamily: 'inherit',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        padding: '0 10px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        flexShrink: 0,
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c} value={c} style={{ background: '#0f1f33', color: '#e2e8f0' }}>
                                            {CURRENCY_LABELS[c]}
                                        </option>
                                    ))}
                                </select>
                                {/* Amount number input */}
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontFamily: 'inherit',
                                        fontSize: 14,
                                        padding: '8px 12px',
                                        outline: 'none',
                                        width: '100%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status + Notes */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Payment Status</label>
                            <CustomDropdown<PaymentStatus>
                                value={form.paymentStatus}
                                options={STATUSES}
                                onChange={v => setForm(f => ({ ...f, paymentStatus: v }))}
                                renderSelected={v => <StatusBadge status={v} />}
                                renderOption={v => <StatusBadge status={v} />}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <input
                                className="form-input"
                                placeholder="Optional notes"
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={() => { setOpen(false); resetForm() }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}