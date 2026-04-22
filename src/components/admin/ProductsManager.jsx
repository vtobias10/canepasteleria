import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import { AdminModal, ConfirmModal } from './AdminModal'
import { getEmojiText, isEmojiImage, normalizeEmojiSrc } from '../../utils/emoji'
import './ProductsManager.css'

const EMOJI_OPTIONS = ['🎂', '🧁', '🍰', '🍫', '🍪', '🎀', '🍩', '🥐', '🍮', '🥧', '/emojis/bomba_de_crema.png', '/emojis/brownie.png']
const VARIANT_SUGGESTIONS = ['Presentacion', 'Tamano', 'Sabor', 'Relleno', 'Cobertura', 'Formato']

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  emoji: '🎂',
  variants: [],
  bolsitasXUd: [],
  price: null,
  salePrice: null,
  priceNote: '',
  minQuantity: 1,
  active: true,
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatMoney(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return `$${number.toLocaleString('es-AR')}`
}

function renderPrice(product) {
  const regularPrice = toNumberOrNull(product.price)
  const discountedPrice = toNumberOrNull(product.salePrice)
  const hasPrice = regularPrice !== null
  const hasSale = discountedPrice !== null && discountedPrice > 0

  if (!hasPrice && !hasSale) {
    return <span style={{ color: 'var(--text-light)' }}>Sin precio</span>
  }

  if (hasPrice && hasSale && discountedPrice < regularPrice) {
    return (
      <div className="admin-product-price-stack">
        <span className="admin-product-price-old">{formatMoney(regularPrice)}</span>
        <strong className="admin-product-price-sale">{formatMoney(discountedPrice)}</strong>
      </div>
    )
  }

  return <strong className="admin-product-price-sale">{formatMoney(hasSale ? discountedPrice : regularPrice)}</strong>
}

