import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { ConfirmModal } from './AdminModal'
import './IngredientsManager.css'

function moveIdRelative(ids, draggingId, targetId, position) {
  if (!draggingId || !targetId || draggingId === targetId) return ids
  const next = [...ids]
  const from = next.indexOf(draggingId)
  if (from === -1) return ids
  next.splice(from, 1)
  const targetIndex = next.indexOf(targetId)
  if (targetIndex === -1) return ids
  const insertAt = position === 'after' ? targetIndex + 1 : targetIndex
  next.splice(insertAt, 0, draggingId)
  return next
}

export default function IngredientsManager() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, toggleIngredientStock, reorderIngredients } = useData()
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [dragIngredientId, setDragIngredientId] = useState(null)
  const [dragOverIngredientId, setDragOverIngredientId] = useState(null)
  const [dragOverPosition, setDragOverPosition] = useState(null)
  const [previewIngredientIds, setPreviewIngredientIds] = useState(null)

  const canDragReorder = filter === 'all' && search.trim() === ''
  const outOfStock = ingredients.filter(item => !item.inStock)
  const inStock = ingredients.filter(item => item.inStock)
  const orderedIngredients = canDragReorder && previewIngredientIds
    ? previewIngredientIds.map(id => ingredients.find(item => item.id === id)).filter(Boolean)
    : ingredients
  const byFilter = filter === 'all'
    ? orderedIngredients
    : filter === 'inStock'
      ? orderedIngredients.filter(item => item.inStock)
      : orderedIngredients.filter(item => !item.inStock)
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

  function handleDragStart(event, id) {
    if (!canDragReorder) return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    setDragIngredientId(id)
    setDragOverPosition(null)
    setPreviewIngredientIds(ingredients.map(item => item.id))
  }

  function handleDragOver(event, id) {
    if (!dragIngredientId || !canDragReorder) return
    event.preventDefault()
    const rowRect = event.currentTarget.getBoundingClientRect()
    const position = event.clientY >= rowRect.top + rowRect.height / 2 ? 'after' : 'before'
    if (dragOverIngredientId !== id) {
      setDragOverIngredientId(id)
    }
    if (dragOverPosition !== position) {
      setDragOverPosition(position)
    }
    setPreviewIngredientIds((prev) => {
      const base = prev || ingredients.map(item => item.id)
      return moveIdRelative(base, dragIngredientId, id, position)
    })
  }

  function handleDrop(targetId) {
    if (!dragIngredientId || !targetId || !canDragReorder) {
      setDragIngredientId(null)
      setDragOverIngredientId(null)
      setDragOverPosition(null)
      setPreviewIngredientIds(null)
      return
    }

    const currentIds = ingredients.map(item => item.id)
    const nextIds = previewIngredientIds || currentIds
    const changed = nextIds.some((id, index) => id !== currentIds[index])
    if (changed) {
      reorderIngredients(nextIds)
    }

    setDragIngredientId(null)
    setDragOverIngredientId(null)
    setDragOverPosition(null)
    setPreviewIngredientIds(null)
  }

  function handleDragEnd() {
    setDragIngredientId(null)
    setDragOverIngredientId(null)
    setDragOverPosition(null)
    setPreviewIngredientIds(null)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Ingredientes</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {inStock.length} disponibles Â· <span style={{ color: outOfStock.length > 0 ? '#c05050' : 'inherit' }}>
              {outOfStock.length} faltantes
            </span>
          </p>
          {!canDragReorder && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.76rem', marginTop: 4 }}>
              Para reordenar, usa filtro "Todos" y limpia la busqueda.
            </p>
          )}
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
              {value === 'all' ? 'Todos' : value === 'inStock' ? 'âœ“ En stock' : 'âœ• Faltantes'}
            </button>
          ))}
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div className="stock-alert card fade-up">
          <span className="alert-icon">âš ï¸</span>
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
            No hay ingredientes en esta categoria
          </div>
        )}

        {filtered.map(ingredient => (
          <div
            key={ingredient.id}
            className={`ingredient-row ${!ingredient.inStock ? 'out-of-stock' : ''} ${dragIngredientId === ingredient.id ? 'dragging' : ''} ${dragOverIngredientId === ingredient.id && dragIngredientId !== ingredient.id && dragOverPosition === 'before' ? 'drag-over-before' : ''} ${dragOverIngredientId === ingredient.id && dragIngredientId !== ingredient.id && dragOverPosition === 'after' ? 'drag-over-after' : ''}`}
            onDragOver={event => handleDragOver(event, ingredient.id)}
            onDrop={() => handleDrop(ingredient.id)}
          >
            <button
              type="button"
              className={`ingredient-drag-handle ${canDragReorder ? '' : 'disabled'}`}
              draggable={canDragReorder}
              onDragStart={event => handleDragStart(event, ingredient.id)}
              onDragEnd={handleDragEnd}
              title={canDragReorder ? 'Arrastrar para reordenar' : 'Limpia la busqueda para reordenar'}
              aria-label="Arrastrar para reordenar"
            >
              <span className="ingredient-drag-handle-icon" aria-hidden="true" />
            </button>

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
                onClick={() => (editId === ingredient.id ? saveEdit(ingredient.id) : startEdit(ingredient))}
              >
                {editId === ingredient.id ? 'Guardar' : 'Editar'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(ingredient)}>
                âœ•
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Â¿Eliminar ingrediente?"
          message={(
            <>
              Se eliminara <strong>{confirmDelete.name}</strong> del inventario. Esta accion no se puede deshacer.
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


