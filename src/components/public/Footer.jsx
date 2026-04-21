import { useData } from '../../context/DataContext'
import './Footer.css'

export default function Footer() {
  const { config } = useData()
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-logo">✿ {config.businessName}</span>
        <span className="footer-sep">·</span>
        {config.instagramUrl ? (
          <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-ig">
            {config.instagramHandle}
          </a>
        ) : (
          <span className="footer-ig">{config.instagramHandle}</span>
        )}
        <span className="footer-sep">·</span>
        <span className="footer-copy">Hecho con amor 🤍</span>
      </div>
    </footer>
  )
}
