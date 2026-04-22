import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, total, perPage, onChange }) {
  const { t, i18n } = useTranslation()
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  const isRtl = i18n.language === 'ar'
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const nums = []
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">{start}–{end} {t('common.of')} {total}</span>
      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-icon-only btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
          {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {nums.map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`btn btn-sm ${n === page ? 'btn-amber' : 'btn-ghost'}`}
            style={{ minWidth: 32 }}>
            {n}
          </button>
        ))}
        <button className="btn btn-ghost btn-icon-only btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>
          {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  )
}
