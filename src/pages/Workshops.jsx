import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, X, Calendar, Image, Tag, ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import useStore from '../store/useStore'
import ConfirmModal from '../components/shared/ConfirmModal'
import toast from 'react-hot-toast'
import { generateWorkshopRapport } from '../utils/exportPDF'

const STATUS_COLORS = {
  upcoming: { bg: '#dbeafe', color: '#1d4ed8', label: { ar: 'قادم', fr: 'À venir', en: 'Upcoming' } },
  ongoing:  { bg: '#dcfce7', color: '#15803d', label: { ar: 'جارٍ', fr: 'En cours', en: 'Ongoing' } },
  done:     { bg: '#f3f4f6', color: '#4b5563', label: { ar: 'منتهي', fr: 'Terminé', en: 'Done' } },
}

const EMPTY = { titleAr: '', titleFr: '', titleEn: '', descAr: '', descFr: '', descEn: '', occasion: '', date: '', status: 'upcoming', images: [], beneficiaires: '', partenaire: '', encadrant: '' }

const titleKey = lang => lang === 'fr' ? 'titleFr' : lang === 'en' ? 'titleEn' : 'titleAr'
const descKey  = lang => lang === 'fr' ? 'descFr'  : lang === 'en' ? 'descEn'  : 'descAr'

