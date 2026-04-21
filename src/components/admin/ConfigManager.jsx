import { useState } from 'react'
import { useData } from '../../context/DataContext'
import './ConfigManager.css'

export default function ConfigManager() {
  const { config, setConfig } = useData()
  const [form, setForm] = useState({ ...config })
  const [saved, setSaved] = useState(false)

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    setConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Configuración</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            Cambios en tiempo real en el sitio público
          </p>
        </div>
        {saved && (
          <div className="save-success">
            ✓ Guardado correctamente
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="config-form">

        {/* ── Identidad ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">✿</span>
            <div>
              <h3>Identidad del negocio</h3>
              <p>Nombre, eslogan y descripción que aparecen en la página de inicio</p>
            </div>
          </div>

          <div className="form-group">
            <label>Nombre del negocio</label>
            <input
              value={form.businessName || ''}
              onChange={e => set('businessName', e.target.value)}
              placeholder="Ej: Cane Pastelería"
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Eslogan / Tagline</label>
              <input
                value={form.tagline || ''}
                onChange={e => set('tagline', e.target.value)}
                placeholder="Ej: Dulces hechos con amor"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Subtítulo Sin TACC</label>
              <input
                value={form.sinTagline || ''}
                onChange={e => set('sinTagline', e.target.value)}
                placeholder="Ej: Repostería Sin TACC"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción (texto de presentación)</label>
            <textarea
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Contá quiénes son y qué hacen..."
              style={{ minHeight: 100 }}
            />
          </div>
        </div>

        {/* ── Contacto ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">💬</span>
            <div>
              <h3>Contacto</h3>
              <p>Número de WhatsApp para recibir pedidos</p>
            </div>
          </div>

          <div className="form-group">
            <label>Número de WhatsApp</label>
            <input
              value={form.whatsappNumber || ''}
              onChange={e => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Ej: 5491112345678 (sin + ni espacios)"
            />
            <span className="field-hint">
              Formato internacional sin "+". Ej: para Argentina → 549 + código área + número (54911XXXXXXXX)
            </span>
          </div>

          {form.whatsappNumber && (
            <a
              href={`https://wa.me/${form.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              💬 Probar número
            </a>
          )}
        </div>

        {/* ── Redes sociales ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">📱</span>
            <div>
              <h3>Redes sociales</h3>
              <p>Links e identificadores de tus redes</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Instagram — Handle</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">@</span>
                <input
                  value={(form.instagramHandle || '').replace('@', '')}
                  onChange={e => set('instagramHandle', '@' + e.target.value.replace('@', ''))}
                  placeholder="canepasteleria"
                  className="input-with-prefix"
                />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Instagram — URL completa</label>
              <input
                type="url"
                value={form.instagramUrl || ''}
                onChange={e => set('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/canepasteleria"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Facebook — URL (opcional)</label>
            <input
              type="url"
              value={form.facebookUrl || ''}
              onChange={e => set('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/canepasteleria"
            />
          </div>

          {form.instagramUrl && (
            <a
              href={form.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              📷 Ver perfil
            </a>
          )}
        </div>

        {/* ── Preview ── */}
        <div className="config-section config-preview card">
          <div className="config-section-head">
            <span className="config-section-icon">👁️</span>
            <div>
              <h3>Vista previa</h3>
              <p>Así se verá la página de inicio</p>
            </div>
          </div>
          <div className="preview-card">
            <img src="/logo.jpeg" alt="Logo" className="preview-logo" />
            <div className="preview-name">{form.businessName || '—'}</div>
            <div className="preview-tagline">{form.tagline || '—'}</div>
            <div className="preview-desc">{form.description?.slice(0, 120)}{form.description?.length > 120 ? '…' : ''}</div>
            <div className="preview-social">
              {form.instagramHandle && <span>📷 {form.instagramHandle}</span>}
              {form.whatsappNumber && <span>💬 +{form.whatsappNumber}</span>}
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div className="config-save-bar">
          <button type="submit" className="btn btn-primary config-save-btn">
            Guardar configuración
          </button>
          {saved && <span className="save-label">✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}
