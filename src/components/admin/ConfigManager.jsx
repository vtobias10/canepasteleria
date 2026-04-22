import { useState } from 'react'
import { useData } from '../../context/DataContext'
import './ConfigManager.css'

const WaIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { key: 'tiktok', label: 'TikTok', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/></svg> },
  { key: 'facebook', label: 'Facebook', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { key: 'youtube', label: 'YouTube', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
  { key: 'twitter', label: 'Twitter / X', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { key: 'pinterest', label: 'Pinterest', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg> },
]

const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube', twitter: 'Twitter', pinterest: 'Pinterest' }
const PLATFORM_ICONS = Object.fromEntries(PLATFORMS.map(p => [p.key, p.icon]))

export default function ConfigManager() {
  const { config, setConfig } = useData()
  const [form, setForm] = useState({ ...config, socialLinks: config.socialLinks ?? [], logoUrl: config.logoUrl ?? '/logo.jpeg', footerNote: config.footerNote ?? 'Hecho con amor 🤍' })
  const [saved, setSaved] = useState(false)
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newUrl, setNewUrl] = useState('')
  const [logoError, setLogoError] = useState('')

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

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 800000) {
      setLogoError('La imagen supera el máximo permitido (800KB).')
      return
    }
    setLogoError('')
    const reader = new FileReader()
    reader.onload = ev => set('logoUrl', ev.target.result)
    reader.readAsDataURL(file)
  }

  function addSocialLink() {
    if (!newUrl.trim()) return
    set('socialLinks', [...(form.socialLinks || []), { platform: newPlatform, url: newUrl.trim() }])
    setNewUrl('')
    setShowAddSocial(false)
  }

  function removeSocialLink(i) {
    const updated = [...(form.socialLinks || [])]
    updated.splice(i, 1)
    set('socialLinks', updated)
  }

  const platformInfo = key => PLATFORMS.find(p => p.key === key) || PLATFORMS[0]

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Configuración</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>Cambios en tiempo real en el sitio público</p>
        </div>
        {saved && <div className="save-success">✓ Guardado correctamente</div>}
      </div>

      <form onSubmit={handleSave} className="config-form">

        {/* ── Logo ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">🖼️</span>
            <div>
              <h3>Logo</h3>
              <p>Imagen circular que aparece en la página de inicio y la carta</p>
            </div>
          </div>
          <div className="logo-upload-row">
            <img src={form.logoUrl || '/logo.jpeg'} alt="Logo actual" className="logo-preview-img" />
            <div style={{ flex: 1 }}>
              <label className="logo-upload-btn btn btn-ghost btn-sm">
                Cambiar logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
              <p className="field-hint">PNG, JPG o WEBP · máx 800KB · se verá circular</p>
              {logoError && <p className="field-hint config-error">{logoError}</p>}
              {form.logoUrl !== '/logo.jpeg' && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => set('logoUrl', '/logo.jpeg')}>
                  Restaurar original
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Identidad ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">✿</span>
            <div>
              <h3>Identidad del negocio</h3>
              <p>Textos que aparecen en la página de inicio</p>
            </div>
          </div>

          <div className="form-group">
            <label>Nombre del negocio</label>
            <input value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="Ej: Cane Pastelería" />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Eslogan / Tagline</label>
              <input value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="Ej: Dulces hechos con amor" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Badge (ej: Sin TACC)</label>
              <input value={form.sinTagline || ''} onChange={e => set('sinTagline', e.target.value)} placeholder="Ej: Sin TACC" />
              <span className="field-hint">Aparece como ✦ texto ✦ arriba del eslogan</span>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Contá quiénes son y qué hacen..." style={{ minHeight: 90 }} />
          </div>

          <div className="form-group">
            <label>Nota al pie (ej: Hecho con amor 🤍)</label>
            <input value={form.footerNote || ''} onChange={e => set('footerNote', e.target.value)} placeholder="Ej: Hecho con amor 🤍" />
            <span className="field-hint">Texto pequeño que aparece junto a las redes sociales</span>
          </div>
        </div>

        {/* ── Contacto ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon-wa"><WaIcon size={22} /></span>
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
            <span className="field-hint">Formato internacional sin "+". Argentina → 549 + código área + número</span>
          </div>

          {form.whatsappNumber && (
            <a href={`https://wa.me/${form.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp-test btn-sm" style={{ alignSelf: 'flex-start' }}>
              <WaIcon size={14} /> Probar número
            </a>
          )}
        </div>

        {/* ── Redes sociales ── */}
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">📱</span>
            <div>
              <h3>Redes sociales</h3>
              <p>Links que aparecen al pie de la página de inicio</p>
            </div>
          </div>

          {/* Lista compacta */}
          {(form.socialLinks || []).length > 0 && (
            <div className="social-links-list">
              {(form.socialLinks || []).map((link, i) => (
                <div key={i} className="social-link-row">
                  <span className="social-link-icon">{platformInfo(link.platform).icon}</span>
                  <span className="social-link-label">{platformInfo(link.platform).label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="social-link-url">{link.url}</a>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSocialLink(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Botón agregar */}
          {!showAddSocial ? (
            <button type="button" className="btn btn-ghost btn-sm social-add-trigger" onClick={() => setShowAddSocial(true)}>
              ＋ Agregar red social
            </button>
          ) : (
            <div className="social-add-panel">
              <div className="social-platform-grid">
                {PLATFORMS.map(p => (
                  <button key={p.key} type="button" className={`social-platform-btn ${newPlatform === p.key ? 'selected' : ''}`} onClick={() => setNewPlatform(p.key)} title={p.label}>
                    <span className="social-platform-icon">{p.icon}</span>
                    <span className="social-platform-label">{p.label}</span>
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder={`URL de ${platformInfo(newPlatform).label}`}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSocialLink())}
                autoFocus
              />
              <div className="social-panel-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowAddSocial(false); setNewUrl('') }}>Cancelar</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={addSocialLink}>Agregar</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Preview real ── */}
        <div className="config-section config-preview card">
          <div className="config-section-head">
            <span className="config-section-icon">👁️</span>
            <div>
              <h3>Vista previa</h3>
              <p>Cómo se verá la página de inicio</p>
            </div>
          </div>
          <div className="preview-card">
            <img src={form.logoUrl || '/logo.jpeg'} alt="Logo" className="preview-logo" />
            <div className="preview-name">{form.businessName || '—'}</div>
            {form.sinTagline && <div className="preview-sintacc">✦ {form.sinTagline} ✦</div>}
            <div className="preview-tagline">{form.tagline || '—'}</div>
            <div className="preview-desc">{form.description?.slice(0, 100)}{form.description?.length > 100 ? '…' : ''}</div>
            {/* Social links tal como aparecen en el front */}
            <div className="preview-social-real">
              {(form.socialLinks || []).map((link, i) => (
                <span key={i} className="preview-social-chip">
                  <span className="preview-social-chip-icon">{platformInfo(link.platform).icon}</span>
                  {platformInfo(link.platform).label}
                </span>
              ))}
              {(form.socialLinks || []).length > 0 && <span className="preview-sep">·</span>}
              {form.footerNote && <span className="preview-footer-note">{form.footerNote}</span>}
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div className="config-save-bar">
          <button type="submit" className="btn btn-primary config-save-btn">Guardar configuración</button>
          {saved && <span className="save-label">✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}