export default function ProductsManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useData()
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [dragProductId, setDragProductId] = useState(null)
  const [dragOverProductId, setDragOverProductId] = useState(null)

  const displayed = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  )
  const canDragReorder = search.trim() === ''

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

  function handleDragStart(event, id) {
    if (!canDragReorder) return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    setDragProductId(id)
  }

  function handleDragOver(event, id) {
    if (!dragProductId || !canDragReorder) return
    event.preventDefault()
    if (dragOverProductId !== id) {
      setDragOverProductId(id)
    }
  }

  function handleDrop(targetId) {
    if (!dragProductId || !targetId || dragProductId === targetId || !canDragReorder) {
      setDragProductId(null)
      setDragOverProductId(null)
      return
    }

    const from = products.findIndex(item => item.id === dragProductId)
    const to = products.findIndex(item => item.id === targetId)
    if (from === -1 || to === -1) {
      setDragProductId(null)
      setDragOverProductId(null)
      return
    }

    const next = [...products]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    reorderProducts(next.map(item => item.id))

    setDragProductId(null)
    setDragOverProductId(null)
  }

  function handleDragEnd() {
    setDragProductId(null)
    setDragOverProductId(null)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Productos</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} en total
          </p>
          {!canDragReorder && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.76rem', marginTop: 4 }}>
              Para reordenar, limpia la busqueda.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar producto..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 200 }}
          />
          <button className="btn btn-primary" onClick={() => setModal({ ...emptyProduct })}>+ Nuevo producto</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th className="sort-col-head">Orden</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precios</th>
              <th>Variantes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  {products.length === 0 ? 'No hay productos aun' : 'Sin resultados para esa busqueda'}
                </td>
              </tr>
            )}
            {displayed.map(product => (
              <tr
                key={product.id}
                className={`sortable-row ${dragProductId === product.id ? 'dragging' : ''} ${dragOverProductId === product.id ? 'drag-over' : ''}`}
                onDragOver={event => handleDragOver(event, product.id)}
                onDrop={() => handleDrop(product.id)}
              >
                <td className="sort-col-cell">
                  <button
                    type="button"
                    className={`drag-handle ${canDragReorder ? '' : 'disabled'}`}
                    draggable={canDragReorder}
                    onDragStart={event => handleDragStart(event, product.id)}
                    onDragEnd={handleDragEnd}
                    title={canDragReorder ? 'Arrastrar para reordenar' : 'Limpia la busqueda para reordenar'}
                    aria-label="Arrastrar para reordenar"
                  >
                    ⋮⋮
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isEmojiImage(product.emoji) ? (
                      <img
                        src={normalizeEmojiSrc(product.emoji)}
                        alt={`Emoji de ${product.name}`}
                        className="admin-product-emoji-image"
                      />
                    ) : (
                      <span className="admin-product-emoji">{getEmojiText(product.emoji)}</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2, maxWidth: 220 }}>
                        {product.description?.slice(0, 60)}{product.description?.length > 60 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{product.category && <span className="badge badge-purple">{product.category}</span>}</td>
                <td>{renderPrice(product)}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {product.variants?.map(variant => (
                      <span key={variant.name} style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                        <strong>{variant.name}:</strong> {variant.options.join(', ')}
                      </span>
                    ))}
                    {product.bolsitasXUd?.length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                        <strong>Bolsitas x ud:</strong> {product.bolsitasXUd.join(', ')}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${product.active ? 'badge-green' : 'badge-red'}`}>
                    {product.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...product })}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(product)}>Eliminar</button>
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
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar producto"
          message={(
            <>
              Esta accion no se puede deshacer. Se eliminara <strong>{confirmDelete.name}</strong>.
            </>
          )}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
          confirmLabel="Si, eliminar"
          tone="danger"
        />
      )}
    </div>
  )
}

function ProductFormModal({ initial, categories, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    variants: initial.variants ?? [],
    bolsitasXUd: initial.bolsitasXUd ?? [],
  }))
  const [newVariantName, setNewVariantName] = useState('')
  const currentCategory = (form.category || '').trim()
  const categoryOptions = (() => {
    const base = categories || []
    if (!currentCategory) return base
    const exists = base.some(category => category.name?.toLowerCase() === currentCategory.toLowerCase())
    return exists ? base : [{ id: `custom-${currentCategory.toLowerCase()}`, name: currentCategory }, ...base]
  })()

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function addVariantByName(rawName) {
    const name = rawName.trim()
    if (!name) return
    const exists = form.variants.some(variant => variant.name?.toLowerCase() === name.toLowerCase())
    if (exists) return
    set('variants', [...form.variants, { name, options: [] }])
    setNewVariantName('')
  }

  function updateVariantName(index, name) {
    set('variants', form.variants.map((variant, idx) => (idx === index ? { ...variant, name } : variant)))
  }

  function updateVariantOptions(index, options) {
    set('variants', form.variants.map((variant, idx) => (idx === index ? { ...variant, options } : variant)))
  }

  function removeVariant(index) {
    set('variants', form.variants.filter((_, idx) => idx !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const sanitizedVariants = (form.variants || [])
      .map(variant => ({
        name: (variant.name || '').trim(),
        options: (variant.options || []).map(option => option.trim()).filter(Boolean),
      }))
      .filter(variant => variant.name)

    const sanitizedBolsitas = (form.bolsitasXUd || []).map(value => value.trim()).filter(Boolean)
    const regularPrice = toNumberOrNull(form.price)
    const salePrice = toNumberOrNull(form.salePrice)

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || '',
      category: form.category?.trim() || '',
      variants: sanitizedVariants,
      bolsitasXUd: sanitizedBolsitas,
      price: regularPrice,
      salePrice: salePrice !== null && salePrice > 0 ? salePrice : null,
      priceNote: form.priceNote?.trim() || '',
      minQuantity: Math.max(1, Number(form.minQuantity) || 1),
    })
  }

  const formId = `product-form-${form.id || 'new'}`

  return (
    <AdminModal
      title={form.id ? 'Editar producto' : 'Nuevo producto'}
      subtitle="Estructura flexible para cualquier formato de venta."
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
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={form.category || ''}
                    onChange={event => set('category', event.target.value)}
                  >
                    <option value="">Sin categoria</option>
                    {categoryOptions.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="product-meta-grid">
                <div className="form-group">
                  <label>Cantidad minima</label>
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
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-btn ${form.emoji === emoji ? 'selected' : ''}`}
                        onClick={() => set('emoji', emoji)}
                      >
                        {isEmojiImage(emoji) ? (
                          <img
                            src={normalizeEmojiSrc(emoji)}
                            alt="Emoji personalizado"
                            className="emoji-btn-image"
                          />
                        ) : (
                          emoji
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Descripcion</label>
                <textarea
                  className="product-description-input"
                  value={form.description}
                  onChange={event => set('description', event.target.value)}
                />
              </div>
            </section>

            <section className="admin-modal-section">
              <div className="admin-modal-section-title">Venta y comunicacion</div>

              <div className="admin-modal-grid-2 product-sales-grid">
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price ?? ''}
                    onChange={event => set('price', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Precio con rebaja</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.salePrice ?? ''}
                    onChange={event => set('salePrice', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Opciones unitarias / packs (opcional)</label>
                  <ChipInput
                    chips={form.bolsitasXUd || []}
                    onChange={values => set('bolsitasXUd', values)}
                  />
                  <span className="admin-modal-help">
                    Util para productos que se venden por unidad con packs definidos.
                  </span>
                </div>
                <div className="form-group">
                  <label>Nota comercial visible</label>
                  <input
                    value={form.priceNote || ''}
                    onChange={event => set('priceNote', event.target.value)}
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
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeVariant(index)}>
                        Quitar
                      </button>
                    </div>
                    <ChipInput
                      chips={variant.options || []}
                      onChange={options => updateVariantOptions(index, options)}
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
