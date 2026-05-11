import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Filieres from './pages/Filieres'
import Absences from './pages/Absences'
import Notes from './pages/Notes'
import DataManagement from './pages/DataManagement'
import Equipment from './pages/Equipment'
import Trainers from './pages/Trainers'
import Historique from './pages/Historique'

export default function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Cairo, Inter, sans-serif', fontSize: '14px' }
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="filieres" element={<Filieres />} />
          <Route path="absences" element={<Absences />} />
          <Route path="notes" element={<Notes />} />
          <Route path="data-management" element={<DataManagement />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="historique" element={<Historique />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
