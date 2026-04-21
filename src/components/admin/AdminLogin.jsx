import { useState } from 'react'
import './AdminLogin.css'

export default function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const ok = onLogin(user, pass)
    if (!ok) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="login-page">
      <div className="lace-border" />
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
                onChange={e => { setUser(e.target.value); setError(false) }}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setError(false) }}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="login-error">Usuario o contraseña incorrectos</p>
            )}
            <button type="submit" className="btn btn-primary login-btn">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
