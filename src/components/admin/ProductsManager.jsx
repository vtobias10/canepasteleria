import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import { AdminModal, ConfirmModal } from './AdminModal'
import './ProductsManager.css'

const EMOJIS = ['🎂', '🧁', '🍰', '🍫', '🍪', '🎀', '🍩', '🥐', '🍮', '🥧']
const VARIANT_SUGGESTIONS = ['Presentación', 'Tamaño', 'Sabor', 'Relleno', 'Cobertura', 'Formato']

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  emoji: '🎂',
  variants: [],
  bolsitasXUd: [],
  priceNote: '',
  minQuantity: 1,
  active: true,
}

export default function ProductsManager() {
  const { products, addProduct, updateProduct, deleteProduct } = useData()
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const displayed = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setModal({ ...emptyProduct })
  }

  function openEdit(product) {
    setModal({ ...product })
  }

  function handleSave(data) {
    if (data.id) {
      updateProduct(data.id, data)
    } else {
      addProduct(data)
    }
    setModal(null)
  }

  function handleDelete(id) {
    deleteProduct(id)
    setConfirmDelete(null)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Productos</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 200 }}
          />
          <button className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Variantes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  {products.length === 0 ? 'No hay productos aún' : 'Sin resultados para esa búsqueda'}
                </td>
              </tr>
            )}
            {displayed.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2, maxWidth: 220 }}>
                        {p.description?.slice(0, 60)}{p.description?.length > 60 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {p.category && <span className="badge badge-purple">{p.category}</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {p.variants?.map(v => (
                      <span key={v.name} style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                        <strong>{v.name}:</strong> {v.options.join(', ')}
                      </span>
                    ))}
                    {p.bolsitasXUd?.length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                        <strong>Bolsitas x ud:</strong> {p.bolsitasXUd.join(', ')}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${p.active ? 'badge-green' : 'badge-red'}`}>
                    {p.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(p)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <ProductFormModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar producto?"
          message={(
            <>
              Esta acción no se puede deshacer. Se eliminará <strong>{confirmDelete.name}</strong>.
            </>
          )}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
          confirmLabel="Sí, eliminar"
          tone="danger"
        />
      )}
    </div>
  )
}

function ProductFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    variants: initial.variants ?? [],
    bolsitasXUd: initial.bolsitasXUd ?? [],
  }))
  const [newVariantName, setNewVariantName] = useState('')

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function addVariantByName(rawName) {
    const name = rawName.trim()
    if (!name) return

    const exists = form.variants.some(v => v.name?.toLowerCase() === name.toLowerCase())
    if (exists) return

    set('variants', [...form.variants, { name, options: [] }])
    setNewVariantName('')
  }

  function updateVariantName(index, name) {
    const updated = form.variants.map((variant, idx) => (
      idx === index ? { ...variant, name } : variant
    ))
    set('variants', updated)
  }

  function updateVariantOptions(index, options) {
    const updated = form.variants.map((variant, idx) => (
      idx === index ? { ...variant, options } : variant
    ))
    set('variants', updated)
  }

  function removeVariant(index) {
    set('variants', form.variants.filter((_, idx) => idx !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const sanitizedVariants = (form.variants || [])
      .map(variant => ({
        name: (variant.name || '').trim(),
        options: (variant.options || [])
          .map(option => option.trim())
          .filter(Boolean),
      }))
      .filter(variant => variant.name)

    const sanitizedBolsitas = (form.bolsitasXUd || [])
      .map(value => value.trim())
      .filter(Boolean)

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || '',
      category: form.category?.trim() || '',
      variants: sanitizedVariants,
      bolsitasXUd: sanitizedBolsitas,
      priceNote: form.priceNote?.trim() || '',
      minQuantity: Math.max(1, Number(form.minQuantity) || 1),
    })
  }

  const formId = `product-form-${form.id || 'new'}`

  return (
    <AdminModal
      title={form.id ? 'Editar producto' : 'Nuevo producto'}
      subtitle="Misma estructura visual para cualquier tipo de producto o formato de venta."
      size="xwide"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form={formId} className="btn btn-primary">
            {form.id ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit} className="product-modal-form">
        <div className="product-modal-layout">
          <div className="product-modal-left">
            <section className="admin-modal-section">
              <div className="admin-modal-section-title">Ficha del producto</div>

              <div className="admin-modal-grid-2">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    required
                    value={form.name}
                    onChange={event => set('name', event.target.value)}
                    placeholder="Ej: Alfajor de maicena"
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input
                    value={form.category}
                    onChange={event => set('category', event.target.value)}
                    placeholder="Ej: Alfajores"
                  />
                </div>
              </div>

              <div className="product-meta-grid">
                <div className="form-group">
                  <label>Cantidad mínima</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minQuantity || 1}
                    onChange={event => set('minQuantity', event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <label className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={!!form.active}
                      onChange={event => set('active', event.target.checked)}
                    />
                    Visible en la carta
                  </label>
                </div>

                <div className="form-group">
                  <label>Emoji</label>
                  <div className="emoji-grid">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-btn ${form.emoji === emoji ? 'selected' : ''}`}
                        onClick={() => set('emoji', emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Descripción</label>
                <textarea
                  className="product-description-input"
                  value={form.description}
                  onChange={event => set('description', event.target.value)}
                  placeholder="Descripción breve para la carta..."
                />
              </div>
            </section>

            <section className="admin-modal-section">
              <div className="admin-modal-section-title">Venta y comunicación</div>
              <div className="admin-modal-grid-2 product-sales-grid">
                <div className="form-group">
                  <label>Opciones unitarias / packs (opcional)</label>
                  <ChipInput
                    chips={form.bolsitasXUd || []}
                    onChange={values => set('bolsitasXUd', values)}
                    placeholder="Ej: 1, 6, 12"
                  />
                  <span className="admin-modal-help">
                    Útil para productos que se venden por unidad con packs definidos.
                  </span>
                </div>

                <div className="form-group">
                  <label>Nota comercial visible</label>
                  <input
                    value={form.priceNote || ''}
                    onChange={event => set('priceNote', event.target.value)}
                    placeholder="Ej: Plancha completa y porciones x4"
                  />
                  <span className="admin-modal-help">
                    Se muestra en la carta y en el mensaje prearmado de WhatsApp.
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="admin-modal-section product-modal-right">
            <div className="admin-modal-section-title">Formato de venta y opciones</div>

            <div className="product-variant-suggestions">
              {VARIANT_SUGGESTIONS.map(name => (
                <button
                  key={name}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => addVariantByName(name)}
                >
                  + {name}
                </button>
              ))}
            </div>

            <div className="add-variant-row">
              <input
                value={newVariantName}
                onChange={event => setNewVariantName(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addVariantByName(newVariantName))}
                placeholder="Agregar bloque personalizado (ej: Tamaño, Cobertura, Cantidad)"
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => addVariantByName(newVariantName)}>
                Agregar bloque
              </button>
            </div>

            {form.variants.length > 0 && (
              <div className="product-variant-grid">
                {form.variants.map((variant, index) => (
                  <div key={`${variant.name}-${index}`} className="product-variant-card">
                    <div className="product-variant-head">
                      <input
                        value={variant.name}
                        onChange={event => updateVariantName(index, event.target.value)}
                        placeholder="Nombre del bloque"
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(index)}>
                        Quitar
                      </button>
                    </div>
                    <ChipInput
                      chips={variant.options || []}
                      onChange={options => updateVariantOptions(index, options)}
                      placeholder="Opciones: Enter para agregar"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </form>
    </AdminModal>
  )
}
