import { useState } from 'react'
import { useData } from '../../context/DataContext'
import './IngredientsManager.css'

export default function IngredientsManager() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, toggleIngredientStock } = useData()
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [filter, setFilter] = useState('all') // all | inStock | outOfStock

  const outOfStock = ingredients.filter(i => !i.inStock)
  const inStock = ingredients.filter(i => i.inStock)
  const filtered = filter === 'all' ? ingredients : filter === 'inStock' ? inStock : outOfStock

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    addIngredient({ name: newName.trim(), inStock: true })
    setNewName('')
  }

  function startEdit(i) {
    setEditId(i.id)
    setEditName(i.name)
  }

  function saveEdit(id) {
    if (editName.trim()) updateIngredient(id, { name: editName.trim() })
    setEditId(null)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Ingredientes</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {inStock.length} disponibles · <span style={{ color: outOfStock.length > 0 ? '#c05050' : 'inherit' }}>
              {outOfStock.length} faltantes
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'inStock', 'outOfStock'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'inStock' ? '✓ En stock' : '✗ Faltantes'}
            </button>
          ))}
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div className="stock-alert card fade-up">
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Ingredientes faltantes:</strong>
            <span style={{ color: 'var(--text-mid)', marginLeft: 6 }}>
              {outOfStock.map(i => i.name).join(', ')}
            </span>
          </div>
        </div>
      )}

      <form className="add-ingredient-form card fade-up" onSubmit={handleAdd}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nombre del ingrediente"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary btn-sm">+ Agregar</button>
      </form>

      <div className="ingredients-list card fade-up">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            No hay ingredientes en esta categoría
          </div>
        )}
        {filtered.map(ingredient => (
          <div
            key={ingredient.id}
            className={`ingredient-row ${!ingredient.inStock ? 'out-of-stock' : ''}`}
          >
            <label className="ingredient-check">
              <input
                type="checkbox"
                checked={ingredient.inStock}
                onChange={() => toggleIngredientStock(ingredient.id)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <div className="ingredient-check-custom" />
            </label>

            <div className="ingredient-info">
              {editId === ingredient.id ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => saveEdit(ingredient.id)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(ingredient.id)}
                  autoFocus
                  style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                />
              ) : (
                <span className="ingredient-name">{ingredient.name}</span>
              )}
              <span className={`badge ${ingredient.inStock ? 'badge-green' : 'badge-red'}`}>
                {ingredient.inStock ? 'En stock' : 'Sin stock'}
              </span>
            </div>

            <div className="ingredient-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => editId === ingredient.id ? saveEdit(ingredient.id) : startEdit(ingredient)}
              >
                {editId === ingredient.id ? 'Guardar' : 'Editar'}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteIngredient(ingredient.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
