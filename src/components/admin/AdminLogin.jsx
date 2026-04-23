import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AdminLogin.css'

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-6 10-6c2.3 0 4.2.7 5.8 1.7" />
    <path d="M22 12s-3.6 6-10 6c-2.3 0-4.2-.7-5.8-1.7" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </svg>
)

export default function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const ok = onLogin(user, pass)
    if (!ok) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container fade-up">
        <div className={`login-card card ${shake ? 'shake' : ''}`}>
          <div className="login-brand">
            <span className="login-icon">✿</span>
            <h2>Cane Pastelería</h2>
            <p>Panel de Administración</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Usuario</label>
              <input
                type="text"
                value={user}
                onChange={event => { setUser(event.target.value); setError(false) }}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="password-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={event => { setPass(event.target.value); setError(false) }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPass(prev => !prev)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <p className="login-error">Usuario o contraseña incorrectos</p>}

            <button type="submit" className="btn btn-primary login-btn">
              Ingresar
            </button>

            <Link to="/" className="login-back-link">
              ← Volver al sitio
            </Link>
          </form>
          <div className="hachitec-watermark">✦ Desarrollado por <strong>hachitec</strong></div>
        </div>
      </div>
    </div>
  )
}
