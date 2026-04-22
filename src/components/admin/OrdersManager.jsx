import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import { AdminModal, ConfirmModal } from './AdminModal'
import { getEmojiText } from '../../utils/emoji'
import { CheckIcon, XIcon, PlusIcon, TrashIcon, SparkleIcon, EyeIcon, EditIcon, ChevronIcon } from './AdminIcons'
import './OrdersManager.css'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_CLASS = {
  'Pendiente': 'pendiente',
  'En preparación': 'en-prep',
  'Listo': 'listo',
  'Entregado': 'entregado',
  'Cancelado': 'cancelado',
}
const STATUS_BADGES = {
  Pendiente: 'badge-yellow',
  'En preparación': 'badge-purple',
  Listo: 'badge-green',
  Entregado: 'badge-green',
  Cancelado: 'badge-red',
}

function formatDelivery(deliveryDate) {
  if (!deliveryDate) return null
  if (deliveryDate.type === 'coordinar') return '📅 A coordinar'
  if (deliveryDate.value) {
    const date = new Date(`${deliveryDate.value}T00:00:00`)
    const dateText = date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
    const timeIcons = { mañana: '🌅 Mañana', tarde: '☀️ Tarde', noche: '🌙 Noche' }
    const timeText = deliveryDate.timeOfDay ? ` · ${timeIcons[deliveryDate.timeOfDay]}` : ''
    return `📆 ${dateText}${timeText}`
  }
  return null
}

const emptyItem = () => ({
  _key: Date.now() + Math.random(),
  type: 'product',
  productId: '',
  productName: '',
  variantSelections: {},
  bolsitasXUd: '',
  quantity: 1,
  customName: '',
  customDetails: '',
})

const emptyOrder = {
  customerName: '',
  phone: '',
  address: '',
  orderItems: [emptyItem()],
  notes: '',
  status: 'Pendiente',
  deliveryDate: { type: 'coordinar', value: '' },
  tags: [],
}

