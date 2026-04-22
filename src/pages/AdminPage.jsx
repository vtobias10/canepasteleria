import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../context/DataContext'
import AdminLogin from '../components/admin/AdminLogin'
import ProductsManager from '../components/admin/ProductsManager'
import CategoriesManager from '../components/admin/CategoriesManager'
import IngredientsManager from '../components/admin/IngredientsManager'
import OrdersManager from '../components/admin/OrdersManager'
import ConfigManager from '../components/admin/ConfigManager'
import './AdminPage.css'

const CREDENTIALS = { user: 'cynthia', pass: 'taeraezb1' }

const HamburgerIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="0" y1="2" x2="20" y2="2" />
    <line x1="0" y1="8" x2="20" y2="8" />
    <line x1="0" y1="14" x2="20" y2="14" />
  </svg>
)

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cane_admin') === '1')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
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

  function closeNav() { setSidebarOpen(false) }

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="admin-wrapper">
      {/* Mobile top bar */}
      <header className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menú">
          <HamburgerIcon />
        </button>
        <span className="admin-mobile-title">Cane Pastelería</span>
        <img src={config.logoUrl || '/logo.jpeg'} alt="Cane" className="admin-brand-logo" style={{ width: 30, height: 30, marginLeft: 'auto' }} />
      </header>

      {/* Overlay backdrop */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={closeNav} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src={config.logoUrl || '/logo.jpeg'} alt="Cane" className="admin-brand-logo" />
          <div>
            <span className="admin-brand-name">Cane</span>
            <span className="admin-brand-sub">Panel Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/canepasteleria-admin/productos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeNav}>
            <span>🎂</span> Productos
          </NavLink>
          <NavLink to="/canepasteleria-admin/categorias" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeNav}>
            <span>🏷️</span> Categorías
          </NavLink>
          <NavLink to="/canepasteleria-admin/ingredientes" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeNav}>
            <span>🥚</span> Ingredientes
          </NavLink>
          <NavLink to="/canepasteleria-admin/pedidos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeNav}>
            <span>📋</span> Pedidos
          </NavLink>
          <NavLink to="/canepasteleria-admin/configuracion" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={closeNav}>
            <span>⚙️</span> Configuración
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link" onClick={closeNav}>
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
            <Route path="categorias" element={<CategoriesManager />} />
            <Route path="ingredientes" element={<IngredientsManager />} />
            <Route path="pedidos" element={<OrdersManager />} />
            <Route path="configuracion" element={<ConfigManager />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
