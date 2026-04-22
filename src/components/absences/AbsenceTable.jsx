import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, Printer, Folder, ChevronDown, ChevronRight, Pencil, Lock } from 'lucide-react'
import useStore from '../../store/useStore'
import { exportAbsencePDF } from '../../utils/exportPDF'
import { exportAbsenceExcel } from '../../utils/exportExcel'

// Returns the real number of days in a given month/year
const daysInMonth = (month, year) => new Date(year, month, 0).getDate()

export default function AbsenceTable() {
  const { t, i18n } = useTranslation()
  const students = useStore(s => s.students)
  const filieres = useStore(s => s.filieres)
  const toggleAbsence = useStore(s => s.toggleAbsence)
  const absences = useStore(s => s.absences)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [fFil, setFFil] = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [editMode, setEditMode] = useState(false)

  const lang = i18n.language
  const gn = f => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  // Recompute days array whenever month or year changes
  const totalDays = daysInMonth(month, year)
  const DAYS = Array.from({ length: totalDays }, (_, i) => i + 1)

  const getRec = sid => absences.find(a => a.studentId === sid && a.month === month && a.year === year) || { absenceDays: [], justifiedDays: [] }

  const totalColor = n => n === 0 ? '#16a34a' : n <= 5 ? '#d97706' : '#dc2626'
  const totalBg    = n => n === 0 ? '#dcfce7' : n <= 5 ? '#fef3c7' : '#fee2e2'

  const filteredFil = filieres.filter(f => !fFil || f.id === fFil)
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('absences.title')}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{t(`absences.months.${month}`)} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="no-print">
          <button className={`btn btn-sm ${editMode ? 'btn-amber' : 'btn-white'}`} onClick={() => setEditMode(m => !m)}>
            {editMode ? <><Lock size={13} /> {t('common.save')}</> : <><Pencil size={13} /> {t('absences.edit')}</>}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => exportAbsencePDF(students, filieres, absences, month, year, t, lang)}>
            <Download size={13} /> {t('absences.exportPDF')}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => exportAbsenceExcel(students, filieres, absences, month, year, t, lang)}>
            <FileSpreadsheet size={13} /> {t('absences.exportExcel')}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => window.print()}>
            <Printer size={13} /> {t('absences.print')}
          </button>
        </div>
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }} className="no-print">
          <Pencil size={14} color="#d97706" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{t('absences.editModeBanner')}</span>
          <span style={{ marginInlineStart: 'auto', fontSize: 11, color: '#b45309' }}>{t('absences.editModeExit')}</span>
        </div>
      )}

      {/* Controls */}
      <div className="card no-print" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ minWidth: 140 }}>
            <label className="field-label">{t('absences.month')}</label>
            <select className="field-input field-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{t(`absences.months.${i + 1}`)}</option>)}
            </select>
          </div>
          <div className="field" style={{ minWidth: 100 }}>
            <label className="field-label">{t('absences.year')}</label>
            <select className="field-input field-select" value={year} onChange={e => setYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="field" style={{ minWidth: 200 }}>
            <label className="field-label">{t('absences.filterFiliere')}</label>
            <select className="field-input field-select" value={fFil} onChange={e => setFFil(e.target.value)}>
              <option value="">{t('absences.allFilieres')}</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
            </select>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginInlineStart: 'auto', alignItems: 'center' }}>
            {[['#fff', '#e5e7eb', t('absences.present'), ''], ['#fef2f2', '#fecaca', t('absences.absent'), '✗'], ['#fffbeb', '#fde68a', t('absences.justified'), '✓']].map(([bg, border, label, sym]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                <span style={{ width: 20, height: 20, borderRadius: 4, background: bg, border: `1px solid ${border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{sym}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
          <table className={`abs-table w-full ${editMode ? 'abs-edit' : ''}`} dir="rtl">
            <thead>
              <tr>
                <th className="abs-name-col" style={{ zIndex: 20 }}>{t('absences.fullName')}</th>
                {DAYS.map(d => <th key={d} style={{ minWidth: 28 }}>{d}</th>)}
                <th className="abs-total-col" style={{ zIndex: 20 }}>{t('absences.totalAbsences')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFil.map(f => {
                const filStudents = students.filter(s => s.filiereId === f.id && !s.isDropout)
                if (!filStudents.length) return null
                const isCol = collapsed[f.id]
                return [
                  <tr key={`g-${f.id}`} className="abs-group-row" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => ({ ...c, [f.id]: !c[f.id] }))}>
                    <td colSpan={totalDays + 2} style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Folder size={13} />
                        {isCol ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        <span>{gn(f)}</span>
                        <span style={{ opacity: 0.5, fontSize: 11, fontWeight: 400 }}>({filStudents.length})</span>
                      </div>
                    </td>
                  </tr>,
                  ...(!isCol ? filStudents.map((s, idx) => {
                    const rec = getRec(s.id)
                    const abs = rec.absenceDays || []
                    const just = rec.justifiedDays || []
                    const total = abs.length
                    const rowBg = idx % 2 === 0 ? '#fff' : '#fafafa'
                    return (
                      <tr key={s.id}>
                        <td className="abs-name-col" style={{ background: rowBg }}>{s.fullName}</td>
                        {DAYS.map(d => {
                          const isAbs = abs.includes(d)
                          const isJust = just.includes(d)
                          return (
                            <td key={d}
                              className={isAbs ? (isJust ? 'abs-justified' : 'abs-absent') : 'abs-present'}
                              style={!isAbs ? { background: rowBg } : {}}
                              onClick={() => editMode && toggleAbsence(s.id, month, year, d)}
                              title={!editMode ? undefined : isAbs ? t('absences.clickToRemove') : t('absences.clickToAdd')}
                            >
                              {isAbs ? (isJust ? '✓' : '✗') : ''}
                            </td>
                          )
                        })}
                        <td className="abs-total-col" style={{ background: totalBg(total), color: totalColor(total) }}>{total}</td>
                      </tr>
                    )
                  }) : [])
                ]
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
