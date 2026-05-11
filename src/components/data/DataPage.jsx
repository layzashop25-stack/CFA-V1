import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Upload, Download, AlertTriangle, CheckCircle,
  FileJson, Trash2, RefreshCw, Database,
  Users, BookOpen, CalendarX2, ClipboardList, UserCog, Wrench
} from 'lucide-react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

const KEYS = ['students', 'filieres', 'absences', 'notes', 'trainers', 'equipment']

const KEY_ICONS = {
  students:  { icon: Users,        color: '#3b82f6', bg: '#dbeafe' },
  filieres:  { icon: BookOpen,     color: '#8b5cf6', bg: '#ede9fe' },
  absences:  { icon: CalendarX2,   color: '#f59e0b', bg: '#fef3c7' },
  notes:     { icon: ClipboardList,color: '#10b981', bg: '#d1fae5' },
  trainers:  { icon: UserCog,      color: '#ec4899', bg: '#fce7f3' },
  equipment: { icon: Wrench,       color: '#06b6d4', bg: '#cffafe' },
}

export default function DataPage() {
  const { t } = useTranslation()

  const students   = useStore(s => s.students)
  const filieres   = useStore(s => s.filieres)
  const absences   = useStore(s => s.absences)
  const notes      = useStore(s => s.notes)
  const trainers   = useStore(s => s.trainers)
  const equipment  = useStore(s => s.equipment)
  const importData = useStore(s => s.importData)
  const clearAll   = useStore(s => s.clearAll)

  const storeData = { students, filieres, absences, notes, trainers, equipment }
  const counts    = { students: students.length, filieres: filieres.length, absences: absences.length, notes: notes.length, trainers: trainers.length, equipment: equipment.length }

  const fileRef = useRef()
  const [preview,     setPreview]     = useState(null)
  const [importFile,  setImportFile]  = useState(null)
  const [exportSel,   setExportSel]   = useState({ students: true, filieres: true, absences: true, notes: true, trainers: true, equipment: true })
  const [confirmClear, setConfirmClear] = useState(false)

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result)
        setImportFile(json)
        setPreview({
          students:  (json.data?.students  || []).length,
          filieres:  (json.data?.filieres  || []).length,
          absences:  (json.data?.absences  || []).length,
          notes:     (json.data?.notes     || []).length,
          trainers:  (json.data?.trainers  || []).length,
          equipment: (json.data?.equipment || []).length,
          exportDate: json.exportDate,
        })
      } catch {
        toast.error(t('data.importError'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = mode => {
    if (!importFile?.data) return toast.error(t('data.importError'))
    importData(importFile.data, mode)
    toast.success(t('data.importSuccess'))
    setPreview(null)
    setImportFile(null)
  }

  const handleExport = () => {
    const data = {}
    KEYS.forEach(k => { if (exportSel[k]) data[k] = storeData[k] })
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString().split('T')[0],
      centerName: 'مركز التكوين المهني',
      data
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `cfp-data-${payload.exportDate}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('data.exportSuccess'))
  }

  const handleCleanOrphans = () => {
    const studentIds = new Set(students.map(s => s.id))
    importData({
      students,
      filieres,
      absences:  absences.filter(a => studentIds.has(a.studentId)),
      notes:     notes.filter(n => studentIds.has(n.studentId)),
      trainers,
      equipment,
    }, 'replace')
    toast.success(t('data.cleanSuccess'))
  }

  // orphaned records count
  const studentIds    = new Set(students.map(s => s.id))
  const orphanAbsences = absences.filter(a => !studentIds.has(a.studentId)).length
  const orphanNotes    = notes.filter(n => !studentIds.has(n.studentId)).length
  const hasOrphans     = orphanAbsences > 0 || orphanNotes > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Database size={22} color="#f59e0b" />
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{t('data.title')}</h1>
      </div>

      {/* Orphan warning banner */}
      {hasOrphans && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12 }}>
          <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>{t('data.orphanTitle')}</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
              {orphanAbsences > 0 && <span>{orphanAbsences} {t('data.absences')} · </span>}
              {orphanNotes > 0 && <span>{orphanNotes} {t('data.notes')}</span>}
              <span> — {t('data.orphanDesc')}</span>
            </div>
          </div>
          <button onClick={handleCleanOrphans}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <RefreshCw size={13} /> {t('data.cleanOrphans')}
          </button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 12 }}>
        {KEYS.map(k => {
          const { icon: Icon, color, bg } = KEY_ICONS[k]
          return (
            <div key={k} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{counts[k]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t(`data.${k}`)}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20 }}>

        {/* ── IMPORT ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: '#dbeafe', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={20} color="#1d4ed8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{t('data.import')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('data.importDesc')}</div>
            </div>
          </div>

          <div onClick={() => fileRef.current.click()}
            style={{ border: '2px dashed #93c5fd', borderRadius: 12, padding: '22px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#93c5fd' }}>
            <FileJson size={28} color="#60a5fa" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: '#1d4ed8', fontSize: 13 }}>{t('data.chooseFile')}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>.json</div>
          </div>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />

          {preview && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <CheckCircle size={14} color="#16a34a" />
                <span style={{ fontWeight: 700, color: '#15803d', fontSize: 13 }}>{t('data.preview')}</span>
                {preview.exportDate && <span style={{ marginInlineStart: 'auto', fontSize: 11, color: '#9ca3af' }}>{preview.exportDate}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                {KEYS.map(k => {
                  const { icon: Icon, color } = KEY_ICONS[k]
                  return (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <Icon size={12} color={color} />
                      <span style={{ color: '#374151', flex: 1 }}>{t(`data.${k}`)}</span>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>{preview[k]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {preview && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#fefce8', border: '1px solid #fde047', borderRadius: 8, marginBottom: 12 }}>
                <AlertTriangle size={13} color="#ca8a04" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: '#92400e' }}>{t('data.replaceWarning')}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleImport('merge')}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1.5px solid #3b82f6', background: 'transparent', color: '#1d4ed8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {t('data.importMerge')}
                </button>
                <button onClick={() => handleImport('replace')}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {t('data.importReplace')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── EXPORT ── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: '#dcfce7', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={20} color="#15803d" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{t('data.export')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('data.exportDesc')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {KEYS.map(k => {
              const { icon: Icon, color, bg } = KEY_ICONS[k]
              return (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `1.5px solid ${exportSel[k] ? color + '40' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: exportSel[k] ? bg + '60' : 'transparent', transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={exportSel[k]}
                    onChange={e => setExportSel(s => ({ ...s, [k]: e.target.checked }))}
                    style={{ width: 15, height: 15, accentColor: color, cursor: 'pointer' }} />
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: 'var(--text)' }}>{t(`data.${k}`)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '2px 10px', borderRadius: 20 }}>
                    {counts[k]}
                  </span>
                </label>
              )
            })}
          </div>

          <button onClick={handleExport}
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Download size={16} /> {t('data.exportNow')}
          </button>

          {/* Danger zone */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)}
                style={{ width: '100%', padding: '9px 0', borderRadius: 10, border: '1.5px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <Trash2 size={14} /> {t('data.clearAll')}
              </button>
            ) : (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 10 }}>{t('data.clearConfirm')}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setConfirmClear(false)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #d1d5db', background: 'var(--card)', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {t('common.cancel')}
                  </button>
                  <button onClick={() => { clearAll(); setConfirmClear(false); toast.success(t('data.clearSuccess')) }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {t('data.clearAll')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
