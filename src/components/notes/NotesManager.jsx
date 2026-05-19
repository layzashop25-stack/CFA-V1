import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList } from 'lucide-react'
import useStore from '../../store/useStore'

export default function NotesManager() {
  const { t, i18n } = useTranslation()
  const filieres = useStore(s => s.filieres)
  const students = useStore(s => s.students)
  const updateNote = useStore(s => s.updateNote)
  const getNote = useStore(s => s.getNote)

  const [selFil, setSelFil] = useState('')
  const [sem, setSem] = useState('S1')

  const lang = i18n.language
  const gn = f => lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn

  const filStudents = students.filter(s => s.filiereId === selFil && !s.isDropout)

  const calcFinal = (th, pr) => {
    const t = parseFloat(th), p = parseFloat(pr)
    if (isNaN(t) || isNaN(p)) return ''
    return ((t * 0.4) + (p * 0.6)).toFixed(2)
  }

  const onChange = (sid, field, val) => {
    if (val !== '' && (isNaN(val) || Number(val) < 0 || Number(val) > 20)) return
    updateNote(sid, selFil, sem, field, val)
  }

  const passCount = filStudents.filter(s => {
    const n = getNote(s.id, selFil, sem)
    const f = calcFinal(n.theory, n.practical)
    return f !== '' && parseFloat(f) >= 10
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('notes.title')}</h2>
          {selFil && (
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              {filStudents.length} {t('notes.student').toLowerCase()} ·{' '}
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{passCount} {t('notes.passed')}</span> ·{' '}
              <span style={{ color: '#dc2626', fontWeight: 700 }}>{filStudents.length - passCount} {t('notes.failed')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ minWidth: 220 }}>
            <label className="field-label">{t('notes.filiere')}</label>
            <select className="field-input field-select" value={selFil} onChange={e => setSelFil(e.target.value)}>
              <option value="">{t('notes.noFiliere')}</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">{t('notes.semester')}</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['S1', 'S2'].map(s => (
                <button key={s} className={`chip ${sem === s ? 'on' : ''}`} onClick={() => setSem(s)}>
                  {s === 'S1' ? t('notes.s1') : t('notes.s2')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginInlineStart: 'auto', padding: '8px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
            {t('notes.formula')}
          </div>
        </div>
      </div>

      {/* Empty */}
      {!selFil ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <ClipboardList size={36} color="#e5e7eb" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: '#9ca3af', fontSize: 13 }}>{t('notes.noFiliere')}</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>{t('notes.student')}</th>
                  <th style={{ textAlign: 'center', width: 110 }}>
                    <div>{t('notes.theory')}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>/20 — 40%</div>
                  </th>
                  <th style={{ textAlign: 'center', width: 110 }}>
                    <div>{t('notes.practical')}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>/20 — 60%</div>
                  </th>
                  <th style={{ textAlign: 'center', width: 110 }}>
                    <div>{t('notes.final')}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>/20</div>
                  </th>
                  <th style={{ textAlign: 'center', width: 100 }}>{t('students.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filStudents.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>{t('common.noData')}</td></tr>
                ) : filStudents.map((s, i) => {
                  const note = getNote(s.id, selFil, sem)
                  const final = calcFinal(note.theory, note.practical)
                  const passed = final !== '' && parseFloat(final) >= 10
                  return (
                    <tr key={s.id}>
                      <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                            {s.fullName.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" min="0" max="20" step="0.25" className="note-inp"
                          value={note.theory ?? ''} placeholder="—"
                          onChange={e => onChange(s.id, 'theory', e.target.value)} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" min="0" max="20" step="0.25" className="note-inp"
                          value={note.practical ?? ''} placeholder="—"
                          onChange={e => onChange(s.id, 'practical', e.target.value)} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {final !== '' ? (
                          <span style={{ fontSize: 15, fontWeight: 800, color: passed ? '#16a34a' : '#dc2626' }}>{final}</span>
                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {final !== '' ? (
                          <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>
                            <span className="badge-dot" style={{ background: passed ? '#16a34a' : '#dc2626' }} />
                            {passed ? t('notes.passed') : t('notes.failed')}
                          </span>
                        ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filStudents.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{t('common.total')}: {filStudents.length}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{t('notes.passed')}: {passCount}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{t('notes.failed')}: {filStudents.length - passCount}</span>
              <span style={{ marginInlineStart: 'auto', fontSize: 12, color: '#9ca3af' }}>
                {t('notes.successRate')}: {filStudents.length ? ((passCount / filStudents.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
