import { useTranslation } from 'react-i18next'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger = true }) {
  const { t } = useTranslation()
  if (!isOpen) return null
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
              <AlertTriangle size={18} className={danger ? 'text-red-600' : 'text-amber-600'} />
            </div>
            <span className="modal-head-title">{title}</span>
          </div>
          <button className="btn btn-ghost btn-icon-only" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-white" onClick={onCancel}>{t('common.cancel')}</button>
          <button className={`btn ${danger ? 'btn-red' : 'btn-amber'}`} onClick={onConfirm}>{t('common.confirm')}</button>
        </div>
      </div>
    </div>
  )
}
