import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import { AdminModal, ConfirmModal } from './AdminModal'
import { getEmojiText, isEmojiImage, normalizeEmojiSrc } from '../../utils/emoji'
import './ProductsManager.css'

const EMOJI_OPTIONS = [
  '\u{1F382}',
  '\u{1F9C1}',
  '\u{1F370}',
  '\u{1F36B}',
  '\u{1F36A}',
  '\u{1F380}',
  '\u{1F369}',
  '\u{1F950}',
  '\u{1F36E}',
  '\u{1F967}',
  '/emojis/bomba_de_crema.png',
  '/emojis/brownie.png',
]
const VARIANT_SUGGESTIONS = ['Presentacion', 'Tamano', 'Sabor', 'Relleno', 'Cobertura', 'Formato']
const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024
const DEFAULT_EMOJI = '\u{1F382}'

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  emoji: DEFAULT_EMOJI,
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

function moveIdRelative(ids, draggingId, targetId, position) {
  if (!draggingId || !targetId || draggingId === targetId) return ids
  const next = [...ids]
  const from = next.indexOf(draggingId)
  if (from === -1) return ids
  next.splice(from, 1)
  const targetIndex = next.indexOf(targetId)
  if (targetIndex === -1) return ids
  const insertAt = position === 'after' ? targetIndex + 1 : targetIndex
  next.splice(insertAt, 0, draggingId)
  return next
}

