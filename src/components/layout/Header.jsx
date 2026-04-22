import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Bell, GraduationCap } from 'lucide-react'
import LanguageSwitcher from '../shared/LanguageSwitcher'
import useStore from '../../store/useStore'

export default function Header({ pageTitle, pageSub }) {
  const { t } = useTranslation()
  const [dark, setDark] = useState(() => localStorage.getItem('cfp_dark') === '1')
  const highAbs = useStore(s => {
    const now = new Date()
    return s.absences.filter(a => a.month === now.getMonth() + 1 && a.year === now.getFullYear() && a.totalAbsences >= 6).length
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('cfp_dark', dark ? '1' : '0')
  }, [dark])

  return (
    <header className="topbar no-print">
      {/* Left: page title */}
      <div className="flex-1 min-w-0">
        <div className="topbar-title truncate">{pageTitle}</div>
        {pageSub && <div className="topbar-sub truncate">{pageSub}</div>}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button className="icon-btn">
            <Bell size={15} />
          </button>
          {highAbs > 0 && (
            <span style={{
              position: 'absolute', top: -4, insetInlineEnd: -4,
              background: '#ef4444', color: '#fff', fontSize: 9,
              fontWeight: 800, borderRadius: 20, padding: '1px 5px',
              border: '2px solid #fff'
            }}>{highAbs}</span>
          )}
        </div>

        {/* Dark mode */}
        <button className="icon-btn" onClick={() => setDark(d => !d)}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: '#1e293b', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer'
        }}>
          <GraduationCap size={16} color="#f59e0b" />
        </div>
      </div>
    </header>
  )
}
