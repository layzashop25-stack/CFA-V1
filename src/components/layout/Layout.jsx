import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import Header from './Header'

const PAGE_META = {
  '/':               { title: 'nav.dashboard',      sub: 'header.centerName' },
  '/students':       { title: 'nav.students',        sub: null },
  '/filieres':       { title: 'nav.filieres',        sub: null },
  '/absences':       { title: 'nav.absences',        sub: null },
  '/notes':          { title: 'nav.notes',           sub: null },
  '/equipment':      { title: 'nav.equipment',       sub: null },
  '/trainers':        { title: 'nav.trainers',         sub: null },
  '/data-management':{ title: 'nav.dataManagement',  sub: null },
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || PAGE_META['/']
  // reading i18n.language forces re-render on language change
  const _lang = i18n.language

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header
          pageTitle={t(meta.title)}
          pageSub={meta.sub ? t(meta.sub) : null}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--surface)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
