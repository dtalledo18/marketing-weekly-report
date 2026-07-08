'use client'

import { WeeklyReport, Invoice, DayData, MetaData } from '@/lib/types'
import InvoiceTable from './InvoiceTable'
import { useEffect, useRef, useState } from 'react'
import { getRangeStrings } from '@/lib/dateUtils'

interface WeekCardProps {
    week: WeeklyReport
    allWeeks: WeeklyReport[]
}

declare global {
    interface Window { Chart: any }
}

export default function WeekCard({ week, allWeeks }: WeekCardProps) {
    const chartRef      = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<any>(null)
    const [days, setDays]                 = useState<DayData[]>(week.days as DayData[])
    const [meta, setMeta]                 = useState<MetaData[]>(week.meta as MetaData[])
    const [invoices, setInvoices]         = useState<Invoice[]>(week.invoices)
    const [contactsNeeded, setContactsNeeded] = useState(week.contactsNeeded)
    const [saveStatus, setSaveStatus]     = useState<'saved' | 'saving' | 'idle'>('idle')
    const saveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isFirstRender  = useRef(true)

    // ── Derived range strings from startDate / endDate ────────
    const { fullRange, shortRange } = getRangeStrings(week.startDate, week.endDate)

    // Historical range: first week start – last week end
    const firstWeek = allWeeks[0]
    const lastWeek  = allWeeks[allWeeks.length - 1]
    const { shortRange: firstShort } = getRangeStrings(firstWeek?.startDate, firstWeek?.endDate)
    const { shortRange: lastShort  } = getRangeStrings(lastWeek?.startDate,  lastWeek?.endDate)
    const historicalRange = allWeeks.length > 1
        ? `${firstShort.split('–')[0]?.trim()} – ${lastShort.split('–')[1]?.trim()}`
        : shortRange

    // ── Computed stats ────────────────────────────────────────
    const weeklyTotal = days.reduce((s, d) => s + (d.leads || 0), 0)
    const avgLeads    = days.length ? weeklyTotal / days.length : 0
    const historicalTotal = allWeeks.reduce((sum, w) => {
        if (w.id === week.id) return sum + weeklyTotal
        return sum + (w.days as DayData[]).reduce((s, d) => s + (d.leads || 0), 0)
    }, 0)

    // ── Chart init ────────────────────────────────────────────
    useEffect(() => {
        if (!chartRef.current || typeof window === 'undefined' || !window.Chart) return

        const labels = days.map(d => d.name)
        const data   = days.map(d => d.leads)

        if (chartInstance.current) {
            chartInstance.current.data.labels             = labels
            chartInstance.current.data.datasets[0].data   = data
            chartInstance.current.update()
            return
        }

        chartInstance.current = new window.Chart(chartRef.current.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Leads per Day',
                    data,
                    borderColor: '#0070f3',
                    borderWidth: 4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#0070f3',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.43,
                    fill: true,
                    backgroundColor: (context: any) => {
                        const { ctx: c, chartArea } = context.chart
                        if (!chartArea) return null
                        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
                        g.addColorStop(0, 'rgba(0,112,243,0.35)')
                        g.addColorStop(1, 'rgba(0,112,243,0.0)')
                        return g
                    },
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#3b82f6', font: { weight: 'bold', size: 14 }, stepSize: 2 },
                    },
                    x: { display: false },
                },
            },
        })

        return () => { chartInstance.current?.destroy(); chartInstance.current = null }
    }, [])

    // ── Chart update on days change ───────────────────────────
    useEffect(() => {
        if (!chartInstance.current) return
        chartInstance.current.data.labels           = days.map(d => d.name)
        chartInstance.current.data.datasets[0].data = days.map(d => d.leads)
        chartInstance.current.update()
    }, [days])

    // ── Autosave ──────────────────────────────────────────────
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        setSaveStatus('saving')
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(async () => {
            try {
                await fetch(`/api/weeks/${week.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ days, meta, contactsNeeded }),
                })
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 2000)
            } catch {
                setSaveStatus('idle')
            }
        }, 800)
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
    }, [days, meta, contactsNeeded])

    const updateDay  = (i: number, field: 'name' | 'leads', value: string | number) =>
        setDays(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))

    const updateMeta = (i: number, field: 'name' | 'value', value: string) =>
        setMeta(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

    return (
        <div className="report-card-wrap">

            {/* Header */}
            <header className="report-header">
                <div className="header-top">
                    <h1 className="report-title">Marketing Weekly Report 2026</h1>
                    <div className="week-badge-header">{fullRange}</div>
                </div>
                <div className="autosave-indicator">
                    {saveStatus === 'saving' && <><span className="autosave-dot saving" />Saving...</>}
                    {saveStatus === 'saved'  && <><span className="autosave-dot saved"  />Saved</>}
                </div>
            </header>

            {/* Executive Summary */}
            <section className="section-summary">
                <h2 className="section-title">Executive Summary</h2>
                <p className="summary-text">
                    This report is based on campaign performance from <strong>{fullRange}</strong>.{' '}
                    All figures and analysis correspond to this reporting period.{' '}
                    The corresponding invoices are attached at the end of this document for reference.
                </p>
            </section>

            {/* Main Grid */}
            <div className="report-grid">

                {/* LEFT: Leads Hero */}
                <div className="leads-hero-card">
                    <div className="leads-comparison-grid">
                        <div className="stat-group">
                            <div className="sidebar-label">Historical Leads</div>
                            <div className="total-leads-value">{historicalTotal}</div>
                            <div className="date-sub-label">({historicalRange})</div>
                        </div>
                        <div className="stat-group">
                            <div className="sidebar-label">Weekly Leads</div>
                            <div className="total-leads-value">{weeklyTotal}</div>
                            <div className="date-sub-label">({shortRange})</div>
                        </div>
                    </div>

                    <div className="stat-separator" />

                    <div className="metrics-row">
                        <div className="stat-group">
                            <div className="avg-leads-value">
                                {Number.isInteger(avgLeads) ? avgLeads : avgLeads.toFixed(1)}
                            </div>
                            <div className="avg-leads-label">Avg. Daily Leads</div>
                        </div>
                        <div className="stat-group">
                            <input
                                type="text"
                                className="contacts-needed-input"
                                value={contactsNeeded}
                                onChange={e => setContactsNeeded(e.target.value)}
                                spellCheck={false}
                            />
                            <div className="avg-leads-label">Contacts Needed</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Meta Performance */}
                <div className="meta-simplified-section">
                    <div className="meta-brand-header">
                        <svg className="meta-icon" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.011 3.69 9.154 8.54 9.873v-6.984H7.995V12h2.545V9.412c0-2.512 1.496-3.899 3.783-3.899 1.096 0 2.242.196 2.242.196v2.464h-1.262c-1.244 0-1.63.772-1.63 1.562V12h2.778l-.444 2.889h-2.334v6.984C18.31 21.154 22 17.011 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        <h3 className="meta-title">Meta Campaigns:</h3>
                    </div>
                    <table className="perf-table">
                        <thead>
                        <tr><th>Performance</th><th className="col-total">TOTAL</th></tr>
                        </thead>
                        <tbody>
                        {meta.map((row, i) => (
                            <tr key={i} className="perf-row">
                                <td className="perf-name">
                                    <input className="meta-field-input" value={row.name}
                                           onChange={e => updateMeta(i, 'name', e.target.value)} spellCheck={false} />
                                </td>
                                <td className="perf-total">
                                    <input className="meta-field-input meta-value" value={row.value}
                                           onChange={e => updateMeta(i, 'value', e.target.value)} spellCheck={false} />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chart Section */}
            <section className="chart-section">
                <div className="chart-wrapper">
                    <div className="chart-data-header" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                        {days.map((day, i) => (
                            <div key={i} className="day-column">
                                <input type="text" className="day-name-input" value={day.name}
                                       onChange={e => updateDay(i, 'name', e.target.value)} spellCheck={false} />
                                <input type="number" className="day-leads-input" value={day.leads} min={0}
                                       onChange={e => updateDay(i, 'leads', parseInt(e.target.value) || 0)} />
                            </div>
                        ))}
                    </div>
                    <div className="canvas-container">
                        <canvas ref={chartRef} role="img" aria-label={`Daily leads chart for ${week.label}`} />
                    </div>
                </div>
            </section>

            {/* Invoices */}
            <InvoiceTable
                weeklyReportId={week.id}
                invoices={invoices}
                onInvoiceAdded={(inv)  => setInvoices(prev => [...prev, inv])}
                onInvoiceDeleted={(id) => setInvoices(prev => prev.filter(i => i.id !== id))}
            />

            <footer className="editor-footer">
                Live Interactive & Editable Panel · Advanced Roofing Team · {week.label}
            </footer>
        </div>
    )
}