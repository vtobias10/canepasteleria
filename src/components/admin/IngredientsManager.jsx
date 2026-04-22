import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { ConfirmModal } from './AdminModal'
import './IngredientsManager.css'

export default function IngredientsManager() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, toggleIngredientStock, moveIngredient } = useData()
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const outOfStock = ingredients.filter(item => !item.inStock)
  const inStock = ingredients.filter(item => item.inStock)
  const byFilter = filter === 'all' ? ingredients : filter === 'inStock' ? inStock : outOfStock
  const filtered = byFilter.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))

  function handleAdd(event) {
    event.preventDefault()
    if (!newName.trim()) return
    addIngredient({ name: newName.trim(), inStock: true })
    setNewName('')
  }

  function startEdit(ingredient) {
    setEditId(ingredient.id)
    setEditName(ingredient.name)
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar ingrediente..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 200 }}
          />
          {['all', 'inStock', 'outOfStock'].map(value => (
            <button
              key={value}
              className={`btn btn-sm ${filter === value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'Todos' : value === 'inStock' ? '✓ En stock' : '✕ Faltantes'}
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
              {outOfStock.map(item => item.name).join(', ')}
            </span>
          </div>
        </div>
      )}

      <form className="add-ingredient-form card fade-up" onSubmit={handleAdd}>
        <input
          value={newName}
          onChange={event => setNewName(event.target.value)}
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
          <div key={ingredient.id} className={`ingredient-row ${!ingredient.inStock ? 'out-of-stock' : ''}`}>
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
                  onChange={event => setEditName(event.target.value)}
                  onBlur={() => saveEdit(ingredient.id)}
                  onKeyDown={event => event.key === 'Enter' && saveEdit(ingredient.id)}
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
                onClick={() => moveIngredient(ingredient.id, 'up')}
                disabled={ingredients.findIndex(item => item.id === ingredient.id) === 0}
                title="Mover arriba"
              >
                ↑
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => moveIngredient(ingredient.id, 'down')}
                disabled={ingredients.findIndex(item => item.id === ingredient.id) === ingredients.length - 1}
                title="Mover abajo"
              >
                ↓
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => (editId === ingredient.id ? saveEdit(ingredient.id) : startEdit(ingredient))}
              >
                {editId === ingredient.id ? 'Guardar' : 'Editar'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(ingredient)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar ingrediente?"
          message={(
            <>
              Se eliminará <strong>{confirmDelete.name}</strong> del inventario. Esta acción no se puede deshacer.
            </>
          )}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteIngredient(confirmDelete.id)
            setConfirmDelete(null)
          }}
          confirmLabel="Eliminar"
          tone="danger"
        />
      )}
    </div>
  )
}
