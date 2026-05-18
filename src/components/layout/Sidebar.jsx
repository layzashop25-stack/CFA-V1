import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, BookOpen, CalendarX2,
  ClipboardList, Database, GraduationCap, ChevronLeft, ChevronRight, Wrench, UserCog, History, Presentation
} from 'lucide-react'
import useStore from '../../store/useStore'

const NAV = [
  { key: 'dashboard',      path: '/',               icon: LayoutDashboard },
  { key: 'students',       path: '/students',        icon: Users },
  { key: 'filieres',       path: '/filieres',        icon: BookOpen },
  { key: 'absences',       path: '/absences',        icon: CalendarX2 },
  { key: 'notes',          path: '/notes',           icon: ClipboardList },
  { key: 'equipment',      path: '/equipment',       icon: Wrench },
  { key: 'trainers',       path: '/trainers',        icon: UserCog },
  { key: 'workshops',     path: '/workshops',       icon: Presentation },
  { key: 'historique',     path: '/historique',      icon: History },
  { key: 'dataManagement', path: '/data-management', icon: Database },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const highAbs = useStore(s => {
    const now = new Date()
    return s.absences.filter(a => a.month === now.getMonth() + 1 && a.year === now.getFullYear() && a.totalAbsences >= 2).length
  })

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-logo-text">{t('header.centerName')}</div>
            <div className="sidebar-logo-sub">{t('dashboard.systemName')}</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">{t('dashboard.mainMenu')}</div>}
        {NAV.map(({ key, path, icon: Icon }) => (
          <NavLink key={key} to={path} end={path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? t(`nav.${key}`) : undefined}
          >
            <Icon size={17} className="sidebar-link-icon" />
            {!collapsed && <span>{t(`nav.${key}`)}</span>}
            {key === 'absences' && highAbs > 0 && (
              <span className="sidebar-badge">{highAbs}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        style={{
          margin: '0 8px 8px', padding: '8px', borderRadius: 8,
          background: 'rgba(255,255,255,0.06)', border: 'none',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        {collapsed
          ? (isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />)
          : (isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />)
        }
      </button>

      {!collapsed && <div className="sidebar-footer">CFP Management v1.0</div>}
    </aside>
  )
}