function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const wrapRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left })
    function onDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const cls = STATUS_CLASS[value] || 'pendiente'

  return (
    <div className="status-select-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`status-select-trigger status-trigger--${cls}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`status-dot status-dot--${cls}`} />
        {value}
        <ChevronIcon />
      </button>
      {open && createPortal(
        <div
          className="status-select-dropdown"
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
        >
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`status-select-opt ${opt === value ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              <span className={`status-dot status-dot--${STATUS_CLASS[opt]}`} />
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

export default function OrdersManager() {
  const { orders, addOrder, updateOrder, deleteOrder } = useData()
  const [modal, setModal] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const byStatus = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus)

  const searchClean = search.trim().replace(/^#/, '')
  const filtered = searchClean
    ? byStatus.filter(order => {
      const n = order.orderNumber
      const numVariants = n ? [
        String(n),
        String(n).padStart(2, '0'),
        String(n).padStart(3, '0'),
        String(n).padStart(4, '0'),
      ] : []
      return (
        order.customerName?.toLowerCase().includes(searchClean.toLowerCase()) ||
        order.phone?.includes(searchClean) ||
        order.tags?.some(tag => tag.toLowerCase().includes(searchClean.toLowerCase())) ||
        numVariants.some(v => v.includes(searchClean))
      )
    })
    : byStatus

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))

  function handleSave(data) {
    if (data.id) {
      updateOrder(data.id, data)
    } else {
      addOrder(data)
    }
    setModal(null)
  }

  function quickStatus(order, status) {
    updateOrder(order.id, { ...order, status })
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Pedidos</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar cliente, tel, #nro..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 210 }}
          />
          <button className="btn btn-primary" onClick={() => setModal({ ...emptyOrder, orderItems: [emptyItem()] })}>
            <PlusIcon /> Nuevo pedido
          </button>
        </div>
      </div>

      <div className="order-filters">
        <button
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilterStatus('all')}
        >
          Todos ({orders.length})
        </button>
        {STATUS_OPTIONS.map(status => {
          const count = orders.filter(order => order.status === status).length
          return (
            <button
              key={status}
              className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(status)}
            >
              {status} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      <div className="orders-list">
        {sorted.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
            {orders.length === 0 ? 'No hay pedidos registrados' : 'Sin resultados para esa búsqueda'}
          </div>
        )}

        {sorted.map(order => {
          const delivery = formatDelivery(order.deliveryDate)
          const itemCount = order.orderItems?.length || 0
          return (
            <div key={order.id} className="order-row card fade-up">
              <div className="order-row-avatar">{order.customerName?.charAt(0)?.toUpperCase() || '?'}</div>

              <div className="order-row-number">
                #{String(order.orderNumber || '?').padStart(4, '0')}
              </div>

              <div className="order-row-main">
                <strong className="order-row-name">{order.customerName || 'Sin nombre'}</strong>
                {order.phone && <span className="order-row-phone">📱 {order.phone}</span>}
              </div>

              <div className="order-row-meta">
                <span className={`badge ${STATUS_BADGES[order.status] || 'badge-purple'}`}>{order.status}</span>
                {delivery && <span className="order-row-delivery">{delivery}</span>}
              </div>

              <div className="order-row-count">
                {itemCount} prod{itemCount !== 1 ? 's' : '.'}
              </div>

              <div className="order-row-actions">
                <StatusSelect value={order.status} onChange={status => quickStatus(order, status)} />
                <button className="btn btn-ghost btn-sm" onClick={() => setViewOrder(order)}><EyeIcon /><span className="btn-label"> Ver</span></button>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...order })}><EditIcon /><span className="btn-label"> Editar</span></button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(order)}><TrashIcon /></button>
              </div>
            </div>
          )
        })}
      </div>

      {viewOrder && (
        <OrderViewModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onEdit={() => { setModal({ ...viewOrder }); setViewOrder(null) }}
        />
      )}

      {modal !== null && (
        <OrderFormModal
          initial={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar pedido?"
          message={(
            <>
              Se eliminará el pedido de <strong>{confirmDelete.customerName}</strong>. Esta acción no se puede deshacer.
            </>
          )}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteOrder(confirmDelete.id)
            setConfirmDelete(null)
          }}
          confirmLabel="Eliminar"
          tone="danger"
        />
      )}
    </div>
  )
}

function OrderViewModal({ order, onClose, onEdit }) {
  const delivery = formatDelivery(order.deliveryDate)
  const itemCount = order.orderItems?.length || 0

  const orderLabel = order.orderNumber ? ` #${String(order.orderNumber).padStart(4, '0')}` : ''
  return (
    <AdminModal
      title={`Detalle del pedido${orderLabel}`}
      size="medium"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><XIcon /> Cerrar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}><CheckIcon /> Editar pedido</button>
        </>
      )}
    >
      <div className="order-view-grid">
        <div className="admin-modal-section order-view-section">
          <div className="admin-modal-section-title">Cliente</div>
          <div className="order-view-field"><span className="order-view-label">Nombre</span><span>{order.customerName || '—'}</span></div>
          <div className="order-view-field"><span className="order-view-label">Teléfono</span><span>{order.phone || '—'}</span></div>
          <div className="order-view-field"><span className="order-view-label">Dirección</span><span>{order.address || '—'}</span></div>
        </div>

        <div className="admin-modal-section order-view-section">
          <div className="admin-modal-section-title">Entrega y estado</div>
          <div className="order-view-field">
            <span className="order-view-label">Entrega</span>
            <span>{delivery || 'A coordinar'}</span>
          </div>
          <div className="order-view-field">
            <span className="order-view-label">Estado</span>
            <span className={`badge ${(order.status === 'Pendiente' ? 'badge-yellow' : order.status === 'En preparación' ? 'badge-purple' : order.status === 'Listo' || order.status === 'Entregado' ? 'badge-green' : 'badge-red')}`}>
              {order.status}
            </span>
          </div>
          {order.tags?.length > 0 && (
            <div className="order-view-field">
              <span className="order-view-label">Etiquetas</span>
              <span className="order-view-chips">
                {order.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}
              </span>
            </div>
          )}
          {order.notes && (
            <div className="order-view-field order-view-field--block">
              <span className="order-view-label">Notas</span>
              <span className="order-view-notes">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="admin-modal-section" style={{ marginTop: 10 }}>
        <div className="admin-modal-section-title">Productos ({itemCount})</div>
        <div className="order-view-items">
          {order.orderItems?.map((item, index) => {
            const variants = item.variantSelections
              ? Object.entries(item.variantSelections).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ')
              : ''
            return (
              <div key={item._key || index} className="order-view-item">
                <span className="order-view-item-qty">×{item.quantity}</span>
                <div className="order-view-item-info">
                  <span className="order-view-item-name">
                    {item.type === 'custom' ? (item.customName || 'Personalizado') : (item.productName || '—')}
                  </span>
                  {variants && <span className="order-view-item-variants">{variants}</span>}
                  {item.bolsitasXUd && <span className="order-view-item-variants">Bolsitas: {item.bolsitasXUd}</span>}
                  {item.type === 'custom' && item.customDetails && (
                    <span className="order-view-item-variants">{item.customDetails}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminModal>
  )
}

function OrderFormModal({ initial, onSave, onClose }) {
  const { products } = useData()
  const [form, setForm] = useState(() => ({
    ...initial,
    orderItems: initial.orderItems?.length
      ? initial.orderItems.map(item => ({ ...item, _key: item._key || Date.now() + Math.random() }))
      : [emptyItem()],
    deliveryDate: initial.deliveryDate || { type: 'coordinar', value: '' },
  }))

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function addItem() {
    set('orderItems', [...form.orderItems, emptyItem()])
  }

  function removeItem(key) {
    set('orderItems', form.orderItems.filter(item => item._key !== key))
  }

  function updateItem(key, patch) {
    set('orderItems', form.orderItems.map(item => (
      item._key === key ? { ...item, ...patch } : item
    )))
  }

  function handleProductSelect(key, productId) {
    if (productId === '__custom__') {
      updateItem(key, {
        type: 'custom',
        productId: '',
        productName: '',
        variantSelections: {},
        bolsitasXUd: '',
      })
      return
    }

    const product = products.find(item => item.id === productId)
    updateItem(key, {
      type: 'product',
      productId,
      productName: product?.name || '',
      variantSelections: {},
      bolsitasXUd: '',
      customName: '',
      customDetails: '',
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(form)
  }

  const formId = `order-form-${form.id || 'new'}`

  return (
    <AdminModal
      title={form.id ? `Editar pedido${form.orderNumber ? ` #${String(form.orderNumber).padStart(4, '0')}` : ''}` : 'Nuevo pedido'}
      size="wide"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><XIcon /> Cancelar</button>
          <button type="submit" form={formId} className="btn btn-primary btn-sm">
            {form.id ? <><CheckIcon /> Guardar cambios</> : <><SparkleIcon /> Crear pedido</>}
          </button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit}>
        <div className="order-form-top">
          <section className="admin-modal-section">
            <div className="admin-modal-section-title">Cliente</div>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.customerName} onChange={event => set('customerName', event.target.value)} />
            </div>
            <div className="form-group">
              <label>Teléfono / WhatsApp</label>
              <input value={form.phone} onChange={event => set('phone', event.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Dirección</label>
              <input value={form.address} onChange={event => set('address', event.target.value)} />
            </div>
          </section>

          <section className="admin-modal-section">
            <div className="admin-modal-section-title">Entrega</div>
            <div className="delivery-options">
              <label className={`delivery-opt ${form.deliveryDate.type === 'coordinar' ? 'selected' : ''}`}>
                <input type="radio" name="deliveryType" value="coordinar"
                  checked={form.deliveryDate.type === 'coordinar'}
                  onChange={() => set('deliveryDate', { type: 'coordinar', value: '' })} />
                <span>📅 A coordinar</span>
              </label>
              <label className={`delivery-opt ${form.deliveryDate.type === 'date' ? 'selected' : ''}`}>
                <input type="radio" name="deliveryType" value="date"
                  checked={form.deliveryDate.type === 'date'}
                  onChange={() => set('deliveryDate', { type: 'date', value: '' })} />
                <span>📆 Fecha específica</span>
              </label>
            </div>
            {form.deliveryDate.type === 'date' && (
              <div className="delivery-date-expanded" style={{ marginTop: 10 }}>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label>Fecha</label>
                  <input type="date" className="date-input-styled"
                    value={form.deliveryDate.value}
                    onChange={event => set('deliveryDate', { ...form.deliveryDate, value: event.target.value })}
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                {form.deliveryDate.value && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Horario</label>
                    <div className="time-options">
                      {[
                        { val: '', label: 'Sin especificar', icon: '🕐' },
                        { val: 'mañana', label: 'Mañana', icon: '🌅' },
                        { val: 'tarde', label: 'Tarde', icon: '☀️' },
                        { val: 'noche', label: 'Noche', icon: '🌙' },
                      ].map(option => (
                        <label key={option.val}
                          className={`time-opt ${(form.deliveryDate.timeOfDay || '') === option.val ? 'selected' : ''}`}>
                          <input type="radio" name="timeOfDay" value={option.val}
                            checked={(form.deliveryDate.timeOfDay || '') === option.val}
                            onChange={() => set('deliveryDate', { ...form.deliveryDate, timeOfDay: option.val })} />
                          <span>{option.icon} {option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="admin-modal-section">
            <div className="admin-modal-section-title">Estado y seguimiento</div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.status} onChange={event => set('status', event.target.value)}>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Etiquetas</label>
              <ChipInput chips={form.tags || []} onChange={tags => set('tags', tags)} placeholder="Agregar + Enter" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Notas</label>
              <textarea value={form.notes} onChange={event => set('notes', event.target.value)} />
            </div>
          </section>
        </div>

        <section className="admin-modal-section order-products-section">
          <div className="admin-modal-inline" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="admin-modal-section-title" style={{ marginBottom: 0 }}>Productos del pedido</div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              <PlusIcon /> Agregar
            </button>
          </div>
          <div className="order-items-table">
            {form.orderItems.map(item => (
              <OrderItemRow
                key={item._key}
                item={item}
                products={products}
                onProductSelect={productId => handleProductSelect(item._key, productId)}
                onUpdate={patch => updateItem(item._key, patch)}
                onRemove={() => removeItem(item._key)}
                canRemove={form.orderItems.length > 1}
              />
            ))}
          </div>
        </section>
      </form>
    </AdminModal>
  )
}

function OrderItemRow({ item, products, onProductSelect, onUpdate, onRemove, canRemove }) {
  const selectedProduct = item.type === 'product' && item.productId
    ? products.find(product => product.id === item.productId)
    : null

  return (
    <div className="order-item-form-row">
      <div className="order-item-form-top">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Producto</label>
          <select
            value={item.type === 'custom' ? '__custom__' : item.productId}
            onChange={event => onProductSelect(event.target.value)}
          >
            <option value="">- Seleccionar -</option>
            {products.filter(product => product.active).map(product => (
              <option key={product.id} value={product.id}>
                {getEmojiText(product.emoji)} {product.name}
              </option>
            ))}
            <option value="__custom__">✏️ Personalizado</option>
          </select>
        </div>

        <div className="form-group order-item-qty-group" style={{ marginBottom: 0 }}>
          <label>Cant.</label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={event => onUpdate({ quantity: parseInt(event.target.value, 10) || 1 })}
          />
        </div>

        {canRemove && (
          <button type="button" className="btn btn-danger btn-sm remove-item-btn" onClick={onRemove} aria-label="Quitar producto">
            <TrashIcon />
          </button>
        )}
      </div>

      {item.type === 'custom' && (
        <div className="order-item-custom">
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>Producto personalizado</label>
            <input
              value={item.customName}
              onChange={event => onUpdate({ customName: event.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Detalles</label>
            <input
              value={item.customDetails}
              onChange={event => onUpdate({ customDetails: event.target.value })}
            />
          </div>
        </div>
      )}

      {item.type === 'product' && selectedProduct && (
        <div className="order-item-variants-grid">
          {selectedProduct.variants?.map(variant => (
            <div key={variant.name} className="form-group" style={{ marginBottom: 0 }}>
              <label>{variant.name}</label>
              <select
                value={item.variantSelections?.[variant.name] || ''}
                onChange={event => onUpdate({
                  variantSelections: { ...item.variantSelections, [variant.name]: event.target.value },
                })}
              >
                <option value="">- {variant.name} -</option>
                {variant.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}

          {selectedProduct.bolsitasXUd?.length > 0 && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Bolsitas por ud.</label>
              <select
                value={item.bolsitasXUd || ''}
                onChange={event => onUpdate({ bolsitasXUd: event.target.value })}
              >
                <option value="">- Seleccionar -</option>
                {selectedProduct.bolsitasXUd.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


