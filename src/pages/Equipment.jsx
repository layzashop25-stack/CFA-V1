import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import {
  Plus, Search, Edit2, Trash2, X, Grid, List,
  Package, Tag, Hash, Layers, ImagePlus,
  Wrench, CheckCircle, XCircle, DoorOpen
} from 'lucide-react'
import useStore from '../store/useStore'
import ConfirmModal from '../components/shared/ConfirmModal'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  good:        { label: 'statuses.good',        bg: '#dcfce7', color: '#15803d', icon: CheckCircle },
  maintenance: { label: 'statuses.maintenance', bg: '#fef3c7', color: '#d97706', icon: Wrench },
  broken:      { label: 'statuses.broken',      bg: '#fee2e2', color: '#dc2626', icon: XCircle },
}

const CY = new Date().getFullYear()
const YEAR_OPTS = Array.from({ length: CY - 2024 + 3 }, (_, i) => { const y = 2024 + i; return `${y}/${y+1}` })

const ROOMS = [
  'قاعة 1', 'قاعة 2', 'قاعة متعددة التخصصات',
  'الحراسة العامة', 'الإدارة', 'المستودع',
  'ورشة الميكانيك', 'ورشة الإعلاميات' , 'المطبخ'
]

const EMPTY = {
  name: '', inventaire: '', quantity: 1,
  filiereId: '', room: '', status: 'good', description: '', photo: '',
  schoolYear: `${CY}/${CY+1}`
}

const Stat = ({ icon: Icon, bg, color, value, label }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
    <div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
)

