import { useState, useEffect } from 'react'
import { PawPrint, Search, MapPin, Heart } from 'lucide-react'

const API = '/api'

export default function PublicHome({ onNavigate }: { onNavigate: (section: string, data?: any) => void }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="public-home">
      <section className="hero">
        <div className="hero-content">
          <h1>Sanos y Salvos</h1>
          <p className="hero-subtitle">Ayudamos a que las mascotas perdidas vuelvan a casa</p>
          <div className="hero-actions">
            <button className="hero-btn hero-btn-lost" onClick={() => onNavigate('report', { status: 'PERDIDO' })}>
              <PawPrint size={32} />
              <span className="hero-btn-label">Perdí a mi mascota</span>
              <span className="hero-btn-desc">Reporta una mascota perdida</span>
            </button>
            <button className="hero-btn hero-btn-found" onClick={() => onNavigate('report', { status: 'ENCONTRADO' })}>
              <Search size={32} />
              <span className="hero-btn-label">Encontré una mascota</span>
              <span className="hero-btn-desc">Reporta una mascota encontrada</span>
            </button>
          </div>
        </div>
      </section>

      {!loading && stats && (
        <section className="metrics-section">
          <h2>Nuestra comunidad</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon metric-icon-found"><Heart size={24} /></div>
              <div className="metric-value">{stats.foundPets ?? 0}</div>
              <div className="metric-label">Mascotas encontradas</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon metric-icon-lost"><PawPrint size={24} /></div>
              <div className="metric-value">{stats.lostPets ?? 0}</div>
              <div className="metric-label">Mascotas perdidas</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon metric-icon-match"><Heart size={24} /></div>
              <div className="metric-value">{stats.totalLocations ?? 0}</div>
              <div className="metric-label">Reportes totales</div>
            </div>
          </div>
        </section>
      )}

      <section className="how-it-works">
        <h2>¿Cómo funciona?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Reporta</h3>
            <p>Cuéntanos qué pasó y dónde fue la última vez que viste a la mascota</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Comparte</h3>
            <p>Tu reporte aparecerá en nuestro radar para que otros lo vean</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Reencuentra</h3>
            <p>Cuando alguien encuentre a tu mascota, te notificaremos para reunirlos</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <button className="hero-btn hero-btn-lost" onClick={() => onNavigate('gallery')}>
          <MapPin size={24} />
          <span>Ver mascotas reportadas</span>
        </button>
      </section>
    </div>
  )
}
