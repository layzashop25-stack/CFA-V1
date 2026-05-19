import { useTranslation } from 'react-i18next'
import { X, Download, User, BookOpen, Heart, Users, CreditCard } from 'lucide-react'
import useStore from '../../store/useStore'
import { generateStudentPDF, generateStudentCarte } from '../../utils/exportPDF'

const Sec = ({ icon: Icon, title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={13} color="#d97706" />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>{children}</div>
  </div>
)

const F = ({ label, value, full }) => {
  if (!value && value !== 0) return null
  return (
    <div style={full ? { gridColumn: 'span 2' } : {}}>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

export default function StudentCard({ student, onClose }) {
  const { t, i18n } = useTranslation()
  const filieres = useStore(s => s.filieres)
  const lang = i18n.language
  const fil = filieres.find(f => f.id === student.filiereId)
  const filName = fil ? (lang === 'ar' ? fil.nameAr : lang === 'fr' ? fil.nameFr : fil.nameEn) : '—'
  const Fl = t('students.fields', { returnObjects: true })
  const bool = v => v ? t('students.yes') : t('students.no')

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-head-title">{t('students.viewStudent')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-white btn-sm" onClick={() => generateStudentCarte(student, fil, t)}>
              <CreditCard size={13} color="#7c3aed" /> {t('students.downloadCarte')}
            </button>
            <button className="btn btn-amber btn-sm" onClick={() => generateStudentPDF(student, fil, t)}>
              <Download size={13} /> {t('students.downloadPDF')}
            </button>
            <button className="btn btn-ghost btn-icon-only" onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Banner */}
        <div style={{ background: '#1e293b', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
            {student.fullName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{student.fullName}</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{filName} · {t(`students.levels.${student.educationLevel}`)}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{Fl.cinNumber}: {student.cinNumber} · {student.phone}</div>
          </div>
          <span className={`badge ${student.isDropout ? 'badge-red' : 'badge-green'}`}>
            <span className="badge-dot" style={{ background: student.isDropout ? '#dc2626' : '#16a34a' }} />
            {student.isDropout ? t('students.dropout') : t('students.active')}
          </span>
        </div>

        <div className="modal-body" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <Sec icon={User} title={t('students.steps.personal')}>
            <F label={Fl.registrationNumber} value={student.registrationNumber} />
            <F label={Fl.sex} value={student.sex} />
            <F label={Fl.birthDate} value={student.birthDate} />
            <F label={Fl.birthPlace} value={student.birthPlace} />
            <F label={Fl.address} value={student.address} full />
            <F label={Fl.familyStatus} value={t(`students.familyStatus.${student.familyStatus}`)} />
            <F label={Fl.maritalStatus} value={t(`students.maritalStatus.${student.maritalStatus}`)} />
          </Sec>
          <Sec icon={BookOpen} title={t('students.steps.academic')}>
            <F label={Fl.filiereId} value={filName} />
            <F label={Fl.educationLevel} value={t(`students.levels.${student.educationLevel}`)} />
            <F label={t('common.schoolYear')} value={student.schoolYear} />
            <F label={Fl.stillStudying} value={bool(student.stillStudying)} />
            <F label={Fl.otherTraining} value={bool(student.otherTraining)} />
            {student.isDropout && <F label={Fl.dropoutDate} value={student.dropoutDate} />}
            {student.isDropout && <F label={Fl.dropoutReason} value={student.dropoutReason} full />}
          </Sec>
          <Sec icon={Users} title={t('students.steps.guardian')}>
            <F label={Fl.guardianName} value={student.guardianName} />
            <F label={Fl.guardianPhone} value={student.guardianPhone} />
            <F label={Fl.guardianProfession} value={student.guardianProfession} />
          </Sec>
          <Sec icon={Heart} title={t('students.steps.health')}>
            <F label={Fl.healthStatus} value={t(`students.healthStatus.${student.healthStatus}`)} />
            <F label={Fl.healthCoverage} value={student.healthCoverage} />
            <F label={Fl.transportMode} value={t(`students.transportMode.${student.transportMode}`)} />
            <F label={Fl.residenceArea} value={t(`students.residenceArea.${student.residenceArea}`)} />
            <F label={Fl.hasFixedIncome} value={bool(student.hasFixedIncome)} />
            <F label={Fl.receivesSocialSupport} value={bool(student.receivesSocialSupport)} />
            <F label={Fl.isWorking} value={bool(student.isWorking)} />
            {student.isWorking && <F label={Fl.currentJob} value={student.currentJob} />}
            {student.notes && <F label={Fl.notes} value={student.notes} full />}
          </Sec>
        </div>
      </div>
    </div>
  )
}
