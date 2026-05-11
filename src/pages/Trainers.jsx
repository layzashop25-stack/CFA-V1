import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import {
  Plus, Search, Edit2, Trash2, X, Eye,
  UserCog, Phone, Mail, CreditCard, BookOpen,
  ImagePlus, CheckCircle, XCircle, Users, Award, Briefcase
} from 'lucide-react'
import useStore from '../store/useStore'
import ConfirmModal from '../components/shared/ConfirmModal'
import Pagination from '../components/shared/Pagination'
import toast from 'react-hot-toast'

const PER = 12

const CONTRACT_CFG = {
  nazami:   { bg: '#dcfce7', color: '#15803d' },
  mustadaf: { bg: '#dbeafe', color: '#1d4ed8' },
  mawdou:   { bg: '#fef3c7', color: '#d97706' },
}

const CY = new Date().getFullYear()
const YEAR_OPTS = Array.from({ length: CY - 2024 + 3 }, (_, i) => { const y = 2024 + i; return `${y}/${y+1}` })

const EMPTY = {
  fullName: '', cin: '', phone: '', email: '',
  specialty: '', grade: 'professor', contractType: 'nazami',
  hireDate: '', salary: '', filiereIds: [],
  status: 'active', notes: '', photo: '',
  hourlyRate: '', monthlyHours: '',
  schoolYear: `${CY}/${CY+1}`
}

