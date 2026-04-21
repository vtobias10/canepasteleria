import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import ProductModal from '../components/public/ProductModal'
import './ShopPage.css'

const PRODUCTS_PER_PAGE = 4

export default function ShopPage() {
  const { products, config } = useData()
  const active = products.filter(p => p.active)

  const categories = ['Todos', ...new Set(active.map(p => p.category).filter(Boolean))]
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [page, setPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filtered = selectedCategory === 'Todos'
    ? active
    : active.filter(p => p.category === selectedCategory)

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE)
  const currentItems = filtered.slice(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE)

  function handleCategoryChange(cat) {
    setSelectedCategory(cat)
    setPage(0)
  }

  return (
    <div className="shop-outer">
      {/* Mini nav */}
      <div className="shop-topbar">
        <Link to="/" className="shop-back-btn">
          ← Inicio
        </Link>
        <img src="/logo.jpeg" alt="Cane" className="shop-logo-mini" />
      </div>

      <div className="shop-card fade-up">
        <div className="shop-card-header">
          <h2>Nuestra Carta</h2>
          <p className="shop-subtitle">Elegí tu favorito y escribinos</p>
        </div>

        {categories.length > 2 && (
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="page-indicator">
          Página {page + 1} de {totalPages || 1}
        </div>

        <div className="products-grid">
          {currentItems.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
          {currentItems.length === 0 && (
            <div className="empty-menu">
              <span>🎂</span>
              <p>No hay productos en esta categoría</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← Ant
            </button>
            <div className="page-dots">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-dot ${i === page ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                />
              ))}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Sig →
            </button>
          </div>
        )}

        <div className="shop-footer-link">
          <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          whatsappNumber={config.whatsappNumber}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

function ProductCard({ product, index, onClick }) {
  return (
    <button
      className="product-card card fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={onClick}
    >
      <div className="product-emoji">{product.emoji || '🍰'}</div>
      <div className="product-info">
        <span className="product-category badge badge-purple">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        {product.variants?.length > 0 && (
          <div className="product-variants-hint">
            {product.variants.map(v => (
              <span key={v.name} className="variant-hint">
                {v.name}: {v.options.join(' · ')}
              </span>
            ))}
          </div>
        )}
        {product.priceNote && (
          <span className="product-price-note">✦ {product.priceNote}</span>
        )}
      </div>
      <div className="product-cta">
        <span className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          Pedir por WhatsApp
        </span>
      </div>
    </button>
  )
}
