import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGS = [
  { code: 'ar', label: 'AR'},
  { code: 'fr', label: 'FR'},
  { code: 'en', label: 'EN'},
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const change = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('cfp_lang', code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }
  return (
    <div className="flex items-center gap-1">
      {LANGS.map(l => (
        <button key={l.code} className={`lang-btn ${i18n.language === l.code ? 'active' : ''}`} onClick={() => change(l.code)}>
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}