/* ── Mini slideshow for the card ── */
function CardGallery({ images, title }) {
  const [idx, setIdx] = useState(0)
  const total = images.length
  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % total) }

  if (!total) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image size={40} color="#d1d5db" />
    </div>
  )

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <img src={images[idx]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {total > 1 && <>
        <button onClick={prev} style={{ position: 'absolute', top: '50%', insetInlineStart: 6, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={next} style={{ position: 'absolute', top: '50%', insetInlineEnd: 6, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <ChevronRight size={14} />
        </button>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {images.map((_, i) => (
            <span key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, background: i === idx ? '#f59e0b' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s' }} />
          ))}
        </div>
        {/* Counter */}
        <span style={{ position: 'absolute', bottom: 8, insetInlineEnd: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
          {idx + 1}/{total}
        </span>
      </>}
    </div>
  )
}

export default function Workshops() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const workshops = useStore(s => s.workshops)
  const addWorkshop = useStore(s => s.addWorkshop)
  const updateWorkshop = useStore(s => s.updateWorkshop)
  const deleteWorkshop = useStore(s => s.deleteWorkshop)

  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editW, setEditW] = useState(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [delId, setDelId] = useState(null)

  const gn = w => lang === 'ar' ? w.titleAr : lang === 'fr' ? w.titleFr : w.titleEn
  const gd = w => lang === 'ar' ? w.descAr  : lang === 'fr' ? w.descFr  : w.descEn

  const filtered = workshops.filter(w => !filter || w.status === filter)
  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date))

  const openAdd  = () => { setEditW(null); setForm({ ...EMPTY, images: [] }); setShowForm(true) }
  const openEdit = w  => { setEditW(w);   setForm({ ...w, images: w.images || [] }); setShowForm(true) }

  const handleImages = e => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setForm(f => ({ ...f, images: [...f.images, ev.target.result] }))
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const handleSave = () => {
    if (!form[titleKey(lang)].trim()) return toast.error(t('common.error'))
    if (editW) updateWorkshop(editW.id, form)
    else addWorkshop({ ...form, id: uuidv4(), createdAt: new Date().toISOString() })
    toast.success(t('common.success'))
    setShowForm(false)
  }

  const counts = {
    upcoming: workshops.filter(w => w.status === 'upcoming').length,
    ongoing:  workshops.filter(w => w.status === 'ongoing').length,
    done:     workshops.filter(w => w.status === 'done').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{t('workshops.title')}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{workshops.length} {t('workshops.total')}</p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}><Plus size={15} /> {t('workshops.add')}</button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={`chip ${filter === '' ? 'on' : ''}`} onClick={() => setFilter('')}>{t('students.all')} ({workshops.length})</button>
        {Object.entries(STATUS_COLORS).map(([k, v]) => (
          <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
            {v.label[lang] || v.label.ar} ({counts[k]})
          </button>
        ))}
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="card" style={{ padding: '48px 0', textAlign: 'center', color: '#9ca3af' }}>
          <Calendar size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14 }}>{t('workshops.noWorkshops')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sorted.map(w => {
            const sc = STATUS_COLORS[w.status] || STATUS_COLORS.upcoming
            const images = w.images || (w.image ? [w.image] : [])
            const dateStr = w.date ? new Date(w.date).toLocaleDateString(
              lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            ) : '—'
            return (
              <div key={w.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Gallery */}
                <div style={{ height: 200, background: '#f3f4f6', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <CardGallery images={images} title={gn(w)} />
                  <span style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {sc.label[lang] || sc.label.ar}
                  </span>
                  <div style={{ position: 'absolute', top: 8, insetInlineEnd: 8, display: 'flex', gap: 4 }}>
                    <button className="btn btn-white btn-icon-only btn-sm" style={{ background: 'rgba(255,255,255,0.9)' }} onClick={() => openEdit(w)}><Edit2 size={12} /></button>
                    <button className="btn btn-red btn-icon-only btn-sm" style={{ background: 'rgba(239,68,68,0.9)' }} onClick={() => setDelId(w.id)}><Trash2 size={12} /></button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>{gn(w) || '—'}</h3>
                  {gd(w) && <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{gd(w)}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                    {w.beneficiaires && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <span style={{ fontWeight: 600 }}>{t('workshops.beneficiaires')}:</span> {w.beneficiaires}
                      </div>
                    )}
                    {w.encadrant && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <span style={{ fontWeight: 600 }}>{t('workshops.encadrant')}:</span> {w.encadrant}
                      </div>
                    )}
                    {w.partenaire && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <span style={{ fontWeight: 600 }}>{t('workshops.partenaire')}:</span> {w.partenaire}
                      </div>
                    )}
                    {w.occasion && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                        <Tag size={12} color="#f59e0b" />
                        <span style={{ fontWeight: 600 }}>{t('workshops.occasion')}:</span> {w.occasion}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                      <Calendar size={12} color="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>{t('workshops.date')}:</span> {dateStr}
                    </div>
                    {/* Rapport generate button */}
                    <button
                      onClick={() => generateWorkshopRapport(w, lang, t)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '5px 12px', borderRadius: 7, background: '#1e293b', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      <FileDown size={13} /> {t('workshops.downloadRapport')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-bg" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{editW ? t('workshops.edit') : t('workshops.add')}</span>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label className="field-label">{t('workshops.titleLabel')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="field-input" value={form[titleKey(lang)] || ''}
                  onChange={e => setForm(f => ({ ...f, [titleKey(lang)]: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">{t('workshops.descLabel')}</label>
                <textarea className="field-input" rows={3} value={form[descKey(lang)] || ''}
                  onChange={e => setForm(f => ({ ...f, [descKey(lang)]: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label className="field-label">{t('workshops.beneficiaires')}</label>
                  <input className="field-input" value={form.beneficiaires || ''} onChange={e => setForm(f => ({ ...f, beneficiaires: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">{t('workshops.encadrant')}</label>
                  <input className="field-input" value={form.encadrant || ''} onChange={e => setForm(f => ({ ...f, encadrant: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">{t('workshops.partenaire')}</label>
                  <input className="field-input" value={form.partenaire || ''} onChange={e => setForm(f => ({ ...f, partenaire: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label className="field-label">{t('workshops.occasion')}</label>
                  <input className="field-input" value={form.occasion || ''} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))} placeholder={t('workshops.occasionPlaceholder')} />
                </div>
                <div className="field">
                  <label className="field-label">{t('workshops.date')}</label>
                  <input type="date" className="field-input" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">{t('workshops.status')}</label>
                  <select className="field-input field-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label[lang] || v.label.ar}</option>)}
                  </select>
                </div>
              </div>

              {/* Multi-image upload */}
              <div className="field">
                <label className="field-label">{t('workshops.images')} ({form.images.length})</label>
                {/* Thumbnails */}
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: 72, height: 56 }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                        <button onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: -6, insetInlineEnd: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <span className="btn btn-white btn-sm"><Image size={13} /> {t('workshops.addImages')}</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-white" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              <button className="btn btn-amber" onClick={handleSave}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!delId} title={t('workshops.delete')} message={t('workshops.confirmDelete')}
        onConfirm={() => { deleteWorkshop(delId); setDelId(null); toast.success(t('common.success')) }}
        onCancel={() => setDelId(null)} />
    </div>
  )
}
