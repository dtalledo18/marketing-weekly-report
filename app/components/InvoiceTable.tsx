'use client'

import { useState } from 'react'
import { Invoice, Currency, PLATFORM_LABELS, PLATFORM_COLORS, STATUS_COLORS } from '@/lib/types'
import InvoiceForm from './InvoiceForm'

interface InvoiceTableProps {
    weeklyReportId: string
    invoices: Invoice[]
    onInvoiceAdded: (invoice: Invoice) => void
    onInvoiceDeleted: (id: string) => void
}

export default function InvoiceTable({ weeklyReportId, invoices, onInvoiceAdded, onInvoiceDeleted }: InvoiceTableProps) {
    const [deleting, setDeleting] = useState<string | null>(null)

    // Only sum USD invoices for the total (credits are a different unit)
    const totalUSD = invoices
        .filter(inv => inv.currency === 'USD')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0)

    const totalCredits = invoices
        .filter(inv => inv.currency === 'CREDITS')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0)

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this invoice?')) return
        setDeleting(id)
        try {
            await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
            onInvoiceDeleted(id)
        } catch {
            alert('Failed to delete invoice')
        } finally {
            setDeleting(null)
        }
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    }

    const formatAmount = (amount: number | null, currency: Currency) => {
        if (amount === null || amount === undefined) return '—'
        if (currency === 'CREDITS') {
            return (
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                    {amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} credits
                </span>
            )
        }
        return (
            <span style={{ color: '#34d399', fontWeight: 700 }}>
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        )
    }

    const formatTotals = () => {
        const parts: React.ReactNode[] = []
        if (totalUSD > 0) parts.push(
            <span key="usd" style={{ color: '#34d399', fontWeight: 700 }}>
                ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        )
        if (totalCredits > 0) parts.push(
            <span key="credits" style={{ color: '#fbbf24', fontWeight: 700 }}>
                {totalCredits.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} credits
            </span>
        )
        if (parts.length === 0) return null
        return parts.reduce((acc, el, i) =>
                i === 0 ? [el] : [...(acc as React.ReactNode[]), <span key={`sep-${i}`} style={{ color: '#64748b', margin: '0 4px' }}>+</span>, el],
            [] as React.ReactNode[]
        )
    }

    return (
        <div className="invoice-section">
            <div className="invoice-section-header">
                <div className="invoice-section-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
                        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>Invoices</span>
                    <span className="invoice-count">{invoices.length}</span>
                </div>
                <div className="invoice-section-right">
                    {invoices.length > 0 && (
                        <span className="invoice-total" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            Total:&nbsp;{formatTotals()}
                        </span>
                    )}
                    <InvoiceForm weeklyReportId={weeklyReportId} onCreated={onInvoiceAdded} />
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="invoice-empty">
                    No invoices yet for this week.
                </div>
            ) : (
                <div className="invoice-table-wrap">
                    <table className="invoice-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Month</th>
                            <th>Description</th>
                            <th>Platform</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoices.map(inv => {
                            const statusStyle = STATUS_COLORS[inv.paymentStatus]
                            const platformColor = PLATFORM_COLORS[inv.platform]
                            return (
                                <tr key={inv.id} className="invoice-row">
                                    <td className="inv-date">{formatDate(inv.date)}</td>
                                    <td>
                                        <span className="inv-month-badge">{inv.month}</span>
                                    </td>
                                    <td className="inv-description">
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
                                            <rect x="1" y="0.5" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                                            <path d="M3.5 4h6M3.5 6.5h6M3.5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                        </svg>
                                        {inv.description}
                                    </td>
                                    <td>
                                            <span
                                                className="inv-platform-badge"
                                                style={{ background: platformColor + '22', color: platformColor, borderColor: platformColor + '44' }}
                                            >
                                                {PLATFORM_LABELS[inv.platform]}
                                            </span>
                                    </td>
                                    <td className="inv-amount">
                                        {formatAmount(inv.amount, inv.currency)}
                                    </td>
                                    <td>
                                            <span
                                                className="inv-status-badge"
                                                style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                                            >
                                                {inv.paymentStatus.charAt(0) + inv.paymentStatus.slice(1).toLowerCase()}
                                            </span>
                                    </td>
                                    <td className="inv-notes">{inv.notes || '—'}</td>
                                    <td>
                                        <button
                                            className="inv-delete-btn"
                                            onClick={() => handleDelete(inv.id)}
                                            disabled={deleting === inv.id}
                                            title="Delete invoice"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M6 6v4M8 6v4M3.5 3.5l.5 8a1 1 0 001 .9h4a1 1 0 001-.9l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}