export default function Equipment() {
  const { t, i18n } = useTranslation()
  const filieres  = useStore(s => s.filieres)
  const equipment = useStore(s => s.equipment)
  const addEquipment    = useStore(s => s.addEquipment)
  const updateEquipment = useStore(s => s.updateEquipment)
  const deleteEquipment = useStore(s => s.deleteEquipment)

  const lang = i18n.language
  const gn = f => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  const [search,   setSearch]   = useState('')
  const [fFil,     setFFil]     = useState('')
  const [fStat,    setFStat]    = useState('')
  const [fRoom,    setFRoom]    = useState('')
  const [view,     setView]     = useState('grid')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [delId,    setDelId]    = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [form,     setForm]     = useState({ ...EMPTY })
  const photoRef = useRef()

  const filtered = equipment.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.name.toLowerCase().includes(q) || (e.inventaire || '').toLowerCase().includes(q))
      && (!fFil  || e.filiereId === fFil)
      && (!fStat || e.status === fStat)
      && (!fRoom || e.room === fRoom)
  })

  const totalQty    = equipment.reduce((s, e) => s + Number(e.quantity || 0), 0)
  const goodCount   = equipment.filter(e => e.status === 'good').length
  const maintCount  = equipment.filter(e => e.status === 'maintenance').length
  const brokenCount = equipment.filter(e => e.status === 'broken').length

  const openAdd  = () => { setEditItem(null); setForm({ ...EMPTY }); setShowForm(true) }
  const openEdit = (item, e) => { e?.stopPropagation(); setEditItem(item); setForm({ ...item }); setShowForm(true) }

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.name.trim()) return toast.error(t('common.error'))
    if (editItem) updateEquipment(editItem.id, form)
    else addEquipment({ ...form, id: uuidv4(), createdAt: new Date().toISOString() })
    toast.success(t('common.success'))
    setShowForm(false)
  }

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG.good
    const Icon = cfg.icon
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:cfg.bg, color:cfg.color }}>
        <Icon size={11} /> {t(`equipment.${cfg.label}`)}
      </span>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>{t('equipment.title')}</h2>
          <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{equipment.length} {t('equipment.title').toLowerCase()} · {totalQty} {t('equipment.totalQuantity').toLowerCase()}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ display:'flex', border:'1.5px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            {[['grid', Grid], ['table', List]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:'6px 10px', border:'none', cursor:'pointer', background: view===v ? '#1e293b' : 'var(--card)', color: view===v ? '#fff' : '#6b7280', transition:'all 0.15s' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button className="btn btn-amber" onClick={openAdd}>
            <Plus size={15} /> {t('equipment.add')}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:12 }}>
        <Stat icon={Package}     bg="#fef3c7" color="#d97706" value={equipment.length} label={t('equipment.totalItems')} />
        <Stat icon={Layers}      bg="#dbeafe" color="#1d4ed8" value={totalQty}         label={t('equipment.totalQuantity')} />
        <Stat icon={CheckCircle} bg="#dcfce7" color="#15803d" value={goodCount}        label={t('equipment.statuses.good')} />
        <Stat icon={Wrench}      bg="#fef3c7" color="#d97706" value={maintCount}       label={t('equipment.statuses.maintenance')} />
        <Stat icon={XCircle}     bg="#fee2e2" color="#dc2626" value={brokenCount}      label={t('equipment.statuses.broken')} />
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <Search size={14} style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', insetInlineStart:10, color:'#9ca3af', pointerEvents:'none' }} />
            <input className="field-input" style={{ paddingInlineStart:32 }}
              placeholder={t('equipment.search')} value={search}
              onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', insetInlineEnd:10, background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={13} /></button>}
          </div>

          <button className={`chip ${fStat==='' ? 'on' : ''}`} onClick={() => setFStat('')}>{t('students.all')}</button>
          {Object.entries(STATUS_CFG).map(([k, cfg]) => (
            <button key={k} className={`chip ${fStat===k ? 'on' : ''}`} onClick={() => setFStat(fStat===k ? '' : k)}
              style={fStat===k ? { background:cfg.color, borderColor:cfg.color } : {}}>
              {t(`equipment.${cfg.label}`)}
            </button>
          ))}

          <div style={{ width:1, height:20, background:'var(--border)' }} />

          <select className="field-input field-select" style={{ width:'auto', minWidth:160, padding:'6px 32px 6px 12px', fontSize:12 }}
            value={fRoom} onChange={e => setFRoom(e.target.value)}>
            <option value="">{t('equipment.allRooms')}</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="field-input field-select" style={{ width:'auto', minWidth:160, padding:'6px 32px 6px 12px', fontSize:12 }}
            value={fFil} onChange={e => setFFil(e.target.value)}>
            <option value="">{t('equipment.allFilieres')}</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
          </select>

          <span style={{ marginInlineStart:'auto', fontSize:12, color:'#9ca3af', fontWeight:600 }}>{filtered.length} {t('common.total').toLowerCase()}</span>
        </div>
      </div>

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px,1fr))', gap:14 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'64px 0', color:'#9ca3af' }}>
              <Package size={40} color="#e5e7eb" style={{ margin:'0 auto 10px' }} />
              <p style={{ fontSize:13 }}>{t('equipment.noEquipment')}</p>
            </div>
          ) : filtered.map(item => {
            const fil = filieres.find(f => f.id === item.filiereId)
            return (
              <div key={item.id} onClick={() => setViewItem(item)}
                style={{ background:'var(--card)', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', cursor:'pointer', transition:'all 0.18s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='translateY(0)' }}
              >
                <div style={{ height:150, background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid var(--border)', position:'relative', overflow:'hidden' }}>
                  {item.photo
                    ? <img src={item.photo} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <Package size={44} color="#d1d5db" />
                  }
                  <div style={{ position:'absolute', top:8, insetInlineEnd:8 }}><StatusBadge status={item.status} /></div>
                  {item.room && (
                    <div style={{ position:'absolute', bottom:8, insetInlineStart:8, background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>
                      {item.room}
                    </div>
                  )}
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ fontWeight:800, fontSize:14, color:'var(--text)', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                    {item.inventaire && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
                        <Hash size={12} color="#9ca3af" />
                        <span style={{ fontFamily:'monospace' }}>{item.inventaire}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
                      <Layers size={12} color="#9ca3af" />
                      <span>{t('equipment.quantity')}: <strong style={{ color:'var(--text)' }}>{item.quantity}</strong></span>
                    </div>
                    {fil && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6b7280' }}>
                        <Tag size={12} color="#9ca3af" />
                        <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{gn(fil)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6, borderTop:'1px solid var(--border)', paddingTop:10 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-white btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={e => openEdit(item, e)}>
                      <Edit2 size={13} /> {t('common.edit')}
                    </button>
                    <button className="btn btn-red btn-icon-only btn-sm" onClick={e => { e.stopPropagation(); setDelId(item.id) }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="card">
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width:52 }}>{t('equipment.photo')}</th>
                  <th>{t('equipment.name')}</th>
                  <th>{t('equipment.inventaire')}</th>
                  <th style={{ textAlign:'center' }}>{t('equipment.quantity')}</th>
                  <th>{t('equipment.room')}</th>
                  <th>{t('equipment.filiere')}</th>
                  <th>{t('equipment.status')}</th>
                  <th style={{ textAlign:'center' }}>{t('students.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
                    <Package size={32} color="#e5e7eb" style={{ margin:'0 auto 8px' }} />
                    <div>{t('equipment.noEquipment')}</div>
                  </td></tr>
                ) : filtered.map(item => {
                  const fil = filieres.find(f => f.id === item.filiereId)
                  return (
                    <tr key={item.id} style={{ cursor:'pointer' }} onClick={() => setViewItem(item)}>
                      <td>
                        <div style={{ width:40, height:40, borderRadius:8, overflow:'hidden', background:'#f3f4f6', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {item.photo ? <img src={item.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Package size={16} color="#d1d5db" />}
                        </div>
                      </td>
                      <td style={{ fontWeight:700 }}>{item.name}</td>
                      <td style={{ fontFamily:'monospace', fontSize:12, color:'#6b7280' }}>{item.inventaire || '—'}</td>
                      <td style={{ textAlign:'center', fontWeight:800, fontSize:15 }}>{item.quantity}</td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{item.room || '—'}</td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{fil ? gn(fil) : '—'}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        <div style={{ display:'flex', gap:4, justifyContent:'center' }} onClick={e => e.stopPropagation()}>
                          <button className="btn btn-white btn-icon-only btn-sm" onClick={e => openEdit(item, e)}><Edit2 size={13} /></button>
                          <button className="btn btn-red btn-icon-only btn-sm" onClick={() => setDelId(item.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="modal-bg" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{editItem ? t('equipment.edit') : t('equipment.add')}</span>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>
            <div className="modal-body">
              {/* Photo + name */}
              <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:20 }}>
                <div style={{ width:90, height:90, borderRadius:12, overflow:'hidden', background:'#f3f4f6', border:'2px dashed #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}
                  onClick={() => photoRef.current.click()}>
                  {form.photo
                    ? <img src={form.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ textAlign:'center' }}>
                        <ImagePlus size={22} color="#d1d5db" style={{ margin:'0 auto 4px' }} />
                        <span style={{ fontSize:10, color:'#9ca3af' }}>{t('equipment.addPhoto')}</span>
                      </div>
                  }
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
                <div style={{ flex:1 }}>
                  <div className="field">
                    <label className="field-label">{t('equipment.name')} <span style={{ color:'#ef4444' }}>*</span></label>
                    <input className="field-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="field">
                  <label className="field-label">{t('equipment.inventaire')}</label>
                  <input className="field-input" style={{ fontFamily:'monospace' }} value={form.inventaire || ''} onChange={e => setForm(f => ({ ...f, inventaire: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">{t('equipment.quantity')}</label>
                  <input type="number" min="1" className="field-input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
                </div>
                <div className="field">
                  <label className="field-label">{t('equipment.room')}</label>
                  <select className="field-input field-select" value={form.room || ''} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}>
                    <option value="">—</option>
                    {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('equipment.filiere')}</label>
                  <select className="field-input field-select" value={form.filiereId} onChange={e => setForm(f => ({ ...f, filiereId: e.target.value }))}>
                    <option value="">—</option>
                    {filieres.map(f => <option key={f.id} value={f.id}>{gn(f)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('equipment.status')}</label>
                  <select className="field-input field-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_CFG).map(([k, cfg]) => (
                      <option key={k} value={k}>{t(`equipment.${cfg.label}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.schoolYear')}</label>
                  <select className="field-input field-select" value={form.schoolYear || ''} onChange={e => setForm(f => ({ ...f, schoolYear: e.target.value }))}>
                    {YEAR_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="field" style={{ gridColumn:'span 2' }}>
                  <label className="field-label">{t('equipment.description')}</label>
                  <textarea className="field-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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

      {/* DETAIL VIEW MODAL */}
      {viewItem && (
        <div className="modal-bg" onClick={() => setViewItem(null)}>
          <div className="modal" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{viewItem.name}</span>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-white btn-sm" onClick={e => { setViewItem(null); openEdit(viewItem, e) }}>
                  <Edit2 size={13} /> {t('common.edit')}
                </button>
                <button className="btn btn-ghost btn-icon-only" onClick={() => setViewItem(null)}><X size={15} /></button>
              </div>
            </div>
            <div className="modal-body">
              <div style={{ width:'100%', height:200, borderRadius:12, overflow:'hidden', background:'#f3f4f6', border:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                {viewItem.photo ? <img src={viewItem.photo} alt={viewItem.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Package size={52} color="#d1d5db" />}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
                {[
                  [t('equipment.name'),       viewItem.name],
                  [t('equipment.inventaire'), viewItem.inventaire || '—'],
                  [t('equipment.quantity'),   viewItem.quantity],
                  [t('equipment.room'),       viewItem.room || '—'],
                  [t('equipment.filiere'),    gn(filieres.find(f => f.id === viewItem.filiereId))],
                  [t('common.schoolYear'),    viewItem.schoolYear || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:4 }}>{t('equipment.status')}</div>
                  <StatusBadge status={viewItem.status} />
                </div>
              </div>
              {viewItem.description && (
                <div style={{ marginTop:14, padding:'10px 12px', background:'#f9fafb', borderRadius:8, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600, marginBottom:4 }}>{t('equipment.description')}</div>
                  <div style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{viewItem.description}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!delId}
        title={t('equipment.delete')}
        message={t('equipment.confirmDelete')}
        onConfirm={() => { deleteEquipment(delId); setDelId(null); toast.success(t('common.success')) }}
        onCancel={() => setDelId(null)}
      />
    </div>
  )
}
