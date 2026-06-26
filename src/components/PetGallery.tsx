import { useState, useEffect } from 'react'
import { PawPrint, MapPin, Filter, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || '/api'

const statusLabel = (s?: string) => {
  switch (s) {
    case 'PERDIDO': return 'Perdido'
    case 'ENCONTRADO': return 'Encontrado'
    default: return s || '-'
  }
}

const COLORS = ['Negro', 'Blanco', 'Marron', 'Gris', 'Dorado', 'Crema', 'Naranja', 'Atigrado', 'Tricolor', 'Otro']
const SIZES = ['PEQUENO', 'MEDIANO', 'GRANDE']

export default function PetGallery({ onBack }: { onBack: () => void }) {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ status: '', size: '', color: '' })
  const [selected, setSelected] = useState<any>(null)

  const fetchPets = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/pets`)
      if (!r.ok) throw new Error(`Error ${r.status}`)
      const json = await r.json()
      setPets(Array.isArray(json) ? json : [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPets() }, [])

  const filtered = pets.filter(p => {
    if (filters.status && p.status !== filters.status) return false
    if (filters.size && p.size !== filters.size) return false
    if (filters.color && p.color !== filters.color) return false
    return true
  })

  return (
    <div className="public-page">
      <div className="main-header">
        <h2>Mascotas reportadas</h2>
        <div className="header-actions">
          <button className="btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filtros
          </button>
          <button className="btn" onClick={fetchPets}>Actualizar</button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="form-group">
              <label>Estado</label>
              <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="">Todos</option>
                <option value="PERDIDO">Perdidos</option>
                <option value="ENCONTRADO">Encontrados</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tamaño</label>
              <select value={filters.size} onChange={e => setFilters(f => ({ ...f, size: e.target.value }))}>
                <option value="">Todos</option>
                {SIZES.map(s => <option key={s} value={s}>{s === 'PEQUENO' ? 'Pequeño' : s === 'MEDIANO' ? 'Mediano' : 'Grande'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <select value={filters.color} onChange={e => setFilters(f => ({ ...f, color: e.target.value }))}>
                <option value="">Todos</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => setFilters({ status: '', size: '', color: '' })}>
            <X size={14} /> Limpiar filtros
          </button>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Cargando mascotas...</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map(p => (
            <div key={p.id} className="pet-card" onClick={() => setSelected(p)}>
              <div className="pet-card-avatar">
                <PawPrint size={32} />
              </div>
              <div className="pet-card-info">
                <h3>{p.name || 'Sin nombre'}</h3>
                <span className="pet-card-breed">{p.race || '-'}</span>
                <div className="pet-card-meta">
                  <span className={`status-badge ${(p.status || '').toLowerCase()}`}>{statusLabel(p.status)}</span>
                  <span className="pet-card-color">{p.color}</span>
                  <span className="pet-card-size">{p.size === 'PEQUENO' ? 'Peq' : p.size === 'MEDIANO' ? 'Med' : 'Grande'}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state">No hay mascotas que coincidan con los filtros</div>}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal pet-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="pet-detail-avatar"><PawPrint size={48} /></div>
            <h3>{selected.name || 'Sin nombre'}</h3>
            <div className="pet-detail-grid">
              <div><label>Raza</label><span>{selected.race || '-'}</span></div>
              <div><label>Color</label><span>{selected.color || '-'}</span></div>
              <div><label>Tamaño</label><span>{selected.size === 'PEQUENO' ? 'Pequeño' : selected.size === 'MEDIANO' ? 'Mediano' : 'Grande'}</span></div>
              <div><label>Estado</label><span className={`status-badge ${(selected.status || '').toLowerCase()}`}>{statusLabel(selected.status)}</span></div>
            </div>
            {selected.description && <p className="pet-detail-desc">{selected.description}</p>}
            <div className="form-actions">
              <button className="btn" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
