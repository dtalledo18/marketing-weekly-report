'use client'

import { useState } from 'react'
import { WeeklyReport } from '@/lib/types'

interface WeekFormProps {
    onCreated: (week: WeeklyReport) => void
}

export default function WeekForm({ onCreated }: WeekFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        label: '',
        range: '',
        shortRange: '',
        contactsNeeded: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/weeks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error('Failed')
            const week = await res.json()
            onCreated(week)
            setOpen(false)
            setForm({ label: '', range: '', shortRange: '', contactsNeeded: '' })
        } catch (err) {
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
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">New Weekly Report</h2>
                    <button className="modal-close" onClick={() => setOpen(false)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label className="form-label">Week Label</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Week 6 — Jun 22–26"
                            value={form.label}
                            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Range</label>
                        <input
                            className="form-input"
                            placeholder="e.g. June 22nd through June 26th"
                            value={form.range}
                            onChange={e => setForm(f => ({ ...f, range: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Short Range</label>
                            <input
                                className="form-input"
                                placeholder="e.g. MON 22 – FRI 26"
                                value={form.shortRange}
                                onChange={e => setForm(f => ({ ...f, shortRange: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contacts Needed</label>
                            <input
                                className="form-input"
                                placeholder="e.g. 21.5k"
                                value={form.contactsNeeded}
                                onChange={e => setForm(f => ({ ...f, contactsNeeded: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}