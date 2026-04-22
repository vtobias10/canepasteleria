import { useCart } from '../../context/CartContext'
import { buildCartWhatsAppUrl } from '../../utils/whatsapp'
import { getEmojiText, isEmojiImage, normalizeEmojiSrc } from '../../utils/emoji'
import './CartDrawer.css'

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function CartDrawer({ isOpen, onClose, whatsappNumber, cartMessageTexts }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount } = useCart()

  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.salePrice) || Number(item.price) || 0
    return sum + price * item.quantity
  }, 0)
  const hasTotal = total > 0

  const waUrl = cartCount > 0
    ? buildCartWhatsAppUrl(cartItems, whatsappNumber, cartMessageTexts)
    : '#'

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="Carrito de compras">
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <span className="cart-drawer-icon">🛒</span>
            <h3>Tu pedido</h3>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🎂</span>
              <p>Tu carrito está vacío</p>
              <span className="cart-empty-sub">Agregá productos desde la carta</span>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(item => {
                const variantEntries = Object.entries(item.variantSelections || {}).filter(([, v]) => v)
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-media">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="cart-item-img" />
                      ) : isEmojiImage(item.emoji) ? (
                        <img src={normalizeEmojiSrc(item.emoji)} alt="" className="cart-item-emoji-img" />
                      ) : (
                        <span className="cart-item-emoji">{getEmojiText(item.emoji) || '🎂'}</span>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.productName}</span>
                      {variantEntries.map(([k, v]) => (
                        <span key={k} className="cart-item-variant">{k}: {v}</span>
                      ))}
                      {item.bolsitasXUd && (
                        <span className="cart-item-variant">Bolsitas: {item.bolsitasXUd}</span>
                      )}
                      {(Number(item.salePrice) || Number(item.price)) > 0 && (
                        <span className="cart-item-price">
                          ${((Number(item.salePrice) || Number(item.price)) * item.quantity).toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty">
                        <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} aria-label="Quitar">✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {hasTotal && (
              <div className="cart-total">
                <span>Total estimado</span>
                <strong>${total.toLocaleString('es-AR')}</strong>
              </div>
            )}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cart-wa-btn"
              onClick={onClose}
            >
              <WaIcon /> Pedir todo por WhatsApp
            </a>
            <button className="cart-clear-btn" onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
