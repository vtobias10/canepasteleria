import { useState } from 'react'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import './ProductModal.css'

export default function ProductModal({ product, whatsappNumber, onClose }) {
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

  const url = buildWhatsAppUrl(
    product,
    {
      ...selectedVariants,
      ...(selectedBolsitas ? { 'Bolsitas x ud': selectedBolsitas } : {}),
    },
    quantity,
    whatsappNumber
  )

  return (
    <div className="modal-overlay fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal product-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-emoji">{product.emoji || '🍰'}</span>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 4, display: 'inline-block' }}>
                {product.category}
              </span>
              <h3>{product.name}</h3>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-desc">{product.description}</p>

        {/* Price / presentation note */}
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
              {variant.options.map(opt => (
                <button
                  key={opt}
                  className={`variant-opt ${selectedVariants[variant.name] === opt ? 'selected' : ''}`}
                  onClick={() => handleVariant(variant.name, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {product.bolsitasXUd?.length > 0 && (
          <div className="form-group">
            <label>Bolsitas por unidad</label>
            <div className="variant-options">
              {product.bolsitasXUd.map(opt => (
                <button
                  key={opt}
                  className={`variant-opt ${selectedBolsitas === opt ? 'selected' : ''}`}
                  onClick={() => setSelectedBolsitas(prev => prev === opt ? '' : opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            Cantidad
            {minQty > 1 && (
              <span className="min-qty-note"> — Mínimo {minQty} unidades</span>
            )}
          </label>
          <div className="qty-control">
            <button className="qty-btn" onClick={decQty}>−</button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary whatsapp-btn"
          onClick={onClose}
        >
          💬 Pedir por WhatsApp
        </a>
        <p className="modal-note">Se abrirá WhatsApp con el mensaje listo para enviar</p>
      </div>
    </div>
  )
}
