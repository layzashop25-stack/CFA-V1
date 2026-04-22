import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, Users, Clock, Award, ChevronRight } from 'lucide-react'
import useStore from '../../store/useStore'
import ConfirmModal from '../shared/ConfirmModal'
import FiliereDetail from './FiliereDetail'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { X } from 'lucide-react'

const LVL_BADGE = { '7eme': 'badge-amber', '9eme': 'badge-blue', 'bac': 'badge-green', 'all': 'badge-gray' }

export default function FiliereList() {
  const { t, i18n } = useTranslation()
  const filieres = useStore(s => s.filieres)
  const students = useStore(s => s.students)
  const addFiliere = useStore(s => s.addFiliere)
  const updateFiliere = useStore(s => s.updateFiliere)
  const deleteFiliere = useStore(s => s.deleteFiliere)

  const [fLvl, setFLvl] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editFil, setEditFil] = useState(null)
  const [delId, setDelId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState({ nameAr: '', nameFr: '', nameEn: '', requiredLevel: '9eme', duration: 1, diplomaType: 'تأهيل', description: '' })

  const lang = i18n.language
  const gn = f => lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn

  const filtered = filieres.filter(f => !fLvl || f.requiredLevel === fLvl)

  const openAdd = () => { setEditFil(null); setForm({ nameAr: '', nameFr: '', nameEn: '', requiredLevel: '9eme', duration: 1, diplomaType: 'تأهيل', description: '' }); setShowForm(true) }
  const openEdit = (f, e) => { e.stopPropagation(); setEditFil(f); setForm({ ...f }); setShowForm(true) }
  const handleSave = () => {
    if (!form.nameAr.trim()) return toast.error(t('common.error'))
    if (editFil) { updateFiliere(editFil.id, form) } else { addFiliere({ ...form, id: uuidv4() }) }
    toast.success(t('common.success')); setShowForm(false)
  }

  if (detail) return <FiliereDetail filiere={detail} onBack={() => setDetail(null)} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('filieres.title')}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{filieres.length} {t('filieres.title').toLowerCase()}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', '7eme', '9eme', 'bac', 'all'].map(v => (
            <button key={v} className={`chip ${fLvl === v ? 'on' : ''}`} onClick={() => setFLvl(v)}>
              {v === '' ? t('students.all') : v === 'all' ? t('filieres.allLevels') : t(`students.levels.${v}`)}
            </button>
          ))}
          <button className="btn btn-amber" onClick={openAdd}><Plus size={15} /> {t('filieres.addFiliere')}</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map(f => {
          const count = students.filter(s => s.filiereId === f.id).length
          const active = students.filter(s => s.filiereId === f.id && !s.isDropout).length
          const pct = count ? Math.round(active / count * 100) : 0
          return (
            <div key={f.id} className="fil-card" onClick={() => setDetail(f)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} color="#d97706" />
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-white btn-icon-only btn-sm" onClick={e => openEdit(f, e)}><Edit2 size={12} /></button>
                  <button className="btn btn-red btn-icon-only btn-sm" onClick={e => { e.stopPropagation(); setDelId(f.id) }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 4 }}>{gn(f)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>{f.diplomaType}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className={`badge ${LVL_BADGE[f.requiredLevel] || 'badge-gray'}`}>
                  {f.requiredLevel === 'all' ? t('filieres.allLevels') : t(`students.levels.${f.requiredLevel}`)}
                </span>
                <span className="badge badge-gray"><Clock size={9} style={{ marginInlineEnd: 3 }} />{f.duration} {t('filieres.years')}</span>
              </div>
              {/* Progress */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}><Users size={10} style={{ display: 'inline', marginInlineEnd: 3 }} />{active}/{count}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: '#f59e0b' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <ChevronRight size={14} color="#d1d5db" />
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>{t('filieres.noFilieres')}</div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="modal-bg" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{editFil ? t('filieres.editFiliere') : t('filieres.addFiliere')}</span>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['nameAr', 'الاسم بالعربية'], ['nameFr', 'Nom en français'], ['nameEn', 'Name in English']].map(([k, l]) => (
                <div key={k} className="field" style={k === 'nameAr' ? { gridColumn: 'span 2' } : {}}>
                  <label className="field-label">{l}</label>
                  <input className="field-input" value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="field">
                <label className="field-label">{t('filieres.level')}</label>
                <select className="field-input field-select" value={form.requiredLevel} onChange={e => setForm(f => ({ ...f, requiredLevel: e.target.value }))}>
                  {['7eme', '9eme', 'bac', 'all'].map(v => <option key={v} value={v}>{v === 'all' ? t('filieres.allLevels') : t(`students.levels.${v}`)}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">{t('filieres.duration')}</label>
                <select className="field-input field-select" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}>
                  {[1, 2, 3].map(v => <option key={v} value={v}>{v} {t('filieres.years')}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">{t('filieres.diplomaType')}</label>
                <select className="field-input field-select" value={form.diplomaType} onChange={e => setForm(f => ({ ...f, diplomaType: e.target.value }))}>
                  <option value="تخصص">تخصص</option>
                  <option value="تأهيل">تأهيل</option>
                </select>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-white" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              <button className="btn btn-amber" onClick={handleSave}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!delId} title={t('filieres.deleteFiliere')} message={t('filieres.confirmDelete')}
        onConfirm={() => { deleteFiliere(delId); setDelId(null); toast.success(t('common.success')) }}
        onCancel={() => setDelId(null)} />
    </div>
  )
}
