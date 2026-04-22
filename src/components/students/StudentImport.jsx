import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X } from 'lucide-react'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function StudentImport({ onClose }) {
  const { t } = useTranslation()
  const addStudent = useStore(s => s.addStudent)
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws)
        const now = new Date().toISOString()
        let count = 0
        rows.forEach(row => {
          if (!row['الاسم الكامل'] && !row['fullName']) return
          addStudent({
            id: uuidv4(),
            fullName: row['الاسم الكامل'] || row['fullName'] || '',
            cinNumber: row['رقم البطاقة'] || row['cinNumber'] || '',
            phone: row['الهاتف'] || row['phone'] || '',
            birthDate: row['تاريخ الازدياد'] || row['birthDate'] || '',
            birthPlace: row['مكان الازدياد'] || row['birthPlace'] || '',
            address: row['العنوان'] || row['address'] || '',
            educationLevel: row['المستوى'] || row['educationLevel'] || '9eme',
            filiereId: row['الشعبة'] || row['filiereId'] || '',
            enrollmentYear: row['سنة التسجيل'] || row['enrollmentYear'] || new Date().getFullYear().toString(),
            isDropout: false, dropoutDate: '', dropoutReason: '',
            stillStudying: false, otherTraining: false, desiredFiliere: '',
            guardianName: row['ولي الأمر'] || '', guardianProfession: '', guardianPhone: '',
            familyStatus: 'وسط_عادي', maritalStatus: 'عازب',
            healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'AMO',
            transportMode: 'حافلة', hasFixedIncome: false, receivesSocialSupport: false,
            residenceArea: 'حضري', isWorking: false, currentJob: '', notes: '',
            createdAt: now, updatedAt: now
          })
          count++
        })
        toast.success(`${t('data.importSuccess')}: ${count} ${t('data.students')}`)
        onClose()
      } catch {
        toast.error(t('data.importError'))
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-green-800">{t('students.importExcel')}</h3>
          <button className="btn-secondary btn-sm btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div
          className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:bg-green-50 transition-colors"
          onClick={() => fileRef.current.click()}
        >
          <Upload size={32} className="text-green-600 mx-auto mb-2" />
          <p className="font-semibold text-green-700">{t('students.importExcel')}</p>
          <p className="text-gray-400 text-xs mt-1">.xlsx, .xls</p>
          <p className="text-gray-400 text-xs mt-2">
            الأعمدة المطلوبة: الاسم الكامل، رقم البطاقة، الهاتف، المستوى، الشعبة
          </p>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
