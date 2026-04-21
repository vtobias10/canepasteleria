import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="site-header">
      <div className="lace-border" />
      <nav className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-icon">✿</span>
          <span>Cane Pastelería</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/carta" className={`nav-link ${pathname === '/carta' ? 'active' : ''}`}>Carta</Link>
        </div>
      </nav>
    </header>
  )
}
