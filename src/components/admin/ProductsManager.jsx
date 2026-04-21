import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import './ProductsManager.css'

const EMOJIS = ['🎂', '🧁', '🍰', '🍫', '🍪', '🎀', '🍩', '🥐', '🍮', '🥧']

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
  const [modal, setModal] = useState(null) // null | 'new' | product object
  const [confirmDelete, setConfirmDelete] = useState(null)

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
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
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
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  No hay productos aún
                </td>
              </tr>
            )}
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2, maxWidth: 220 }}>
                        {p.description?.slice(0, 60)}{p.description?.length > 60 ? '…' : ''}
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
        <div className="modal-overlay fade-in">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 style={{ marginBottom: 12 }}>¿Eliminar producto?</h3>
            <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>
              Esta acción no se puede deshacer. ¿Seguro que querés eliminar <strong>{confirmDelete.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [newVariantName, setNewVariantName] = useState('')

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function addVariant() {
    if (!newVariantName.trim()) return
    set('variants', [...(form.variants || []), { name: newVariantName.trim(), options: [] }])
    setNewVariantName('')
  }

  function updateVariantOptions(i, options) {
    const updated = form.variants.map((v, idx) => idx === i ? { ...v, options } : v)
    set('variants', updated)
  }

  function removeVariant(i) {
    set('variants', form.variants.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay fade-in">
      <div className="modal product-form-modal">
        <div className="modal-header">
          <h3>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Emoji</label>
            <div className="emoji-grid">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${form.emoji === e ? 'selected' : ''}`}
                  onClick={() => set('emoji', e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Nombre *</label>
              <input
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ej: Alfajores artesanales"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Categoría</label>
              <input
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="Ej: Alfajores"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descripción del producto..."
            />
          </div>

          <hr className="divider" />

          <div className="form-group">
            <label>Variantes</label>
            {form.variants?.map((v, i) => (
              <div key={i} className="variant-row card">
                <div className="variant-row-header">
                  <strong>{v.name}</strong>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(i)}>
                    Quitar
                  </button>
                </div>
                <ChipInput
                  chips={v.options}
                  onChange={opts => updateVariantOptions(i, opts)}
                  placeholder="Agregar opción y presionar Enter"
                />
              </div>
            ))}
            <div className="add-variant-row">
              <input
                value={newVariantName}
                onChange={e => setNewVariantName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                placeholder="Nombre de variante (ej: Tamaño, Sabor)"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={addVariant}>
                + Agregar variante
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Bolsitas por unidad</label>
            <ChipInput
              chips={form.bolsitasXUd || []}
              onChange={vals => set('bolsitasXUd', vals)}
              placeholder="Ej: 1, 6, 12 — presionar Enter"
            />
          </div>

          <hr className="divider" />

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Nota de precio / presentación</label>
              <input
                value={form.priceNote || ''}
                onChange={e => set('priceNote', e.target.value)}
                placeholder="Ej: Porciones x4 $2.600 · Mín. 4 u."
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                Se muestra en la carta y en el mensaje de WhatsApp
              </span>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Cantidad mínima de compra</label>
              <input
                type="number"
                min="1"
                value={form.minQuantity || 1}
                onChange={e => set('minQuantity', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => set('active', e.target.checked)}
                style={{ width: 'auto' }}
              />
              Producto activo (visible en la carta)
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {form.id ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
