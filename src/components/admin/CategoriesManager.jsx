import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { AdminModal, ConfirmModal } from './AdminModal'
import './CategoriesManager.css'

const emptyCategory = { name: '' }

function normalizeName(value) {
  return (value ?? '').trim()
}

export default function CategoriesManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const usageMap = useMemo(() => {
    const usage = new Map()
    products.forEach((product) => {
      const key = normalizeName(product.category).toLowerCase()
      if (!key) return
      usage.set(key, (usage.get(key) || 0) + 1)
    })
    return usage
  }, [products])

  const displayed = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  )

  function handleSave(category) {
    if (category.id) {
      updateCategory(category.id, { name: category.name })
    } else {
      addCategory({ name: category.name })
    }
    setModal(null)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Categorias</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} disponibles
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar categoria..."
            style={{ padding: '7px 12px', fontSize: '0.85rem', borderRadius: 8, border: '1.5px solid var(--lilac-mid)', background: 'rgba(255,255,255,0.8)', width: 220 }}
          />
          <button className="btn btn-primary" onClick={() => setModal({ ...emptyCategory })}>
            + Nueva categoria
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Productos asociados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  {categories.length === 0
                    ? 'No hay categorias aun. Crea la primera para usarla en productos.'
                    : 'Sin resultados para esa busqueda'}
                </td>
              </tr>
            )}

            {displayed.map((category) => {
              const usage = usageMap.get(category.name.toLowerCase()) || 0
              return (
                <tr key={category.id}>
                  <td>
                    <span className="badge badge-purple">{category.name}</span>
                  </td>
                  <td>
                    <span className={`badge ${usage > 0 ? 'badge-green' : ''}`}>
                      {usage} producto{usage !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ ...category })}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete({ ...category, usage })}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <CategoryFormModal
          initial={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar categoria"
          message={(
            <>
              Se eliminara <strong>{confirmDelete.name}</strong>.
              {confirmDelete.usage > 0 && (
                <>
                  {' '}Tambien se quitara de {confirmDelete.usage} producto{confirmDelete.usage !== 1 ? 's' : ''}.
                </>
              )}
            </>
          )}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteCategory(confirmDelete.id)
            setConfirmDelete(null)
          }}
          confirmLabel="Si, eliminar"
          tone="danger"
        />
      )}
    </div>
  )
}

function CategoryFormModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial.name || '')

  function handleSubmit(event) {
    event.preventDefault()
    const normalized = normalizeName(name)
    if (!normalized) return

    onSave({
      ...initial,
      name: normalized,
    })
  }

  return (
    <AdminModal
      title={initial.id ? 'Editar categoria' : 'Nueva categoria'}
      subtitle="Se usa en el selector de productos."
      size="compact"
      onClose={onClose}
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form="category-form" className="btn btn-primary">
            {initial.id ? 'Guardar cambios' : 'Crear categoria'}
          </button>
        </>
      )}
    >
      <form id="category-form" onSubmit={handleSubmit}>
        <section className="admin-modal-section category-modal-section">
          <div className="admin-modal-section-title">Datos de categoria</div>
          <div className="form-group category-form-group">
            <label>Nombre *</label>
            <input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              autoFocus
            />
          </div>
        </section>
      </form>
    </AdminModal>
  )
}
