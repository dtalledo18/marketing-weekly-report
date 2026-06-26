'use client'

import { useEffect, useState } from 'react'
import { WeeklyReport } from '@/lib/types'
import WeekCard from './components/WeekCard'
import WeekForm from './components/WeekForm'

export default function Home() {
  const [weeks, setWeeks] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/weeks')
        .then(r => r.json())
        .then(data => {
          setWeeks(data)
          if (data.length > 0) setSelectedId(data[data.length - 1].id)
        })
        .finally(() => setLoading(false))
  }, [])

  const selectedWeek = weeks.find(w => w.id === selectedId) ?? null

  return (
      <>
        {/* Chart.js CDN */}
        <script src="https://cdn.jsdelivr.net/npm/chart.js" async />

        <div className="report-container">

          {/* ── TOP BAR ── */}
          <div className="week-selector-bar">
            <span className="selector-label">Week:</span>

            <div className="selector-wrapper">
              <select
                  className="week-select"
                  value={selectedId ?? ''}
                  onChange={e => setSelectedId(e.target.value)}
                  disabled={weeks.length === 0}
              >
                {weeks.length === 0 && <option value="">No weeks yet</option>}
                {weeks.map(w => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                ))}
              </select>
              <svg className="select-arrow" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {selectedWeek && (
                <span className="week-badge">{selectedWeek.shortRange}</span>
            )}

            <WeekForm onCreated={(week) => {
              setWeeks(prev => [...prev, week])
              setSelectedId(week.id)
            }} />
          </div>

          {/* ── CONTENT ── */}
          {loading && (
              <div className="loading-state">Loading reports...</div>
          )}

          {!loading && weeks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h2>No weekly reports yet</h2>
                <p>Create your first weekly report to get started.</p>
              </div>
          )}

          {!loading && selectedWeek && (
              <WeekCard
                  key={selectedWeek.id}
                  week={selectedWeek}
                  allWeeks={weeks}
              />
          )}

        </div>
      </>
  )
}