export default function ProductsManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useData()
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [dragProductId, setDragProductId] = useState(null)
  const [dragOverProductId, setDragOverProductId] = useState(null)
  const [dragOverPosition, setDragOverPosition] = useState(null)
  const [previewProductIds, setPreviewProductIds] = useState(null)

  const canDragReorder = search.trim() === ''
  const orderedProducts = canDragReorder && previewProductIds
    ? previewProductIds.map(id => products.find(item => item.id === id)).filter(Boolean)
    : products

  const displayed = orderedProducts.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  )

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
    setDragOverPosition(null)
    setPreviewProductIds(products.map(item => item.id))
  }

  function handleDragOver(event, id) {
    if (!dragProductId || !canDragReorder) return
    event.preventDefault()
    const rowRect = event.currentTarget.getBoundingClientRect()
    const position = event.clientY >= rowRect.top + rowRect.height / 2 ? 'after' : 'before'
    if (dragOverProductId !== id) {
      setDragOverProductId(id)
    }
    if (dragOverPosition !== position) {
      setDragOverPosition(position)
    }
    setPreviewProductIds((prev) => {
      const base = prev || products.map(item => item.id)
      const next = moveIdRelative(base, dragProductId, id, position)
      return next
    })
  }

  function handleDrop(targetId) {
    if (!dragProductId || !targetId || !canDragReorder) {
      setDragProductId(null)
      setDragOverProductId(null)
      setDragOverPosition(null)
      setPreviewProductIds(null)
      return
    }

    const currentIds = products.map(item => item.id)
    const nextIds = previewProductIds || currentIds
    const changed = nextIds.some((id, index) => id !== currentIds[index])
    if (changed) {
      reorderProducts(nextIds)
    }

    setDragProductId(null)
    setDragOverProductId(null)
    setDragOverPosition(null)
    setPreviewProductIds(null)
  }

  function handleDragEnd() {
    setDragProductId(null)
    setDragOverProductId(null)
    setDragOverPosition(null)
    setPreviewProductIds(null)
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
                className={`sortable-row ${dragProductId === product.id ? 'dragging' : ''} ${dragOverProductId === product.id && dragProductId !== product.id && dragOverPosition === 'before' ? 'drag-over-before' : ''} ${dragOverProductId === product.id && dragProductId !== product.id && dragOverPosition === 'after' ? 'drag-over-after' : ''}`}
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
                    <span className="drag-handle-icon" aria-hidden="true" />
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={`Imagen de ${product.name}`}
                        className="admin-product-image-thumb"
                      />
                    ) : isEmojiImage(product.emoji) ? (
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
    imageUrl: initial.imageUrl ?? '',
    emoji: initial.imageUrl ? (initial.emoji || '') : (initial.emoji || DEFAULT_EMOJI),
  }))
  const [newVariantName, setNewVariantName] = useState('')
  const [imageError, setImageError] = useState('')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [mediaMode, setMediaMode] = useState(() => (initial.imageUrl ? 'image' : 'emoji'))
  const currentCategory = (form.category || '').trim()
  const fileInputId = `product-image-input-${form.id || 'new'}`
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

  function switchToImageMode() {
    setMediaMode('image')
    set('emoji', '')
    setImageError('')
  }

  function switchToEmojiMode() {
    setMediaMode('emoji')
    set('imageUrl', '')
    if (!form.emoji) set('emoji', DEFAULT_EMOJI)
    setImageError('')
  }

  function handleImageSelected(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen valida.')
      return
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setImageError('La imagen supera 2MB. Usa una mas liviana.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      set('imageUrl', String(reader.result || ''))
      set('emoji', '')
      setMediaMode('image')
      setImageError('')
    }
    reader.onerror = () => {
      setImageError('No se pudo leer la imagen.')
    }
    reader.readAsDataURL(file)
  }

  function openImagePicker() {
    const node = typeof document !== 'undefined' ? document.getElementById(fileInputId) : null
    node?.click()
  }

  function clearImage() {
    set('imageUrl', '')
    setMediaMode('emoji')
    if (!form.emoji) set('emoji', DEFAULT_EMOJI)
  }

  function chooseEmoji(emoji) {
    set('emoji', emoji)
    set('imageUrl', '')
    setMediaMode('emoji')
    setImageError('')
    setEmojiPickerOpen(false)
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
    const usingImage = mediaMode === 'image' && !!form.imageUrl

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || '',
      category: form.category?.trim() || '',
      imageUrl: usingImage ? form.imageUrl : '',
      emoji: usingImage ? '' : (form.emoji || DEFAULT_EMOJI),
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
    <>
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
            <div className="product-modal-left-col">
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

                <div className="form-group">
                  <label>Imagen / Icono</label>
                  <div className="product-media-mode-switch">
                    <button
                      type="button"
                      className={`btn btn-sm ${mediaMode === 'image' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={switchToImageMode}
                    >
                      Imagen
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${mediaMode === 'emoji' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={switchToEmojiMode}
                    >
                      Icono
                    </button>
                  </div>

                  <div className="product-media-editor-row">
                    {mediaMode === 'image' ? (
                      <div className={`product-image-editor ${form.imageUrl ? 'has-image' : ''}`}>
                        {form.imageUrl ? (
                          <img src={form.imageUrl} alt="Vista previa del producto" className="product-image-editor-img" />
                        ) : (
                          <span className="product-image-editor-placeholder">Sin imagen</span>
                        )}
                        <input
                          id={fileInputId}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelected}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="product-image-editor-action edit"
                          aria-label="Editar imagen"
                          onClick={openImagePicker}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                        {form.imageUrl && (
                          <button
                            type="button"
                            className="product-image-editor-action remove"
                            aria-label="Quitar imagen"
                            onClick={clearImage}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button type="button" className="product-emoji-picker-trigger" onClick={() => setEmojiPickerOpen(true)}>
                        {isEmojiImage(form.emoji) ? (
                          <img
                            src={normalizeEmojiSrc(form.emoji)}
                            alt="Icono seleccionado"
                            className="product-emoji-picker-preview-img"
                          />
                        ) : (
                          <span className="product-emoji-picker-preview-text">{getEmojiText(form.emoji, DEFAULT_EMOJI)}</span>
                        )}
                        <span>Elegir icono</span>
                      </button>
                    )}
                  </div>
                  {imageError && <span className="admin-modal-help" style={{ color: '#b44747' }}>{imageError}</span>}
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
                    <label>Cantidad minima</label>
                    <input
                      type="number"
                      min="1"
                      value={form.minQuantity || 1}
                      onChange={event => set('minQuantity', event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Packs</label>
                    <ChipInput
                      chips={form.bolsitasXUd || []}
                      onChange={values => set('bolsitasXUd', values)}
                    />
                  </div>
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
                    <label>Nota comercial</label>
                    <input
                      value={form.priceNote || ''}
                      onChange={event => set('priceNote', event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <label className="product-status-field">
                      <input
                        type="checkbox"
                        checked={!!form.active}
                        onChange={event => set('active', event.target.checked)}
                      />
                      <span>Activo</span>
                    </label>
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

      {emojiPickerOpen && (
        <AdminModal
          title="Elegir icono"
          subtitle="Selecciona un icono para el producto."
          size="compact"
          onClose={() => setEmojiPickerOpen(false)}
        >
          <div className="product-emoji-picker-grid">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${form.emoji === emoji ? 'selected' : ''}`}
                onClick={() => chooseEmoji(emoji)}
              >
                {isEmojiImage(emoji) ? (
                  <img
                    src={normalizeEmojiSrc(emoji)}
                    alt="Icono personalizado"
                    className="emoji-btn-image"
                  />
                ) : (
                  emoji
                )}
              </button>
            ))}
          </div>
        </AdminModal>
      )}
    </>
  )
}

