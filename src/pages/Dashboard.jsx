import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, UserX, CalendarX2, BookOpen,
  Plus, ArrowUpRight, AlertTriangle, TrendingUp,
  Activity, Award, ChevronRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import useStore from '../store/useStore'

const P = ['#f59e0b', '#1e293b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      {label && <p style={{ fontWeight: 700, marginBottom: 4, color: '#111827' }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, sub, trend, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div style={{ textAlign: 'end' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
          <TrendingUp size={12} color={trend >= 0 ? '#16a34a' : '#dc2626'} />
        </div>
      )}
      {onClick && <ArrowUpRight size={14} color="#9ca3af" style={{ flexShrink: 0 }} />}
    </div>
  )
}

function CardHeader({ title, action, onAction }) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      {action && (
        <button onClick={onAction} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const students = useStore(s => s.students)
  const filieres = useStore(s => s.filieres)
  const absences = useStore(s => s.absences)

  const lang = i18n.language
  const gn = f => lang === 'ar' ? f.nameAr : lang === 'fr' ? f.nameFr : f.nameEn

  const now = new Date()
  const active = students.filter(s => !s.isDropout)
  const dropouts = students.filter(s => s.isDropout)
  const activeRate = students.length ? Math.round(active.length / students.length * 100) : 0
  const dropRate = students.length ? Math.round(dropouts.length / students.length * 100) : 0

  const monthAbs = absences.filter(a => a.month === now.getMonth() + 1 && a.year === now.getFullYear())
  const avgAbs = monthAbs.length ? (monthAbs.reduce((s, a) => s + a.totalAbsences, 0) / monthAbs.length).toFixed(1) : 0
  const highAbs = monthAbs.filter(a => a.totalAbsences >= 2)

  const activeKey = t('dashboard.active')
  const dropoutKey = t('dashboard.dropout')
  const barData = filieres.map(f => ({
    name: gn(f).substring(0, 12),
    [activeKey]: students.filter(s => s.filiereId === f.id && !s.isDropout).length,
    [dropoutKey]: students.filter(s => s.filiereId === f.id && s.isDropout).length,
  })).filter(d => d[activeKey] + d[dropoutKey] > 0)

  const levelData = [
    { name: t('students.levels.7eme'), value: students.filter(s => s.educationLevel === '7eme').length },
    { name: t('students.levels.9eme'), value: students.filter(s => s.educationLevel === '9eme').length },
    { name: t('students.levels.bac'), value: students.filter(s => s.educationLevel === 'bac').length },
  ].filter(d => d.value > 0)

  const coverageData = ['AMO', 'CNSS', 'CNOPS', 'SANS'].map(c => ({
    name: c, value: students.filter(s => s.healthCoverage === c).length
  })).filter(d => d.value > 0)

  const recent = [...students].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7)

  const alertList = highAbs
    .map(a => ({ ...a, student: students.find(s => s.id === a.studentId) }))
    .filter(a => a.student).slice(0, 6)

  const monthName = t(`absences.months.${now.getMonth() + 1}`)
  const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Welcome banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 14, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        border: '1px solid #334155'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {t('header.centerName')}
            </span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{t('dashboard.title')}</h1>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{dateStr}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { v: students.length, l: t('dashboard.totalStudents') },
            { v: `${activeRate}%`, l: t('dashboard.activeRate') },
            { v: filieres.length, l: t('dashboard.filieres') },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#f59e0b', fontSize: 20, fontWeight: 800 }}>{s.v}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>{s.l}</div>
            </div>
          ))}
          <button className="btn btn-amber" onClick={() => navigate('/students?add=1')}>
            <Plus size={15} /> {t('dashboard.addStudent')}
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard icon={Users} iconBg="#fef3c7" iconColor="#d97706"
          value={students.length} label={t('dashboard.totalStudents')}
          sub={`${filieres.length} ${t('dashboard.filieres').toLowerCase()}`}
          onClick={() => navigate('/students')} />
        <StatCard icon={UserCheck} iconBg="#dcfce7" iconColor="#16a34a"
          value={active.length} label={t('dashboard.activeStudents')}
          sub={`${activeRate}% ${t('dashboard.ofTotal')}`} trend={activeRate - 100}
          onClick={() => navigate('/students')} />
        <StatCard icon={UserX} iconBg="#fee2e2" iconColor="#dc2626"
          value={dropouts.length} label={t('dashboard.dropouts')}
          sub={dropouts.length > 0 ? `${dropRate}% ${t('dashboard.ofTotal')}` : t('dashboard.noDropouts')}
          onClick={() => navigate('/students')} />
        <StatCard icon={CalendarX2} iconBg="#fef3c7" iconColor="#d97706"
          value={avgAbs} label={t('dashboard.avgAbsences')}
          sub={`${highAbs.length} ${t('dashboard.exceededDays')}`}
          onClick={() => navigate('/absences')} />
        <StatCard icon={BookOpen} iconBg="#ede9fe" iconColor="#7c3aed"
          value={filieres.length} label={t('dashboard.filieres')}
          sub={t('dashboard.specialties')}
          onClick={() => navigate('/filieres')} />
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Bar chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <CardHeader title={t('dashboard.studentsPerFiliere')} action={t('common.view')} onAction={() => navigate('/filieres')} />
          <div style={{ padding: '16px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey={activeKey} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey={dropoutKey} fill="#fca5a5" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
              {[['#f59e0b', activeKey], ['#fca5a5', dropoutKey]].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card">
          <CardHeader title={t('dashboard.levelDistribution')} />
          <div style={{ padding: '12px 20px 16px' }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={levelData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={4}>
                  {levelData.map((_, i) => <Cell key={i} fill={P[i]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {levelData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: P[i], display: 'inline-block' }} />
                    {d.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P[i] }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Recent students */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <CardHeader title={t('dashboard.recentStudents')} action={t('common.view')} onAction={() => navigate('/students')} />
          <div>
            {recent.map((s, i) => {
              const fil = filieres.find(f => f.id === s.filiereId)
              return (
                <div key={s.id} onClick={() => navigate('/students')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 20px', cursor: 'pointer',
                    borderBottom: i < recent.length - 1 ? '1px solid #f9fafb' : 'none',
                    transition: 'background 0.12s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: '#fef3c7', color: '#d97706',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, flexShrink: 0
                  }}>{s.fullName.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }} className="truncate">{s.fullName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }} className="truncate">{fil ? gn(fil) : '—'} · {s.cinNumber}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span className="badge badge-blue">{t(`students.levels.${s.educationLevel}`)}</span>
                    <span className={`badge ${s.isDropout ? 'badge-red' : 'badge-green'}`}>
                      <span className={`badge-dot ${s.isDropout ? '' : ''}`} style={{ background: s.isDropout ? '#dc2626' : '#16a34a' }} />
                      {s.isDropout ? t('students.dropout') : t('students.active')}
                    </span>
                  </div>
                </div>
              )
            })}
            {recent.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>{t('common.noData')}</div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Absence alerts */}
          <div className="card" style={{ flex: 1 }}>
            <CardHeader title={`⚠ ${monthName}`} action={t('common.view')} onAction={() => navigate('/absences')} />
            <div style={{ padding: '12px 16px' }}>
              {alertList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Activity size={24} color="#d1d5db" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{t('dashboard.noHighAbsence')}</p>
                </div>
              ) : alertList.map(a => (
                <div key={a.studentId} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, marginBottom: 4,
                  background: '#fef2f2', border: '1px solid #fecaca'
                }}>
                  <AlertTriangle size={13} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.student?.fullName}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 7px', borderRadius: 20 }}>
                    {a.totalAbsences}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Health coverage */}
          <div className="card">
            <CardHeader title={t('dashboard.healthCoverage')} />
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coverageData.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: P[i] }}>{d.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: students.length ? `${d.value / students.length * 100}%` : '0%', background: P[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <CardHeader title={t('dashboard.quickActions')} />
            <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { l: t('dashboard.addStudent'), i: Plus, p: '/students?add=1', amber: true },
                { l: t('dashboard.absenceSheet'), i: CalendarX2, p: '/absences', amber: false },
                { l: t('nav.notes'), i: Award, p: '/notes', amber: false },
                { l: t('dashboard.exportData'), i: TrendingUp, p: '/data-management', amber: false },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.p)}
                  className={`btn ${a.amber ? 'btn-amber' : 'btn-white'}`}
                  style={{ flexDirection: 'column', gap: 4, padding: '10px 8px', fontSize: 11, height: 'auto' }}>
                  <a.i size={16} />
                  <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{a.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
