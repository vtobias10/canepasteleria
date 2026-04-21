import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ChipInput from './ChipInput'
import './OrdersManager.css'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_BADGES = {
  'Pendiente': 'badge-yellow',
  'En preparación': 'badge-purple',
  'Listo': 'badge-green',
  'Entregado': 'badge-green',
  'Cancelado': 'badge-red',
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

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

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
      const d = new Date(deliveryDate.value + 'T00:00:00')
      const dateStr = d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
      const timeIcons = { mañana: '🌅 Mañana', tarde: '☀️ Tarde', noche: '🌙 Noche' }
      const timeStr = deliveryDate.timeOfDay ? ` · ${timeIcons[deliveryDate.timeOfDay]}` : ''
      return `📅 ${dateStr}${timeStr}`
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
        <button className="btn btn-primary" onClick={() => setModal({ ...emptyOrder, orderItems: [emptyItem()] })}>
          + Nuevo pedido
        </button>
      </div>

      <div className="order-filters">
        <button
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilterStatus('all')}
        >
          Todos ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s).length
          return (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      <div className="orders-list">
        {sorted.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
            No hay pedidos registrados
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
                  {order.address && (
                    <span className="order-address">📍 {order.address}</span>
                  )}
                </div>
              </div>
              <div className="order-meta">
                <span className={`badge ${STATUS_BADGES[order.status] || 'badge-purple'}`}>
                  {order.status}
                </span>
                {order.deliveryDate && (
                  <span className="order-delivery">{formatDelivery(order.deliveryDate)}</span>
                )}
                <span className="order-date">
                  {order.date ? new Date(order.date).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  }) : ''}
                </span>
              </div>
            </div>

            <div className="order-body">
              {/* New structured items */}
              {order.orderItems?.length > 0 && (
                <div className="order-items-display">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span className="order-item-qty">×{item.quantity}</span>
                      <div className="order-item-info">
                        <span className="order-item-name">
                          {item.type === 'custom' ? `✏️ ${item.customName}` : item.productName}
                        </span>
                        {item.type === 'product' && Object.entries(item.variantSelections || {}).length > 0 && (
                          <span className="order-item-variants">
                            {Object.entries(item.variantSelections).map(([k, v]) => `${k}: ${v}`).join(' · ')}
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
              {/* Legacy free-text products */}
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
                  {order.tags.map(t => <span key={t} className="chip">{t}</span>)}
                </div>
              )}
            </div>

            <div className="order-card-footer">
              <select
                className="status-select"
                value={order.status}
                onChange={e => quickStatus(order, e.target.value)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...order })}>
                  Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(order)}>
                  ✕
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
        <div className="modal-overlay fade-in">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 style={{ marginBottom: 12 }}>¿Eliminar pedido?</h3>
            <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>
              Se eliminará el pedido de <strong>{confirmDelete.customerName}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { deleteOrder(confirmDelete.id); setConfirmDelete(null) }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Order Form Modal ──────────────────────────────────────────────────────────

