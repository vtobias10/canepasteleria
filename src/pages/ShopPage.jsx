import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import ProductModal from '../components/public/ProductModal'
import { getEmojiText, isEmojiImage, normalizeEmojiSrc } from '../utils/emoji'
import './ShopPage.css'

const PRODUCTS_PER_PAGE = 9

const WaIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

function formatMoney(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return `$${number.toLocaleString('es-AR')}`
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function ProductPrice({ product }) {
  const regularPrice = toNumberOrNull(product.price)
  const discountedPrice = toNumberOrNull(product.salePrice)
  const hasPrice = regularPrice !== null
  const hasSale = discountedPrice !== null && discountedPrice > 0

  if (!hasPrice && !hasSale) {
    return null
  }

  if (hasPrice && hasSale && discountedPrice < regularPrice) {
    return (
      <span className="product-price-line">
        <span className="product-price-old">{formatMoney(regularPrice)}</span>
        <span className="product-price-sale">{formatMoney(discountedPrice)}</span>
      </span>
    )
  }

  return <span className="product-price-line"><span className="product-price-sale">{formatMoney(hasSale ? discountedPrice : regularPrice)}</span></span>
}

export default function ShopPage() {
  const { products, config } = useData()
  const activeProducts = products.filter(product => product.active)

  const categories = ['Todos', ...new Set(activeProducts.map(product => product.category).filter(Boolean))]
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [page, setPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredProducts = selectedCategory === 'Todos'
    ? activeProducts
    : activeProducts.filter(product => product.category === selectedCategory)

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const currentItems = filteredProducts.slice(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE)

  function handleCategoryChange(category) {
    setSelectedCategory(category)
    setPage(0)
  }

  return (
    <div className="shop-outer">
      <div className="shop-topbar">
        <Link to="/" className="shop-back-btn">
          ← Inicio
        </Link>
        <img src={config.logoUrl || '/logo.jpeg'} alt="Cane" className="shop-logo-mini" />
      </div>

      <div className="shop-card fade-up">
        <div className="shop-card-header">
          <h2>Nuestra Carta</h2>
          <p className="shop-subtitle">Elegi tu favorito y mira el detalle en el modal</p>
        </div>

        {categories.length > 2 && (
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="page-indicator">
          Pagina {page + 1} de {totalPages || 1}
        </div>

        <div className="products-grid">
          {currentItems.map((product, index) => (
            <button
              key={product.id}
              className="product-card fade-up"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="product-card-inner">
                <div className="product-emoji-circle">
                  {isEmojiImage(product.emoji) ? (
                    <img
                      src={normalizeEmojiSrc(product.emoji)}
                      alt={`Emoji de ${product.name}`}
                      className="product-emoji-image"
                    />
                  ) : (
                    <span className="product-emoji">{getEmojiText(product.emoji)}</span>
                  )}
                </div>
                <h3 className="product-name">{product.name}</h3>
                {product.category && <span className="product-category-min">{product.category}</span>}
                <ProductPrice product={product} />
                <span className="product-open-detail">Ver detalle <span aria-hidden="true">→</span></span>
              </div>
            </button>
          ))}

          {currentItems.length === 0 && (
            <div className="empty-menu">
              <span>🎂</span>
              <p>No hay productos en esta categoria</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              ← Ant
            </button>
            <div className="page-dots">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  className={`page-dot ${idx === page ? 'active' : ''}`}
                  onClick={() => setPage(idx)}
                />
              ))}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page === totalPages - 1}
            >
              Sig →
            </button>
          </div>
        )}

        <div className="shop-footer-link">
          <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp-sm">
            <WaIcon /> Pedido personalizado
          </a>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          whatsappNumber={config.whatsappNumber}
          messageTexts={config.orderMessageTexts}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
