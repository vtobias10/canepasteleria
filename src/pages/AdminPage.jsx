import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import AdminLogin from '../components/admin/AdminLogin'
import ProductsManager from '../components/admin/ProductsManager'
import IngredientsManager from '../components/admin/IngredientsManager'
import OrdersManager from '../components/admin/OrdersManager'
import ConfigManager from '../components/admin/ConfigManager'
import './AdminPage.css'

const CREDENTIALS = { user: 'cynthia', pass: 'taeraezb1' }

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cane_admin') === '1')
  const navigate = useNavigate()
  const { config } = useData()

  function handleLogin(user, pass) {
    if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
      sessionStorage.setItem('cane_admin', '1')
      setAuthed(true)
      navigate('/canepasteleria-admin/productos')
      return true
    }
    return false
  }

  function handleLogout() {
    sessionStorage.removeItem('cane_admin')
    setAuthed(false)
  }

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={config.logoUrl || '/logo.jpeg'} alt="Cane" className="admin-brand-logo" />
          <div>
            <span className="admin-brand-name">Cane</span>
            <span className="admin-brand-sub">Panel Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/canepasteleria-admin/productos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span>🎂</span> Productos
          </NavLink>
          <NavLink to="/canepasteleria-admin/ingredientes" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span>🥚</span> Ingredientes
          </NavLink>
          <NavLink to="/canepasteleria-admin/pedidos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span>📋</span> Pedidos
          </NavLink>
          <NavLink to="/canepasteleria-admin/configuracion" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span>⚙️</span> Configuración
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
            <span>🌐</span> Ver sitio
          </a>
          <button className="admin-nav-link logout-btn" onClick={handleLogout}>
            <span>↩</span> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Routes>
            <Route index element={<Navigate to="productos" />} />
            <Route path="productos" element={<ProductsManager />} />
            <Route path="ingredientes" element={<IngredientsManager />} />
            <Route path="pedidos" element={<OrdersManager />} />
            <Route path="configuracion" element={<ConfigManager />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