function OrderFormModal({ initial, onSave, onClose }) {
  const { products } = useData()
  const [form, setForm] = useState(() => ({
    ...initial,
    orderItems: initial.orderItems?.length
      ? initial.orderItems.map(i => ({ ...i, _key: i._key || Date.now() + Math.random() }))
      : [emptyItem()],
    deliveryDate: initial.deliveryDate || { type: 'coordinar', value: '' },
  }))

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // ── Items ──
  function addItem() {
    set('orderItems', [...form.orderItems, emptyItem()])
  }

  function removeItem(key) {
    set('orderItems', form.orderItems.filter(i => i._key !== key))
  }

  function updateItem(key, patch) {
    set('orderItems', form.orderItems.map(i => i._key === key ? { ...i, ...patch } : i))
  }

  function handleProductSelect(key, productId) {
    if (productId === '__custom__') {
      updateItem(key, { type: 'custom', productId: '', productName: '', variantSelections: {}, bolsitasXUd: '' })
    } else {
      const prod = products.find(p => p.id === productId)
      updateItem(key, {
        type: 'product',
        productId,
        productName: prod?.name || '',
        variantSelections: {},
        bolsitasXUd: '',
        customName: '',
        customDetails: '',
      })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay fade-in">
      <div className="modal order-form-modal">
        <div className="modal-header">
          <h3>{form.id ? 'Editar pedido' : 'Nuevo pedido'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Cliente ── */}
          <div className="order-section-title">Cliente</div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre</label>
              <input
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
                placeholder="Ej: María García"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Teléfono / WhatsApp</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="Ej: 5491112345678"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          <hr className="divider" />

          {/* ── Productos ── */}
          <div className="order-section-title">Productos del pedido</div>

          <div className="order-items-table">
            {form.orderItems.map((item) => (
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

          <button type="button" className="btn btn-ghost btn-sm add-item-btn" onClick={addItem}>
            + Agregar producto
          </button>

          <hr className="divider" />

          {/* ── Entrega ── */}
          <div className="order-section-title">Fecha de entrega</div>
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
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Seleccioná la fecha</label>
                <input
                  type="date"
                  className="date-input-styled"
                  value={form.deliveryDate.value}
                  onChange={e => set('deliveryDate', { ...form.deliveryDate, value: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {form.deliveryDate.value && (
                <div className="form-group">
                  <label>Horario de entrega</label>
                  <div className="time-options">
                    {[
                      { val: '', label: 'Sin especificar', icon: '🕐' },
                      { val: 'mañana', label: 'Mañana', icon: '🌅' },
                      { val: 'tarde', label: 'Tarde', icon: '☀️' },
                      { val: 'noche', label: 'Noche', icon: '🌙' },
                    ].map(opt => (
                      <label
                        key={opt.val}
                        className={`time-opt ${(form.deliveryDate.timeOfDay || '') === opt.val ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="timeOfDay"
                          value={opt.val}
                          checked={(form.deliveryDate.timeOfDay || '') === opt.val}
                          onChange={() => set('deliveryDate', { ...form.deliveryDate, timeOfDay: opt.val })}
                        />
                        <span>{opt.icon} {opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <hr className="divider" />

          {/* ── Notas y estado ── */}
          <div className="form-group">
            <label>Notas adicionales</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Ej: Sin maní, dedicatoria especial..."
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Etiquetas</label>
            <ChipInput
              chips={form.tags || []}
              onChange={tags => set('tags', tags)}
              placeholder="urgente, adelanto pagado… Enter"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {form.id ? 'Guardar cambios' : 'Crear pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Single order item row ─────────────────────────────────────────────────────

function OrderItemRow({ item, products, onProductSelect, onUpdate, onRemove, canRemove }) {
  const selectedProduct = item.type === 'product' && item.productId
    ? products.find(p => p.id === item.productId)
    : null

  return (
    <div className="order-item-form-row card">
      <div className="order-item-form-top">
        {/* Product selector */}
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <label>Producto</label>
          <select
            value={item.type === 'custom' ? '__custom__' : item.productId}
            onChange={e => onProductSelect(e.target.value)}
          >
            <option value="">— Seleccionar —</option>
            {products.filter(p => p.active).map(p => (
              <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
            ))}
            <option value="__custom__">✏️ Personalizado</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="form-group" style={{ width: 80, marginBottom: 0 }}>
          <label>Cant.</label>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={e => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
            style={{ textAlign: 'center' }}
          />
        </div>

        {canRemove && (
          <button
            type="button"
            className="btn btn-danger btn-sm remove-item-btn"
            onClick={onRemove}
          >
            ✕
          </button>
        )}
      </div>

      {/* Custom product fields */}
      {item.type === 'custom' && (
        <div className="order-item-custom">
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>Nombre del producto personalizado</label>
            <input
              value={item.customName}
              onChange={e => onUpdate({ customName: e.target.value })}
              placeholder="Ej: Torta especial sin maní"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Detalles</label>
            <input
              value={item.customDetails}
              onChange={e => onUpdate({ customDetails: e.target.value })}
              placeholder="Ej: Crema de maracuyá, decoración floral, 8 porciones"
            />
          </div>
        </div>
      )}

      {/* Existing product variants */}
      {item.type === 'product' && selectedProduct && (
        <div className="order-item-variants">
          {selectedProduct.variants?.map(v => (
            <div key={v.name} className="form-group" style={{ marginBottom: 8 }}>
              <label>{v.name}</label>
              <select
                value={item.variantSelections?.[v.name] || ''}
                onChange={e => onUpdate({
                  variantSelections: { ...item.variantSelections, [v.name]: e.target.value }
                })}
              >
                <option value="">— {v.name} —</option>
                {v.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {selectedProduct.bolsitasXUd?.length > 0 && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Bolsitas por ud.</label>
              <select
                value={item.bolsitasXUd || ''}
                onChange={e => onUpdate({ bolsitasXUd: e.target.value })}
              >
                <option value="">— Seleccionar —</option>
                {selectedProduct.bolsitasXUd.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
