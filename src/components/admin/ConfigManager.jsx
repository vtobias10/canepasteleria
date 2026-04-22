import { useState } from 'react'
import { useData } from '../../context/DataContext'
import SocialIcon, { SOCIAL_PLATFORMS, getSocialPlatformInfo } from '../common/SocialIcon'
import './ConfigManager.css'

const WaIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const PLATFORMS = SOCIAL_PLATFORMS

const DEFAULT_ORDER_MESSAGE_TEXTS = {
  greeting: 'Hola! Quiero hacer un pedido.',
  productLabel: 'Producto',
  optionsLabel: 'Opciones',
  quantityLabel: 'Cantidad',
  closing: 'Me confirmas disponibilidad y precio final? Gracias!',
}

export default function ConfigManager() {
  const { config, setConfig } = useData()
  const [form, setForm] = useState({
    ...config,
    socialLinks: config.socialLinks ?? [],
    logoUrl: config.logoUrl ?? '/logo.jpeg',
    footerNote: config.footerNote ?? 'Hecho con amor',
    orderMessageTexts: {
      ...DEFAULT_ORDER_MESSAGE_TEXTS,
      ...(config.orderMessageTexts ?? {}),
    },
  })
  const [saved, setSaved] = useState(false)
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newPlatform, setNewPlatform] = useState('instagram')
  const [newUrl, setNewUrl] = useState('')
  const [logoError, setLogoError] = useState('')

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function setOrderText(key, value) {
    set('orderMessageTexts', {
      ...DEFAULT_ORDER_MESSAGE_TEXTS,
      ...(form.orderMessageTexts || {}),
      [key]: value,
    })
  }

  function handleSave(event) {
    event.preventDefault()
    setConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleLogoUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 800000) {
      setLogoError('La imagen supera el maximo permitido (800KB).')
      return
    }
    setLogoError('')
    const reader = new FileReader()
    reader.onload = fileEvent => set('logoUrl', fileEvent.target.result)
    reader.readAsDataURL(file)
  }

  function addSocialLink() {
    if (!newUrl.trim()) return
    set('socialLinks', [...(form.socialLinks || []), { platform: newPlatform, url: newUrl.trim() }])
    setNewUrl('')
    setShowAddSocial(false)
  }

  function removeSocialLink(index) {
    const updated = [...(form.socialLinks || [])]
    updated.splice(index, 1)
    set('socialLinks', updated)
  }

  const platformInfo = key => getSocialPlatformInfo(key)

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Configuracion</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            Cambios en tiempo real en el sitio publico
          </p>
        </div>
        {saved && <div className="save-success">✓ Guardado correctamente</div>}
      </div>

      <form onSubmit={handleSave} className="config-form">
        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">🖼️</span>
            <div>
              <h3>Logo</h3>
              <p>Imagen circular que aparece en la pagina de inicio y la carta</p>
            </div>
          </div>
          <div className="logo-upload-row">
            <img src={form.logoUrl || '/logo.jpeg'} alt="Logo actual" className="logo-preview-img" />
            <div style={{ flex: 1 }}>
              <label className="logo-upload-btn btn btn-ghost btn-sm">
                Cambiar logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
              <p className="field-hint">PNG, JPG o WEBP · max 800KB · se vera circular</p>
              {logoError && <p className="field-hint config-error">{logoError}</p>}
              {form.logoUrl !== '/logo.jpeg' && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => set('logoUrl', '/logo.jpeg')}>
                  Restaurar original
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">✿</span>
            <div>
              <h3>Identidad del negocio</h3>
              <p>Textos que aparecen en la pagina de inicio</p>
            </div>
          </div>

          <div className="form-group">
            <label>Nombre del negocio</label>
            <input value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="Ej: Cane Pasteleria" />
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
            <label>Descripcion</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Conta quienes son y que hacen..." style={{ minHeight: 90 }} />
          </div>

          <div className="form-group">
            <label>Nota al pie</label>
            <input value={form.footerNote || ''} onChange={e => set('footerNote', e.target.value)} placeholder="Ej: Hecho con amor" />
            <span className="field-hint">Texto pequeno que aparece junto a las redes sociales</span>
          </div>
        </div>

        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon-wa"><WaIcon size={22} /></span>
            <div>
              <h3>Contacto</h3>
              <p>Numero de WhatsApp para recibir pedidos</p>
            </div>
          </div>

          <div className="form-group">
            <label>Numero de WhatsApp</label>
            <input
              value={form.whatsappNumber || ''}
              onChange={e => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Ej: 5491112345678 (sin + ni espacios)"
            />
            <span className="field-hint">Formato internacional sin "+". Argentina: 549 + codigo de area + numero</span>
          </div>

          {form.whatsappNumber && (
            <a href={`https://wa.me/${form.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp-test btn-sm" style={{ alignSelf: 'flex-start' }}>
              <WaIcon size={14} /> Probar numero
            </a>
          )}
        </div>

        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">✍️</span>
            <div>
              <h3>Mensaje de pedido (WhatsApp)</h3>
              <p>Edita solo los textos. Las variables se completan automaticamente.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Texto inicial</label>
            <input
              value={form.orderMessageTexts?.greeting || ''}
              onChange={e => setOrderText('greeting', e.target.value)}
              placeholder="Ej: Hola! Quiero hacer un pedido."
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Etiqueta producto</label>
              <input
                value={form.orderMessageTexts?.productLabel || ''}
                onChange={e => setOrderText('productLabel', e.target.value)}
                placeholder="Producto"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Etiqueta opciones</label>
              <input
                value={form.orderMessageTexts?.optionsLabel || ''}
                onChange={e => setOrderText('optionsLabel', e.target.value)}
                placeholder="Opciones"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Etiqueta cantidad</label>
              <input
                value={form.orderMessageTexts?.quantityLabel || ''}
                onChange={e => setOrderText('quantityLabel', e.target.value)}
                placeholder="Cantidad"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Texto final</label>
            <input
              value={form.orderMessageTexts?.closing || ''}
              onChange={e => setOrderText('closing', e.target.value)}
              placeholder="Ej: Me confirmas disponibilidad y precio final? Gracias!"
            />
            <span className="field-hint">No edites variables del pedido: se agregan automaticamente.</span>
          </div>
        </div>

        <div className="config-section card">
          <div className="config-section-head">
            <span className="config-section-icon">📱</span>
            <div>
              <h3>Redes sociales</h3>
              <p>Links que aparecen al pie de la pagina de inicio</p>
            </div>
          </div>

          {(form.socialLinks || []).length > 0 && (
            <div className="social-links-list">
              {(form.socialLinks || []).map((link, index) => (
                <div key={index} className="social-link-row">
                  <span className="social-link-icon"><SocialIcon platform={link.platform} /></span>
                  <span className="social-link-label">{platformInfo(link.platform).label}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="social-link-url">{link.url}</a>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSocialLink(index)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {!showAddSocial ? (
            <button type="button" className="btn btn-ghost btn-sm social-add-trigger" onClick={() => setShowAddSocial(true)}>
              + Agregar red social
            </button>
          ) : (
            <div className="social-add-panel">
              <div className="social-platform-grid">
                {PLATFORMS.map(platform => (
                  <button
                    key={platform.key}
                    type="button"
                    className={`social-platform-btn ${newPlatform === platform.key ? 'selected' : ''}`}
                    onClick={() => setNewPlatform(platform.key)}
                    title={platform.label}
                  >
                    <span className="social-platform-icon"><SocialIcon platform={platform.key} /></span>
                    <span className="social-platform-label">{platform.label}</span>
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
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowAddSocial(false); setNewUrl('') }}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={addSocialLink}>
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="config-section config-preview card">
          <div className="config-section-head">
            <span className="config-section-icon">👁️</span>
            <div>
              <h3>Vista previa</h3>
              <p>Como se vera la pagina de inicio</p>
            </div>
          </div>
          <div className="preview-card">
            <img src={form.logoUrl || '/logo.jpeg'} alt="Logo" className="preview-logo" />
            <div className="preview-name">{form.businessName || '—'}</div>
            {form.sinTagline && <div className="preview-sintacc">✦ {form.sinTagline} ✦</div>}
            <div className="preview-tagline">{form.tagline || '—'}</div>
            <div className="preview-desc">{form.description?.slice(0, 100)}{form.description?.length > 100 ? '…' : ''}</div>
            <div className="preview-social-real">
              {(form.socialLinks || []).map((link, index) => (
                <span key={index} className="preview-social-chip">
                  <span className="preview-social-chip-icon"><SocialIcon platform={link.platform} /></span>
                  {platformInfo(link.platform).label}
                </span>
              ))}
              {(form.socialLinks || []).length > 0 && <span className="preview-sep">·</span>}
              {form.footerNote && <span className="preview-footer-note">{form.footerNote}</span>}
            </div>
          </div>
        </div>

        <div className="config-save-bar">
          <button type="submit" className="btn btn-primary config-save-btn">Guardar configuracion</button>
          {saved && <span className="save-label">✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}


