import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Users, UserCheck, UserX, Download, FileSpreadsheet } from 'lucide-react'
import useStore from '../../store/useStore'
import { exportStudentsPDF } from '../../utils/exportPDF'
import { exportStudentsExcel } from '../../utils/exportExcel'

export default function FiliereDetail({ filiere, onBack }) {
  const { t, i18n } = useTranslation()
  const students = useStore(s => s.students)
  const lang = i18n.language
  const gn = f => lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn
  const isRtl = lang === 'ar'

  const enrolled = students.filter(s => s.filiereId === filiere.id)
  const active = enrolled.filter(s => !s.isDropout)
  const dropouts = enrolled.filter(s => s.isDropout)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-white btn-icon-only" onClick={onBack}>
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{gn(filiere)}</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{filiere.diplomaType} · {filiere.duration} {t('filieres.years')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-white btn-sm" onClick={() => exportStudentsPDF(enrolled, filiere, t, lang)}>
            <Download size={14} /> {t('filieres.exportPDF')}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => exportStudentsExcel(enrolled, [filiere], lang)}>
            <FileSpreadsheet size={14} /> {t('filieres.exportExcel')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { icon: Users, bg: '#fef3c7', color: '#d97706', v: enrolled.length, l: t('filieres.totalStudents') },
          { icon: UserCheck, bg: '#dcfce7', color: '#16a34a', v: active.length, l: t('filieres.activeStudents') },
          { icon: UserX, bg: '#fee2e2', color: '#dc2626', v: dropouts.length, l: t('filieres.dropouts') },
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

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">{t('filieres.enrolledStudents')}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>{t('students.name')}</th>
                <th>{t('students.cin')}</th>
                <th>{t('students.phone')}</th>
                <th>{t('students.level')}</th>
                <th>{t('students.status')}</th>
              </tr>
            </thead>
            <tbody>
              {enrolled.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>{t('common.noData')}</td></tr>
              ) : enrolled.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{s.cinNumber}</td>
                  <td style={{ color: '#6b7280' }}>{s.phone}</td>
                  <td><span className="badge badge-blue">{t(`students.levels.${s.educationLevel}`)}</span></td>
                  <td>
                    <span className={`badge ${s.isDropout ? 'badge-red' : 'badge-green'}`}>
                      <span className="badge-dot" style={{ background: s.isDropout ? '#dc2626' : '#16a34a' }} />
                      {s.isDropout ? t('students.dropout') : t('students.active')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
