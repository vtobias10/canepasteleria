import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import { AdminModal, ConfirmModal } from './AdminModal'
import { getEmojiText } from '../../utils/emoji'
import './OrdersManager.css'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_BADGES = {
  Pendiente: 'badge-yellow',
  'En preparación': 'badge-purple',
  Listo: 'badge-green',
  Entregado: 'badge-green',
  Cancelado: 'badge-red',
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

export default function OrdersManager() {
  const { orders, addOrder, updateOrder, deleteOrder } = useData()
  const [modal, setModal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const byStatus = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus)

  const filtered = search.trim()
    ? byStatus.filter(order =>
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.phone?.includes(search) ||
      order.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )
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
            placeholder="Buscar cliente, tel..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 200 }}
          />
          <button className="btn btn-primary" onClick={() => setModal({ ...emptyOrder, orderItems: [emptyItem()] })}>
            + Nuevo pedido
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

        {sorted.map(order => (
          <div key={order.id} className="order-card card fade-up">
            <div className="order-card-header">
              <div className="order-customer">
                <span className="order-avatar">
                  {order.customerName?.charAt(0)?.toUpperCase() || '?'}
                </span>
                <div>
                  <strong>{order.customerName || 'Sin nombre'}</strong>
                  {order.phone && (
                    <a
                      href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="order-phone"
                    >
                      💬 {order.phone}
                    </a>
                  )}
                  {order.address && <span className="order-address">📍 {order.address}</span>}
                </div>
              </div>

              <div className="order-meta">
                <span className={`badge ${STATUS_BADGES[order.status] || 'badge-purple'}`}>
                  {order.status}
                </span>
                {order.deliveryDate && <span className="order-delivery">{formatDelivery(order.deliveryDate)}</span>}
                <span className="order-date">
                  {order.date ? new Date(order.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
            </div>

            <div className="order-body">
              {order.orderItems?.length > 0 && (
                <div className="order-items-display">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span className="order-item-qty">×{item.quantity}</span>
                      <div className="order-item-info">
                        <span className="order-item-name">
                          {item.type === 'custom' ? `✏️ ${item.customName}` : item.productName}
                        </span>
                        {item.type === 'product' && Object.entries(item.variantSelections || {}).length > 0 && (
                          <span className="order-item-variants">
                            {Object.entries(item.variantSelections).map(([key, value]) => `${key}: ${value}`).join(' · ')}
                            {item.bolsitasXUd ? ` · Bolsitas: ${item.bolsitasXUd}` : ''}
                          </span>
                        )}
                        {item.type === 'custom' && item.customDetails && (
                          <span className="order-item-variants">{item.customDetails}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!order.orderItems?.length && order.products && (
                <div className="order-detail">
                  <span className="order-detail-label">Pedido:</span>
                  <span>{order.products}</span>
                </div>
              )}

              {order.notes && (
                <div className="order-detail">
                  <span className="order-detail-label">Notas:</span>
                  <span>{order.notes}</span>
                </div>
              )}

              {order.tags?.length > 0 && (
                <div className="chips-list" style={{ marginTop: 8 }}>
                  {order.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}
                </div>
              )}
            </div>

            <div className="order-card-footer">
              <select
                className="status-select"
                value={order.status}
                onChange={event => quickStatus(order, event.target.value)}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...order })}>
                  Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(order)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
      title={form.id ? 'Editar pedido' : 'Nuevo pedido'}
      subtitle="Diseño unificado con bloques compactos para cargar toda la información de un vistazo."
      size="wide"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form={formId} className="btn btn-primary">
            {form.id ? 'Guardar cambios' : 'Crear pedido'}
          </button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit}>
        <div className="order-form-layout">
          <div className="order-column">
            <section className="admin-modal-section">
              <div className="admin-modal-section-title">Cliente</div>
              <div className="admin-modal-grid-2">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    value={form.customerName}
                    onChange={event => set('customerName', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    value={form.phone}
                    onChange={event => set('phone', event.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Dirección</label>
                <input
                  value={form.address}
                  onChange={event => set('address', event.target.value)}
                />
              </div>
            </section>

            <section className="admin-modal-section">
              <div className="admin-modal-section-title">Entrega</div>
              <div className="delivery-options">
                <label className={`delivery-opt ${form.deliveryDate.type === 'coordinar' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="coordinar"
                    checked={form.deliveryDate.type === 'coordinar'}
                    onChange={() => set('deliveryDate', { type: 'coordinar', value: '' })}
                  />
                  <span>📅 A coordinar</span>
                </label>

                <label className={`delivery-opt ${form.deliveryDate.type === 'date' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="date"
                    checked={form.deliveryDate.type === 'date'}
                    onChange={() => set('deliveryDate', { type: 'date', value: '' })}
                  />
                  <span>📆 Fecha específica</span>
                </label>
              </div>

              {form.deliveryDate.type === 'date' && (
                <div className="delivery-date-expanded">
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label>Fecha</label>
                    <input
                      type="date"
                      className="date-input-styled"
                      value={form.deliveryDate.value}
                      onChange={event => set('deliveryDate', { ...form.deliveryDate, value: event.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
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
                          <label
                            key={option.val}
                            className={`time-opt ${(form.deliveryDate.timeOfDay || '') === option.val ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="timeOfDay"
                              value={option.val}
                              checked={(form.deliveryDate.timeOfDay || '') === option.val}
                              onChange={() => set('deliveryDate', { ...form.deliveryDate, timeOfDay: option.val })}
                            />
                            <span>{option.icon} {option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <section className="admin-modal-section order-products-section">
            <div className="admin-modal-inline" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="admin-modal-section-title" style={{ marginBottom: 0 }}>Productos del pedido</div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                + Agregar
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

          <div className="order-column">
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
                <ChipInput
                  chips={form.tags || []}
                  onChange={tags => set('tags', tags)}
                  placeholder="Agregar + Enter"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Notas</label>
                <textarea
                  value={form.notes}
                  onChange={event => set('notes', event.target.value)}
                />
              </div>
            </section>
          </div>
        </div>
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
            ✕
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


