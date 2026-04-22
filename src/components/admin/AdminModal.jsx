import { XIcon, TrashIcon, CheckIcon } from './AdminIcons'
import './AdminModal.css'

export function AdminModal({
  title,
  subtitle,
  onClose,
  size = 'wide',
  actions = null,
  closeOnOverlay = true,
  children,
}) {
  const sizeStyles = {
    compact: { width: 'min(92vw, 440px)', maxWidth: 'none' },
    medium: { width: 'min(92vw, 700px)', maxWidth: 'none' },
    wide: { width: 'min(94vw, 1080px)', maxWidth: 'none' },
    xwide: { width: 'min(95vw, 1220px)', maxWidth: 'none' },
  }

  function handleOverlayClick(event) {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay admin-modal-overlay fade-in" onClick={handleOverlayClick}>
      <div
        className={`modal admin-modal admin-modal--${size}`}
        style={sizeStyles[size] || sizeStyles.wide}
        onClick={event => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div className="admin-modal-heading">
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {children}
        </div>

        {actions && (
          <div className="admin-modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
}) {
  return (
    <AdminModal
      title={title}
      size="compact"
      onClose={onCancel}
      actions={(
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            <XIcon /> {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {tone === 'danger' ? <TrashIcon /> : <CheckIcon />} {confirmLabel}
          </button>
        </>
      )}
    >
      <p className="admin-confirm-message">{message}</p>
    </AdminModal>
  )
}
