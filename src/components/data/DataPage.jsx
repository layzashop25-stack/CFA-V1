import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Download, AlertTriangle, CheckCircle, FileJson } from 'lucide-react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function DataPage() {
  const { t } = useTranslation()
  const store = useStore()
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [exportSel, setExportSel] = useState({ students: true, filieres: true, absences: true, notes: true })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result)
        setImportFile(json)
        setPreview({
          students: (json.data?.students || []).length,
          filieres: (json.data?.filieres || []).length,
          absences: (json.data?.absences || []).length,
          notes: (json.data?.notes || []).length,
          exportDate: json.exportDate,
          version: json.version
        })
      } catch {
        toast.error(t('data.importError'))
      }
    }
    reader.readAsText(file)
  }

  const handleImport = (mode) => {
    if (!importFile?.data) return toast.error(t('data.importError'))
    store.importData(importFile.data, mode)
    toast.success(t('data.importSuccess'))
    setPreview(null)
    setImportFile(null)
  }

  const handleExport = () => {
    const data = {}
    if (exportSel.students) data.students = store.students
    if (exportSel.filieres) data.filieres = store.filieres
    if (exportSel.absences) data.absences = store.absences
    if (exportSel.notes) data.notes = store.notes

    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString().split('T')[0],
      centerName: 'مركز التكوين المهني',
      data
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `center-data-${payload.exportDate}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('data.exportSuccess'))
  }

  const keys = ['students', 'filieres', 'absences', 'notes']

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">{t('data.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import card */}
        <div className="page-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t('data.import')}</h2>
              <p className="text-gray-500 text-sm">{t('data.importDesc')}</p>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors mb-4"
            onClick={() => fileRef.current.click()}
          >
            <FileJson size={32} className="text-blue-400 mx-auto mb-2" />
            <p className="font-semibold text-blue-600">{t('data.chooseFile')}</p>
            <p className="text-gray-400 text-xs mt-1">.json</p>
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

          {preview && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-semibold text-green-700 text-sm">{t('data.preview')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {keys.map(k => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-600">{t(`data.${k}`)}</span>
                    <span className="font-bold text-green-700">{preview[k]}</span>
                  </div>
                ))}
              </div>
              {preview.exportDate && <p className="text-xs text-gray-400 mt-2">{preview.exportDate}</p>}
            </div>
          )}

          {preview && (
            <>
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-yellow-700 text-xs">{t('data.replaceWarning')}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => handleImport('merge')}>
                  {t('data.importMerge')}
                </button>
                <button className="btn-danger flex-1 justify-center" onClick={() => handleImport('replace')}>
                  {t('data.importReplace')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Export card */}
        <div className="page-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{t('data.export')}</h2>
              <p className="text-gray-500 text-sm">{t('data.exportDesc')}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {keys.map(k => (
              <label key={k} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportSel[k]}
                  onChange={e => setExportSel(s => ({ ...s, [k]: e.target.checked }))}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="font-medium">{t(`data.${k}`)}</span>
                <span className="ms-auto text-gray-400 text-sm">
                  {k === 'students' ? store.students.length :
                   k === 'filieres' ? store.filieres.length :
                   k === 'absences' ? store.absences.length :
                   store.notes.length}
                </span>
              </label>
            ))}
          </div>

          <button className="btn-primary w-full justify-center" onClick={handleExport}>
            <Download size={16} /> {t('data.exportNow')}
          </button>
        </div>
      </div>
    </div>
  )
}
