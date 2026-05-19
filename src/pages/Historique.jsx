import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { History, Users, Award, TrendingUp, UserX, UserCog, Wrench, ChevronDown, ChevronUp } from 'lucide-react'
import useStore from '../store/useStore'

const CY = new Date().getFullYear()
const YEAR_OPTS = Array.from({ length: CY - 2024 + 3 }, (_, i) => { const y = 2024 + i; return `${y}/${y + 1}` })

export default function Historique() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { students, filieres, trainers, equipment, notes } = useStore()

  const [selectedYear, setSelectedYear] = useState(`${CY}/${CY + 1}`)
  const [expandedSection, setExpandedSection] = useState('students')

  const gn = f => f ? (lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn) : '—'

  // Filter by schoolYear
  const yearStudents  = students.filter(s => s.schoolYear === selectedYear)
  const yearTrainers  = trainers.filter(t => t.schoolYear === selectedYear)
  const yearEquipment = equipment.filter(e => e.schoolYear === selectedYear)

  // Student stats
  const activeStudents  = yearStudents.filter(s => !s.isDropout)
  const dropoutStudents = yearStudents.filter(s => s.isDropout)

  // Lauréats = students who passed (final note >= 10) in this year
  const getLaureats = () => {
    return yearStudents.filter(s => {
      const studentNotes = notes.filter(n => n.studentId === s.id)
      if (!studentNotes.length) return false
      return studentNotes.some(n => {
        const th = parseFloat(n.theory) || 0
        const pr = parseFloat(n.practical) || 0
        const final = th * 0.4 + pr * 0.6
        return final >= 10
      })
    })
  }
  const laureats = getLaureats()
  const succesRate = yearStudents.length > 0 ? Math.round((laureats.length / yearStudents.length) * 100) : 0

  // Per-filiere breakdown
  const filiereStats = filieres.map(f => {
    const fs = yearStudents.filter(s => s.filiereId === f.id)
    const fd = fs.filter(s => s.isDropout)
    const fl = fs.filter(s => laureats.find(l => l.id === s.id))
    return { filiere: f, total: fs.length, active: fs.length - fd.length, dropouts: fd.length, laureats: fl.length }
  }).filter(x => x.total > 0)

  const toggle = key => setExpandedSection(s => s === key ? null : key)

  const Section = ({ id, icon: Icon, title, count, color, children }) => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => toggle(id)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'inherit' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1, color: 'var(--text)' }}>{title}</span>
        <span style={{ background: color + '20', color, padding: '2px 12px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>{count}</span>
        {expandedSection === id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {expandedSection === id && <div style={{ borderTop: '1px solid var(--border)', padding: '0 0 4px' }}>{children}</div>}
    </div>
  )

  const Row = ({ cols }) => (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {cols.map((c, i) => <td key={i} style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text)' }}>{c}</td>)}
    </tr>
  )

  const THead = ({ cols }) => (
    <thead>
      <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        {cols.map((c, i) => <th key={i} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: lang === 'ar' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{c}</th>)}
      </tr>
    </thead>
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={22} color="#f59e0b" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('historique.title')}</h1>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {YEAR_OPTS.map(y => <option key={y} value={y}>{t('historique.year')} {y}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: t('historique.effectifs'),  value: yearStudents.length,  icon: Users,    color: '#3b82f6' },
          { label: t('historique.laureats'),   value: laureats.length,      icon: Award,    color: '#10b981' },
          { label: t('historique.succesRate'), value: `${succesRate}%`,     icon: TrendingUp, color: '#f59e0b' },
          { label: t('historique.abandons'),   value: dropoutStudents.length, icon: UserX,  color: '#ef4444' },
          { label: t('historique.trainers'),   value: yearTrainers.length,  icon: UserCog,  color: '#8b5cf6' },
          { label: t('historique.equipment'),  value: yearEquipment.length, icon: Wrench,   color: '#06b6d4' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={19} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-filière summary */}
      {filiereStats.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
            {t('historique.byFiliere')}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <THead cols={[t('historique.filiere'), t('historique.effectifs'), t('historique.active'), t('historique.laureats'), t('historique.abandons'), t('historique.succesRate')]} />
              <tbody>
                {filiereStats.map(({ filiere, total, active, dropouts, laureats: fl }) => {
                  const rate = total > 0 ? Math.round((fl / total) * 100) : 0
                  const color = rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'
                  return (
                    <Row key={filiere.id} cols={[
                      <span style={{ fontWeight: 600 }}>{gn(filiere)}</span>,
                      <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{total}</span>,
                      <span style={{ background: '#10b98120', color: '#10b981', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{active}</span>,
                      <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{fl}</span>,
                      <span style={{ background: '#ef444420', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{dropouts}</span>,
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, minWidth: 50 }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color, minWidth: 34, fontSize: 12 }}>{rate}%</span>
                      </div>
                    ]} />
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collapsible sections */}
      {yearStudents.length === 0 && yearTrainers.length === 0 && yearEquipment.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <History size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>{t('historique.noData')} {selectedYear}</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>{t('historique.noDataHint')}</p>
        </div>
      ) : (
        <>
          {/* Students */}
          <Section id="students" icon={Users} title={t('historique.students')} count={yearStudents.length} color="#3b82f6">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <THead cols={[t('students.name'), t('students.cin'), t('students.filiere'), t('students.level'), t('students.status')]} />
                <tbody>
                  {yearStudents.map(s => {
                    const fil = filieres.find(f => f.id === s.filiereId)
                    return (
                      <Row key={s.id} cols={[
                        <span style={{ fontWeight: 600 }}>{s.fullName}</span>,
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.cinNumber}</span>,
                        gn(fil),
                        s.educationLevel,
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.isDropout ? '#fee2e2' : '#dcfce7', color: s.isDropout ? '#dc2626' : '#15803d' }}>
                          {s.isDropout ? t('students.dropout') : t('students.active')}
                        </span>
                      ]} />
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Laureats */}
          {laureats.length > 0 && (
            <Section id="laureats" icon={Award} title={t('historique.laureats')} count={laureats.length} color="#10b981">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <THead cols={[t('students.name'), t('students.filiere'), t('notes.final')]} />
                  <tbody>
                    {laureats.map(s => {
                      const fil = filieres.find(f => f.id === s.filiereId)
                      const sn = notes.filter(n => n.studentId === s.id)
                      const best = sn.reduce((max, n) => {
                        const v = (parseFloat(n.theory) || 0) * 0.4 + (parseFloat(n.practical) || 0) * 0.6
                        return v > max ? v : max
                      }, 0)
                      return (
                        <Row key={s.id} cols={[
                          <span style={{ fontWeight: 600 }}>{s.fullName}</span>,
                          gn(fil),
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{best.toFixed(2)}/20</span>
                        ]} />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Dropouts */}
          {dropoutStudents.length > 0 && (
            <Section id="dropouts" icon={UserX} title={t('historique.abandons')} count={dropoutStudents.length} color="#ef4444">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <THead cols={[t('students.name'), t('students.filiere'), t('students.fields.dropoutDate'), t('students.fields.dropoutReason')]} />
                  <tbody>
                    {dropoutStudents.map(s => {
                      const fil = filieres.find(f => f.id === s.filiereId)
                      return (
                        <Row key={s.id} cols={[
                          <span style={{ fontWeight: 600 }}>{s.fullName}</span>,
                          gn(fil),
                          s.dropoutDate || '—',
                          s.dropoutReason || '—'
                        ]} />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Trainers */}
          {yearTrainers.length > 0 && (
            <Section id="trainers" icon={UserCog} title={t('historique.trainers')} count={yearTrainers.length} color="#8b5cf6">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <THead cols={[t('trainers.fullName'), t('trainers.specialty'), t('trainers.contractType'), t('trainers.status')]} />
                  <tbody>
                    {yearTrainers.map(tr => (
                      <Row key={tr.id} cols={[
                        <span style={{ fontWeight: 600 }}>{tr.fullName}</span>,
                        tr.specialty || t(`trainers.grades.${tr.grade}`),
                        t(`trainers.contractTypes.${tr.contractType}`),
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: tr.status === 'active' ? '#dcfce7' : '#fee2e2', color: tr.status === 'active' ? '#15803d' : '#dc2626' }}>
                          {tr.status === 'active' ? t('trainers.active') : t('trainers.inactive')}
                        </span>
                      ]} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Equipment */}
          {yearEquipment.length > 0 && (
            <Section id="equipment" icon={Wrench} title={t('historique.equipment')} count={yearEquipment.length} color="#06b6d4">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <THead cols={[t('equipment.name'), t('equipment.inventaire'), t('equipment.quantity'), t('equipment.filiere'), t('equipment.status')]} />
                  <tbody>
                    {yearEquipment.map(eq => {
                      const fil = filieres.find(f => f.id === eq.filiereId)
                      return (
                        <Row key={eq.id} cols={[
                          <span style={{ fontWeight: 600 }}>{eq.name}</span>,
                          eq.inventaire || '—',
                          eq.quantity,
                          gn(fil),
                          t(`equipment.statuses.${eq.status}`)
                        ]} />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