export default function Trainers() {
  const { t, i18n } = useTranslation()
  const filieres       = useStore(s => s.filieres)
  const trainers       = useStore(s => s.trainers)
  const addTrainer     = useStore(s => s.addTrainer)
  const updateTrainer  = useStore(s => s.updateTrainer)
  const deleteTrainer  = useStore(s => s.deleteTrainer)

  const lang = i18n.language
  const gn = f => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  const [search,   setSearch]   = useState('')
  const [fFil,     setFFil]     = useState('')
  const [fStat,    setFStat]    = useState('')
  const [page,     setPage]     = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [delId,    setDelId]    = useState(null)
  const [form,     setForm]     = useState({ ...EMPTY })
  const photoRef = useRef()

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleFiliere = id => {
    setForm(f => ({
      ...f,
      filiereIds: f.filiereIds.includes(id)
        ? f.filiereIds.filter(x => x !== id)
        : [...f.filiereIds, id]
    }))
  }

  const filtered = trainers.filter(tr => {
    const q = search.toLowerCase()
    return (!q || tr.fullName.toLowerCase().includes(q) || (tr.cin || '').toLowerCase().includes(q))
      && (!fFil  || (tr.filiereIds || []).includes(fFil))
      && (!fStat || tr.status === fStat)
  })

  const paged = filtered.slice((page - 1) * PER, page * PER)

  const activeCount   = trainers.filter(t => t.status === 'active').length
  const inactiveCount = trainers.filter(t => t.status === 'inactive').length

  const openAdd  = () => { setEditItem(null); setForm({ ...EMPTY }); setShowForm(true) }
  const openEdit = (item, e) => { e?.stopPropagation(); setEditItem(item); setForm({ ...item, filiereIds: item.filiereIds || [] }); setShowForm(true) }

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => sf('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.fullName.trim()) return toast.error(t('common.error'))
    if (editItem) updateTrainer(editItem.id, form)
    else addTrainer({ ...form, id: uuidv4(), createdAt: new Date().toISOString() })
    toast.success(t('common.success'))
    setShowForm(false)
  }

  /* ── sub-components ── */
  const Avatar = ({ trainer, size = 44 }) => (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {trainer.photo
        ? <img src={trainer.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontWeight: 800, fontSize: size * 0.38, color: '#9ca3af' }}>{trainer.fullName?.charAt(0) || '?'}</span>
      }
    </div>
  )

  const StatusBadge = ({ status }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: status === 'active' ? '#dcfce7' : '#fee2e2', color: status === 'active' ? '#15803d' : '#dc2626' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'active' ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
      {status === 'active' ? t('trainers.active') : t('trainers.inactive')}
    </span>
  )

  const ContractBadge = ({ type }) => {
    const cfg = CONTRACT_CFG[type] || CONTRACT_CFG.nazami
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
        {t(`trainers.contractTypes.${type}`)}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('trainers.title')}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {trainers.length} {t('trainers.totalTrainers').toLowerCase()} ·{' '}
            <span style={{ color: '#15803d', fontWeight: 700 }}>{activeCount} {t('trainers.active')}</span> ·{' '}
            <span style={{ color: '#dc2626', fontWeight: 700 }}>{inactiveCount} {t('trainers.inactive')}</span>
          </p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>
          <Plus size={15} /> {t('trainers.add')}
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
        {[
          { icon: Users,        bg: '#fef3c7', color: '#d97706', v: trainers.length,  l: t('trainers.totalTrainers') },
          { icon: CheckCircle,  bg: '#dcfce7', color: '#15803d', v: activeCount,       l: t('trainers.active') },
          { icon: XCircle,      bg: '#fee2e2', color: '#dc2626', v: inactiveCount,     l: t('trainers.inactive') },
          { icon: BookOpen,     bg: '#ede9fe', color: '#7c3aed', v: filieres.length,   l: t('nav.filieres') },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.v}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: 10, color: '#9ca3af', pointerEvents: 'none' }} />
            <input className="field-input" style={{ paddingInlineStart: 32 }}
              placeholder={t('trainers.search')} value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={13} /></button>}
          </div>

          <button className={`chip ${fStat === '' ? 'on' : ''}`} onClick={() => { setFStat(''); setPage(1) }}>{t('students.all')}</button>
          <button className={`chip ${fStat === 'active' ? 'on' : ''}`} onClick={() => { setFStat(fStat === 'active' ? '' : 'active'); setPage(1) }}>{t('trainers.active')}</button>
          <button className={`chip ${fStat === 'inactive' ? 'on-red' : ''}`} onClick={() => { setFStat(fStat === 'inactive' ? '' : 'inactive'); setPage(1) }}>{t('trainers.inactive')}</button>

          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />

          <select className="field-input field-select" style={{ width: 'auto', minWidth: 180, padding: '6px 32px 6px 12px', fontSize: 12 }}
            value={fFil} onChange={e => { setFFil(e.target.value); setPage(1) }}>
            <option value="">{t('trainers.allFilieres')}</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
          </select>

          <span style={{ marginInlineStart: 'auto', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{filtered.length} {t('common.total').toLowerCase()}</span>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 14 }}>
        {paged.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
            <UserCog size={40} color="#e5e7eb" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13 }}>{t('trainers.noTrainers')}</p>
          </div>
        ) : paged.map(tr => {
          const assignedFils = filieres.filter(f => (tr.filiereIds || []).includes(f.id))
          return (
            <div key={tr.id} onClick={() => setViewItem(tr)}
              style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.18s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Card top banner */}
              <div style={{ background: '#1e293b', padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar trainer={tr} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.fullName}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{tr.specialty || t('trainers.grades.' + tr.grade)}</div>
                </div>
                <StatusBadge status={tr.status} />
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                  {tr.cin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                      <CreditCard size={13} color="#9ca3af" />
                      <span style={{ fontFamily: 'monospace' }}>{tr.cin}</span>
                    </div>
                  )}
                  {tr.hourlyRate && tr.monthlyHours && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#d97706', fontWeight: 700 }}>
                      <span>{tr.monthlyHours}h × {tr.hourlyRate} = {(parseFloat(tr.hourlyRate) * parseFloat(tr.monthlyHours)).toFixed(2)} MAD</span>
                    </div>
                  )}
                  {tr.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                      <Phone size={13} color="#9ca3af" />
                      <span>{tr.phone}</span>
                    </div>
                  )}
                  {tr.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                      <Mail size={13} color="#9ca3af" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.email}</span>
                    </div>
                  )}
                </div>

                {/* Contract badge */}
                <div style={{ marginBottom: 10 }}>
                  <ContractBadge type={tr.contractType} />
                </div>

                {/* Assigned filieres */}
                {assignedFils.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {assignedFils.map(f => (
                      <span key={f.id} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>
                        {gn(f)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #f3f4f6', paddingTop: 12 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-white btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={e => openEdit(tr, e)}>
                    <Edit2 size={13} /> {t('common.edit')}
                  </button>
                  <button className="btn btn-red btn-icon-only btn-sm" onClick={() => setDelId(tr.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {filtered.length > PER && (
        <div className="card">
          <Pagination page={page} total={filtered.length} perPage={PER} onChange={setPage} />
        </div>
      )}

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showForm && (
        <div className="modal-bg" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{editItem ? t('trainers.edit') : t('trainers.add')}</span>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">

              {/* Photo + name row */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6', border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => photoRef.current.click()}>
                  {form.photo
                    ? <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center' }}>
                        <ImagePlus size={22} color="#d1d5db" style={{ margin: '0 auto 4px' }} />
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{t('trainers.photo')}</span>
                      </div>
                  }
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="field">
                    <label className="field-label">{t('trainers.fullName')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <input className="field-input" value={form.fullName} onChange={e => sf('fullName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field-label">{t('trainers.specialty')}</label>
                    <input className="field-input" value={form.specialty} onChange={e => sf('specialty', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label className="field-label">{t('trainers.cin')}</label>
                  <input className="field-input" style={{ fontFamily: 'monospace' }} value={form.cin} onChange={e => sf('cin', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.phone')}</label>
                  <input className="field-input" type="tel" value={form.phone} onChange={e => sf('phone', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.email')}</label>
                  <input className="field-input" type="email" value={form.email} onChange={e => sf('email', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.hireDate')}</label>
                  <input className="field-input" type="date" value={form.hireDate} onChange={e => sf('hireDate', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.grade')}</label>
                  <select className="field-input field-select" value={form.grade} onChange={e => sf('grade', e.target.value)}>
                    {['professor', 'assistant', 'technician'].map(g => (
                      <option key={g} value={g}>{t(`trainers.grades.${g}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.contractType')}</label>
                  <select className="field-input field-select" value={form.contractType} onChange={e => sf('contractType', e.target.value)}>
                    {['nazami', 'mustadaf', 'mawdou'].map(c => (
                      <option key={c} value={c}>{t(`trainers.contractTypes.${c}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.salary')}</label>
                  <input className="field-input" type="number" value={form.salary} onChange={e => sf('salary', e.target.value)} placeholder="0.00" />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.hourlyRate')}</label>
                  <input className="field-input" type="number" value={form.hourlyRate} onChange={e => sf('hourlyRate', e.target.value)} placeholder="0.00" />
                </div>
                <div className="field">
                  <label className="field-label">{t('trainers.monthlyHours')}</label>
                  <input className="field-input" type="number" value={form.monthlyHours} onChange={e => sf('monthlyHours', e.target.value)} placeholder="0" />
                </div>
                {form.hourlyRate && form.monthlyHours && (
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <div style={{ padding: '10px 14px', background: '#fef3c7', borderRadius: 8, border: '1px solid #fcd34d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>{t('trainers.totalPay')}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#d97706' }}>{(parseFloat(form.hourlyRate) * parseFloat(form.monthlyHours)).toFixed(2)} MAD</span>
                    </div>
                  </div>
                )}
                <div className="field">
                  <label className="field-label">{t('trainers.status')}</label>
                  <select className="field-input field-select" value={form.status} onChange={e => sf('status', e.target.value)}>
                    <option value="active">{t('trainers.active')}</option>
                    <option value="inactive">{t('trainers.inactive')}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.schoolYear')}</label>
                  <select className="field-input field-select" value={form.schoolYear || ''} onChange={e => sf('schoolYear', e.target.value)}>
                    {YEAR_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Filieres multi-select */}
                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label className="field-label">{t('trainers.filieres')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', minHeight: 44 }}>
                    {filieres.map(f => {
                      const on = (form.filiereIds || []).includes(f.id)
                      return (
                        <button key={f.id} type="button"
                          onClick={() => toggleFiliere(f.id)}
                          style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: on ? '#f59e0b' : '#f3f4f6', color: on ? '#fff' : '#6b7280' }}>
                          {gn(f)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label className="field-label">{t('trainers.notes')}</label>
                  <textarea className="field-input" rows={2} value={form.notes} onChange={e => sf('notes', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-white" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              <button className="btn btn-amber" onClick={handleSave}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DETAIL VIEW MODAL
      ══════════════════════════════════════ */}
      {viewItem && (
        <div className="modal-bg" onClick={() => setViewItem(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{viewItem.fullName}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-white btn-sm" onClick={e => { setViewItem(null); openEdit(viewItem, e) }}>
                  <Edit2 size={13} /> {t('common.edit')}
                </button>
                <button className="btn btn-ghost btn-icon-only" onClick={() => setViewItem(null)}><X size={15} /></button>
              </div>
            </div>

            {/* Banner */}
            <div style={{ background: '#1e293b', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar trainer={viewItem} size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>{viewItem.fullName}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{viewItem.specialty || t('trainers.grades.' + viewItem.grade)}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={viewItem.status} />
                  <ContractBadge type={viewItem.contractType} />
                </div>
              </div>
            </div>

            <div className="modal-body">
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 16 }}>
                {[
                  [t('trainers.cin'),      viewItem.cin,      'monospace'],
                  [t('trainers.phone'),    viewItem.phone,    null],
                  [t('trainers.email'),    viewItem.email,    null],
                  [t('trainers.hireDate'), viewItem.hireDate, null],
                  [t('trainers.grade'),    t(`trainers.grades.${viewItem.grade}`), null],
                  [t('trainers.salary'),   viewItem.salary ? `${viewItem.salary} MAD` : '—', null],
                  [t('trainers.hourlyRate'), viewItem.hourlyRate ? `${viewItem.hourlyRate} MAD/h` : '—', null],
                  [t('trainers.monthlyHours'), viewItem.monthlyHours ? `${viewItem.monthlyHours} h` : '—', null],
                  [t('trainers.totalPay'), (viewItem.hourlyRate && viewItem.monthlyHours) ? `${(parseFloat(viewItem.hourlyRate) * parseFloat(viewItem.monthlyHours)).toFixed(2)} MAD` : '—', null],
                ].map(([label, value, ff]) => value ? (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: ff || 'inherit' }}>{value}</div>
                  </div>
                ) : null)}
              </div>

              {/* Assigned filieres */}
              {(viewItem.filiereIds || []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 8 }}>{t('trainers.filieres')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {filieres.filter(f => (viewItem.filiereIds || []).includes(f.id)).map(f => (
                      <span key={f.id} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <BookOpen size={11} /> {gn(f)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewItem.notes && (
                <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>{t('trainers.notes')}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{viewItem.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!delId}
        title={t('trainers.delete')}
        message={t('trainers.confirmDelete')}
        onConfirm={() => { deleteTrainer(delId); setDelId(null); toast.success(t('common.success')) }}
        onCancel={() => setDelId(null)}
      />
    </div>
  )
}
