import { useMemo, useState } from 'react'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import { getEmojiText, isEmojiImage, normalizeEmojiSrc } from '../../utils/emoji'
import './ProductModal.css'

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

function formatMoney(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return `$${num.toLocaleString('es-AR')}`
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function PriceBlock({ product }) {
  const regularPrice = toNumberOrNull(product.price)
  const discountedPrice = toNumberOrNull(product.salePrice)
  const hasPrice = regularPrice !== null
  const hasSale = discountedPrice !== null && discountedPrice > 0

  if (!hasPrice && !hasSale) {
    return <div className="price-main-row"><span className="price-now">CONSULTAR PRECIO</span></div>
  }

  if (hasPrice && hasSale && discountedPrice < regularPrice) {
    return (
      <div className="price-main-row">
        <span className="price-old">{formatMoney(regularPrice)}</span>
        <span className="price-sale">{formatMoney(discountedPrice)}</span>
      </div>
    )
  }

  return <div className="price-main-row"><span className="price-now">{formatMoney(hasSale ? discountedPrice : regularPrice)}</span></div>
}

export default function ProductModal({ product, whatsappNumber, messageTexts, onClose, onAddToCart }) {
  const minQty = product.minQuantity || 1
  const [selectedVariants, setSelectedVariants] = useState({})
  const [selectedBolsitas, setSelectedBolsitas] = useState('')
  const [quantity, setQuantity] = useState(minQty)

  function handleVariant(variantName, option) {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }))
  }

  function decQty() {
    setQuantity(q => Math.max(minQty, q - 1))
  }

  const selectedData = useMemo(() => ({
    ...selectedVariants,
    ...(selectedBolsitas ? { 'Bolsitas x ud': selectedBolsitas } : {}),
  }), [selectedVariants, selectedBolsitas])

  const url = buildWhatsAppUrl(product, selectedData, quantity, whatsappNumber, messageTexts)

  return (
    <div className="modal-overlay fade-in" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="modal product-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={`Imagen de ${product.name}`}
                className="modal-product-image"
              />
            ) : isEmojiImage(product.emoji) ? (
              <img
                src={normalizeEmojiSrc(product.emoji)}
                alt={`Emoji de ${product.name}`}
                className="modal-emoji-image"
              />
            ) : (
              <span className="modal-emoji">{getEmojiText(product.emoji)}</span>
            )}
            <div>
              {product.category && (
                <span className="badge badge-purple" style={{ marginBottom: 4, display: 'inline-block' }}>
                  {product.category}
                </span>
              )}
              <h3>{product.name}</h3>
              <PriceBlock product={product} />
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-desc">{product.description}</p>

        {product.priceNote && (
          <div className="price-note-box">
            <span className="price-note-icon">✦</span>
            <span>{product.priceNote}</span>
          </div>
        )}

        {product.variants?.map(variant => (
          <div key={variant.name} className="form-group">
            <label>{variant.name}</label>
            <div className="variant-options">
              {variant.options.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`variant-opt ${selectedVariants[variant.name] === option ? 'selected' : ''}`}
                  onClick={() => handleVariant(variant.name, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        {product.bolsitasXUd?.length > 0 && (
          <div className="form-group">
            <label>Bolsitas por unidad</label>
            <div className="variant-options">
              {product.bolsitasXUd.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`variant-opt ${selectedBolsitas === option ? 'selected' : ''}`}
                  onClick={() => setSelectedBolsitas(prev => (prev === option ? '' : option))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            Cantidad
            {minQty > 1 && <span className="min-qty-note"> - Minimo {minQty}</span>}
          </label>
          <div className="qty-control">
            <button type="button" className="qty-btn" onClick={decQty}>-</button>
            <span className="qty-value">{quantity}</span>
            <button type="button" className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
        </div>

        <div className="modal-actions">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary whatsapp-btn"
            onClick={onClose}
          >
            <WaIcon /> Pedir por WhatsApp
          </a>
          {onAddToCart && (
            <button
              type="button"
              className="btn-add-to-cart"
              onClick={() => {
                onAddToCart({
                  productId: product.id,
                  productName: product.name,
                  emoji: product.emoji,
                  imageUrl: product.imageUrl,
                  price: product.price,
                  salePrice: product.salePrice,
                  quantity,
                  variantSelections: selectedVariants,
                  bolsitasXUd: selectedBolsitas,
                })
              }}
            >
              🛒 Agregar al carrito
            </button>
          )}
        </div>
        <p className="modal-note">
          {onAddToCart ? 'Pedí solo este o agregalo al carrito para pedir varios.' : 'Se abre WhatsApp con el pedido ya armado'}
        </p>
      </div>
    </div>
  )
}
