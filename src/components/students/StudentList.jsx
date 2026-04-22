import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Trash2, Upload, UserX, UserCheck, CheckSquare, Square, Download, X, Filter } from 'lucide-react'
import useStore from '../../store/useStore'
import ConfirmModal from '../shared/ConfirmModal'
import Pagination from '../shared/Pagination'
import StudentForm from './StudentForm'
import StudentCard from './StudentCard'
import StudentImport from './StudentImport'
import toast from 'react-hot-toast'
import { exportStudentsExcel } from '../../utils/exportExcel'

const PER = 15

export default function StudentList() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const students = useStore(s => s.students)
  const filieres = useStore(s => s.filieres)
  const deleteStudent = useStore(s => s.deleteStudent)
  const deleteStudents = useStore(s => s.deleteStudents)
  const updateStudent = useStore(s => s.updateStudent)

  const [search, setSearch] = useState('')
  const [fFil, setFFil] = useState('')
  const [fLvl, setFLvl] = useState('')
  const [fStat, setFStat] = useState('')
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editS, setEditS] = useState(null)
  const [viewS, setViewS] = useState(null)
  const [delId, setDelId] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [dropoutModal, setDropoutModal] = useState(null)
  const [dropData, setDropData] = useState({ date: '', reason: '' })

  const lang = i18n.language
  const gn = f => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  useEffect(() => { if (params.get('add')) setShowForm(true) }, [params])

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (!q || s.fullName.toLowerCase().includes(q) || s.cinNumber.toLowerCase().includes(q) || s.phone.includes(q))
      && (!fFil || s.filiereId === fFil)
      && (!fLvl || s.educationLevel === fLvl)
      && (!fStat || (fStat === 'active' ? !s.isDropout : s.isDropout))
  })
  const paged = filtered.slice((page - 1) * PER, page * PER)

  const toggleSel = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSel(sel.length === paged.length ? [] : paged.map(s => s.id))

  const activeCount = students.filter(s => !s.isDropout).length
  const dropCount = students.filter(s => s.isDropout).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('students.title')}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {students.length} {t('students.totalCount').toLowerCase()} ·{' '}
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{activeCount} {t('students.active')}</span> ·{' '}
            <span style={{ color: '#dc2626', fontWeight: 700 }}>{dropCount} {t('students.dropout')}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-white btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={14} /> {t('students.importExcel')}
          </button>
          <button className="btn btn-amber" onClick={() => { setEditS(null); setShowForm(true) }}>
            <Plus size={15} /> {t('students.addStudent')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: 10, color: '#9ca3af', pointerEvents: 'none' }} />
            <input className="field-input" style={{ paddingInlineStart: 32 }}
              placeholder={t('students.search')} value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={13} /></button>}
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['', t('students.all'), students.length], ['active', t('students.active'), activeCount], ['dropout', t('students.dropout'), dropCount]].map(([v, l, c]) => (
              <button key={v} className={`chip ${fStat === v ? (v === 'dropout' ? 'on-red' : 'on') : ''}`}
                onClick={() => { setFStat(v); setPage(1) }}>
                {l} <span className="chip-count">{c}</span>
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />

          {/* Level chips */}
          {['7eme', '9eme', 'bac'].map(l => (
            <button key={l} className={`chip ${fLvl === l ? 'on-blue' : ''}`}
              onClick={() => { setFLvl(fLvl === l ? '' : l); setPage(1) }}>
              {t(`students.levels.${l}`)}
            </button>
          ))}

          {/* Filiere */}
          <select className="field-input field-select" style={{ width: 'auto', minWidth: 160, padding: '6px 32px 6px 12px', fontSize: 12 }}
            value={fFil} onChange={e => { setFFil(e.target.value); setPage(1) }}>
            <option value="">{t('students.filterFiliere')}</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
          </select>

          <span style={{ marginInlineStart: 'auto', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{filtered.length} {t('common.total').toLowerCase()}</span>
        </div>
      </div>

      {/* Bulk bar */}
      {sel.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{sel.length} {t('students.selected')}</span>
          <div style={{ display: 'flex', gap: 8, marginInlineStart: 'auto' }}>
            <button className="btn btn-white btn-sm" onClick={() => exportStudentsExcel(students.filter(s => sel.includes(s.id)), filieres, lang)}>
              <Download size={13} /> {t('students.exportSelected')}
            </button>
            <button className="btn btn-red btn-sm" onClick={() => { deleteStudents(sel); setSel([]); toast.success(t('common.success')) }}>
              <Trash2 size={13} /> {t('students.deleteSelected')}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel.length === paged.length && paged.length > 0 ? <CheckSquare size={15} color="#f59e0b" /> : <Square size={15} color="#d1d5db" />}
                  </button>
                </th>
                <th>{t('students.name')}</th>
                <th>{t('students.cin')}</th>
                <th>{t('students.phone')}</th>
                <th>{t('students.filiere')}</th>
                <th>{t('students.level')}</th>
                <th>{t('students.status')}</th>
                <th style={{ textAlign: 'center' }}>{t('students.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#9ca3af' }}>
                  <Search size={28} color="#e5e7eb" style={{ margin: '0 auto 8px' }} />
                  <div>{t('students.noStudents')}</div>
                </td></tr>
              ) : paged.map(s => {
                const fil = filieres.find(f => f.id === s.filiereId)
                return (
                  <tr key={s.id} style={sel.includes(s.id) ? { background: '#fffbeb' } : {}}>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => toggleSel(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        {sel.includes(s.id) ? <CheckSquare size={15} color="#f59e0b" /> : <Square size={15} color="#d1d5db" />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {s.fullName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{s.fullName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{s.cinNumber}</td>
                    <td style={{ color: '#6b7280' }}>{s.phone}</td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{gn(fil)}</td>
                    <td><span className="badge badge-blue">{t(`students.levels.${s.educationLevel}`)}</span></td>
                    <td>
                      <span className={`badge ${s.isDropout ? 'badge-red' : 'badge-green'}`}>
                        <span className="badge-dot" style={{ background: s.isDropout ? '#dc2626' : '#16a34a' }} />
                        {s.isDropout ? t('students.dropout') : t('students.active')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn btn-white btn-icon-only btn-sm" title={t('common.view')} onClick={() => setViewS(s)}><Eye size={13} /></button>
                        <button className="btn btn-white btn-icon-only btn-sm" title={t('common.edit')} onClick={() => { setEditS(s); setShowForm(true) }}><Edit2 size={13} /></button>
                        <button className="btn btn-white btn-icon-only btn-sm" title={s.isDropout ? t('students.removeDropout') : t('students.markDropout')}
                          onClick={() => {
                            if (s.isDropout) { updateStudent(s.id, { isDropout: false, dropoutDate: '', dropoutReason: '' }); toast.success(t('common.success')) }
                            else { setDropoutModal(s); setDropData({ date: '', reason: '' }) }
                          }}>
                          {s.isDropout ? <UserCheck size={13} color="#16a34a" /> : <UserX size={13} color="#dc2626" />}
                        </button>
                        <button className="btn btn-red btn-icon-only btn-sm" title={t('common.delete')} onClick={() => setDelId(s.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={PER} onChange={setPage} />
      </div>

      {showForm && <StudentForm student={editS} onClose={() => { setShowForm(false); setEditS(null) }} />}
      {viewS && <StudentCard student={viewS} onClose={() => setViewS(null)} />}
      {showImport && <StudentImport onClose={() => setShowImport(false)} />}
      <ConfirmModal isOpen={!!delId} title={t('students.deleteStudent')} message={t('students.confirmDelete')}
        onConfirm={() => { deleteStudent(delId); setDelId(null); toast.success(t('common.success')) }}
        onCancel={() => setDelId(null)} />

      {dropoutModal && (
        <div className="modal-bg" onClick={() => setDropoutModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title" style={{ color: '#dc2626' }}>{t('students.markDropout')}</span>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setDropoutModal(null)}><X size={15} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label className="field-label">{t('students.fields.dropoutDate')}</label>
                <input type="date" className="field-input" value={dropData.date} onChange={e => setDropData(d => ({ ...d, date: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">{t('students.fields.dropoutReason')}</label>
                <textarea className="field-input" rows={3} value={dropData.reason} onChange={e => setDropData(d => ({ ...d, reason: e.target.value }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-white" onClick={() => setDropoutModal(null)}>{t('common.cancel')}</button>
              <button className="btn btn-red" onClick={() => {
                updateStudent(dropoutModal.id, { isDropout: true, dropoutDate: dropData.date, dropoutReason: dropData.reason })
                setDropoutModal(null); toast.success(t('common.success'))
              }}>{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
