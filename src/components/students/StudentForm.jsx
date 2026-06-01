import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { Check, X } from 'lucide-react'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

const STEPS = ['personal', 'academic', 'guardian', 'health']
const CY = new Date().getFullYear()
const YEAR_OPTS = Array.from({ length: CY - 2024 + 3 }, (_, i) => { const y = 2024 + i; return `${y}/${y+1}` })

const LEVEL_DIPLOMA = {
  cap:     ['CAP'],
  '6eme':  ['DSP'],
  '3eme':  ['DQP'],
  bac:     ['DQP', 'DSP'],
  bacplus: ['DQP', 'DSP'],
}

const EMPTY = {
  registrationNumber: '', fullName: '', sex: 'ذكر',
  birthDate: '', birthPlace: '', address: '', cinNumber: '', phone: '',
  educationLevel: '3eme', stillStudying: false, otherTraining: false,
  desiredFiliere: '', filiereId: '',
  schoolYear: `${CY}/${CY+1}`,
  isDropout: false, dropoutDate: '', dropoutReason: '',
  guardianName: '', guardianProfession: '', guardianPhone: '',
  familyStatus: 'وسط_عادي', maritalStatus: 'عازب',
  healthStatus: 'جيدة', disabilityType: '', healthCoverage: 'AMO',
  transportMode: 'حافلة', hasFixedIncome: false, receivesSocialSupport: false,
  residenceArea: 'حضري', isWorking: false, currentJob: '', notes: ''
}

function Inp({ field, type = 'text', req, span2, label, value, onChange, error }) {
  return (
    <div className="field" style={span2 ? { gridColumn: 'span 2' } : {}}>
      <label className="field-label">
        {label}{req && <span style={{ color: '#ef4444', marginInlineStart: 3 }}>*</span>}
      </label>
      <input type={type} className={`field-input${error ? ' err' : ''}`}
        value={value || ''} onChange={e => onChange(field, e.target.value)} />
    </div>
  )
}

function Sel({ field, opts, req, span2, label, value, onChange, error }) {
  return (
    <div className="field" style={span2 ? { gridColumn: 'span 2' } : {}}>
      <label className="field-label">
        {label}{req && <span style={{ color: '#ef4444', marginInlineStart: 3 }}>*</span>}
      </label>
      <select className={`field-input field-select${error ? ' err' : ''}`}
        value={value || ''} onChange={e => onChange(field, e.target.value)}>
        <option value="">—</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function Tog({ field, label, value, onChange, yesLabel, noLabel }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div style={{ display: 'flex', gap: 16, marginTop: 2 }}>
        {[true, false].map(v => (
          <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
            <input type="radio" checked={value === v} onChange={() => onChange(field, v)}
              style={{ accentColor: '#f59e0b', width: 15, height: 15 }} />
            {v ? yesLabel : noLabel}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function StudentForm({ student, onClose }) {
  const { t } = useTranslation()
  const filieres = useStore(s => s.filieres)
  const addStudent = useStore(s => s.addStudent)
  const updateStudent = useStore(s => s.updateStudent)
  const nextMatricule = useStore(s => s.nextMatricule)
  const [step, setStep] = useState(0)
  const today = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState(student ? { ...student } : { ...EMPTY, registrationNumber: nextMatricule(), enrollmentDate: today })
  const [errors, setErrors] = useState({})

  const set = (f, v) => setData(d => ({ ...d, [f]: v }))

  const allowedDiplomas = LEVEL_DIPLOMA[data.educationLevel] || ['DSP', 'DQP', 'CAP']
  const filOpts = filieres.filter(f => allowedDiplomas.includes(f.diplomaType)).map(f => [f.id, f.nameAr])

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!data.fullName?.trim()) e.fullName = true
      if (!data.cinNumber?.trim()) e.cinNumber = true
      if (!data.phone?.trim()) e.phone = true
    }
    if (step === 1 && !data.filiereId) e.filiereId = true
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = () => {
    if (!validate()) return
    const now = new Date().toISOString()
    if (student) updateStudent(student.id, { ...data, updatedAt: now })
    else addStudent({ ...data, id: uuidv4(), enrollmentDate: data.enrollmentDate || today, createdAt: now, updatedAt: now })
    toast.success(t('common.success'))
    onClose()
  }

  const F = t('students.fields', { returnObjects: true })
  const lvlOpts  = [['cap', t('students.levels.cap')], ['6eme', t('students.levels.6eme')], ['3eme', t('students.levels.3eme')], ['bac', t('students.levels.bac')], ['bacplus', t('students.levels.bacplus')]]
  const sexOpts  = [['ذكر', t('students.sex.male')], ['أنثى', t('students.sex.female')]]
  const famOpts  = Object.entries(t('students.familyStatus',  { returnObjects: true }))
  const marOpts  = Object.entries(t('students.maritalStatus', { returnObjects: true }))
  const hlthOpts = Object.entries(t('students.healthStatus',  { returnObjects: true }))
  const covOpts  = Object.entries(t('students.healthCoverage',{ returnObjects: true }))
  const transOpts= Object.entries(t('students.transportMode', { returnObjects: true }))
  const resOpts  = Object.entries(t('students.residenceArea', { returnObjects: true }))

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-head-title">{student ? t('students.editStudent') : t('students.addStudent')}</span>
          <button className="btn btn-ghost btn-icon-only" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="modal-body">
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s} className="step" style={{ flex: 1 }}>
                <div className={`step-num ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`step-text ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  {t(`students.steps.${s}`)}
                </span>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{ flex: 1 }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* ── Step 0: Personal ── */}
            {step === 0 && <>
              <Inp field="registrationNumber" label={F.registrationNumber} value={data.registrationNumber} onChange={set} />
              <Inp field="enrollmentDate" type="date" label={F.enrollmentDate || 'تاريخ التسجيل'} value={data.enrollmentDate} onChange={set} />
              <Sel field="sex" opts={sexOpts} req label={F.sex} value={data.sex} onChange={set} />
              <Inp field="fullName" req span2 label={F.fullName} value={data.fullName} onChange={set} error={errors.fullName} />
              <Inp field="cinNumber" req label={F.cinNumber} value={data.cinNumber} onChange={set} error={errors.cinNumber} />
              <Inp field="phone" type="tel" req label={F.phone} value={data.phone} onChange={set} error={errors.phone} />
              <Inp field="birthDate" type="date" label={F.birthDate} value={data.birthDate} onChange={set} />
              <Inp field="birthPlace" label={F.birthPlace} value={data.birthPlace} onChange={set} />
              <Inp field="address" span2 label={F.address} value={data.address} onChange={set} />
              <Sel field="maritalStatus" opts={marOpts} label={F.maritalStatus} value={data.maritalStatus} onChange={set} />
            </>}

            {/* ── Step 1: Academic ── */}
            {step === 1 && <>
              <Sel field="educationLevel" opts={lvlOpts} label={F.educationLevel} value={data.educationLevel}
                onChange={(f, v) => { set(f, v); set('desiredFiliere', ''); set('filiereId', '') }} />
              <div className="field">
                <label className="field-label">{t('common.schoolYear')} <span style={{ color: '#ef4444' }}>*</span></label>
                <select className="field-input field-select" value={data.schoolYear || ''} onChange={e => set('schoolYear', e.target.value)}>
                  {YEAR_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Sel field="desiredFiliere" opts={filOpts} req span2 label={F.desiredFiliere} value={data.desiredFiliere}
                onChange={(f, v) => { set('desiredFiliere', v); set('filiereId', v) }}
                error={errors.filiereId} />
              <Tog field="stillStudying" label={F.stillStudying} value={data.stillStudying} onChange={set} yesLabel={t('students.yes')} noLabel={t('students.no')} />
              <Tog field="otherTraining" label={F.otherTraining} value={data.otherTraining} onChange={set} yesLabel={t('students.yes')} noLabel={t('students.no')} />
            </>}

            {/* ── Step 2: Guardian ── */}
            {step === 2 && <>
              <Inp field="guardianName" label={F.guardianName} value={data.guardianName} onChange={set} />
              <Inp field="guardianPhone" type="tel" label={F.guardianPhone} value={data.guardianPhone} onChange={set} />
              <Inp field="guardianProfession" span2 label={F.guardianProfession} value={data.guardianProfession} onChange={set} />
              <Sel field="familyStatus" opts={famOpts} label={F.familyStatus} value={data.familyStatus} onChange={set} />
            </>}

            {/* ── Step 3: Health ── */}
            {step === 3 && <>
              <Sel field="healthStatus" opts={hlthOpts} label={F.healthStatus} value={data.healthStatus} onChange={set} />
              {data.healthStatus === 'إعاقة' && <Inp field="disabilityType" label={F.disabilityType} value={data.disabilityType} onChange={set} />}
              <Sel field="healthCoverage" opts={covOpts} label={F.healthCoverage} value={data.healthCoverage} onChange={set} />
              <Sel field="transportMode" opts={transOpts} label={F.transportMode} value={data.transportMode} onChange={set} />
              <Sel field="residenceArea" opts={resOpts} label={F.residenceArea} value={data.residenceArea} onChange={set} />
              <Tog field="hasFixedIncome" label={F.hasFixedIncome} value={data.hasFixedIncome} onChange={set} yesLabel={t('students.yes')} noLabel={t('students.no')} />
              <Tog field="receivesSocialSupport" label={F.receivesSocialSupport} value={data.receivesSocialSupport} onChange={set} yesLabel={t('students.yes')} noLabel={t('students.no')} />
              <Tog field="isWorking" label={F.isWorking} value={data.isWorking} onChange={set} yesLabel={t('students.yes')} noLabel={t('students.no')} />
              {data.isWorking && <Inp field="currentJob" label={F.currentJob} value={data.currentJob} onChange={set} />}
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label className="field-label">{F.notes}</label>
                <textarea className="field-input" rows={2} value={data.notes || ''} onChange={e => set('notes', e.target.value)} />
              </div>
            </>}

          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-white" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? t('common.cancel') : t('common.previous')}
          </button>
          {step < STEPS.length - 1
            ? <button className="btn btn-amber" onClick={() => { if (validate()) setStep(s => s + 1) }}>{t('common.next')}</button>
            : <button className="btn btn-amber" onClick={submit}>{t('common.save')}</button>
          }
        </div>
      </div>
    </div>
  )
}
