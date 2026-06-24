import { useState, useEffect } from 'react'
import { BarChart3, PawPrint, Link2, MapPin, RefreshCw, Check, X, Zap } from 'lucide-react'
import './components/styles.css'

type Section = 'dashboard' | 'pets' | 'matches' | 'locations'
const API = '/api'

const statusLabel = (s?: string) => {
  switch (s) {
    case 'PERDIDO': return 'Perdido'
    case 'ENCONTRADO': return 'Encontrado'
    case 'LOST': return 'Perdido'
    case 'FOUND': return 'Encontrado'
    case 'PENDIENTE': return 'Pendiente'
    case 'CONFIRMED': return 'Confirmada'
    case 'REJECTED': return 'Rechazada'
    default: return s || '-'
  }
}

const ICON: Record<Section, React.ReactNode> = {
  dashboard: <BarChart3 size={16} />,
  pets: <PawPrint size={16} />,
  matches: <Link2 size={16} />,
  locations: <MapPin size={16} />,
}
const navItems: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pets', label: 'Mascotas' },
  { id: 'matches', label: 'Coincidencias' },
  { id: 'locations', label: 'Ubicaciones' },
]

export default function App() {
  const [section, setSection] = useState<Section>('dashboard')
  const [zoneFilter, setZoneFilter] = useState<string | null>(null)

  const goToZone = (zone: string) => {
    setZoneFilter(zone)
    setSection('locations')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Sanos y Salvos</h1>
          <div className="subtitle">API Console</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <button key={n.id} className={`nav-item${section === n.id ? ' active' : ''}`} onClick={() => { setSection(n.id); setZoneFilter(null) }}>
              <span className="nav-icon">{ICON[n.id]}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <SeedButton />
        </div>
      </aside>
      <main className="main">
        {section === 'dashboard' && <DashboardView onNavigate={goToZone} />}
        {section === 'pets' && <PetsView />}
        {section === 'matches' && <MatchesView />}
        {section === 'locations' && <LocationsView zoneFilter={zoneFilter} />}
      </main>
    </div>
  )
}

function SeedButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const seed = async () => {
    setStatus('loading')
    try {
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Luna', race: 'Labrador', color: 'Marron', size: 'GRANDE', status: 'PERDIDO', description: 'Perro perdido en el parque' }) })
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Max', race: 'Pastor Aleman', color: 'Negro', size: 'GRANDE', status: 'PERDIDO', description: 'Desaparecio en la feria' }) })
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Mia', race: 'Labrador', color: 'Marron', size: 'MEDIANO', status: 'ENCONTRADO', description: 'Encontrada en la calle' }) })
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Toby', race: 'Chihuahua', color: 'Blanco', size: 'PEQUENO', status: 'ENCONTRADO', description: 'Recogido en la plaza' }) })
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Rocky', race: 'Pastor Aleman', color: 'Negro', size: 'GRANDE', status: 'ENCONTRADO', description: 'Aparecio en la estacion de bomberos' }) })
      await fetch(`${API}/pets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Simba', race: 'Chihuahua', color: 'Blanco', size: 'PEQUENO', status: 'PERDIDO', description: 'Se escapo del departamento' }) })
      await fetch(`${API}/matches/run-automatic`, { method: 'POST' })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('idle') }
  }

  return (
    <button className="seed-btn" onClick={seed} disabled={status === 'loading'}>
      {status === 'loading' ? 'Cargando...' : status === 'done' ? <><Check size={14} /> Datos creados</> : <><RefreshCw size={14} /> Cargar datos demo</>}
    </button>
  )
}

function DashboardView({ onNavigate }: { onNavigate: (zone: string) => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(false)

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/dashboard`)
      if (!r.ok) throw new Error(`Error ${r.status}`)
      setData(await r.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  if (loading && !data) return <div className="loading">Cargando dashboard...</div>

  return (
    <>
      <div className="main-header">
        <h2>Dashboard</h2>
        <div className="header-actions">
          <label className="toggle-label"><input type="checkbox" checked={refresh} onChange={e => setRefresh(e.target.checked)} /> Auto</label>
          <button className="btn" onClick={fetchData}><RefreshIcon /> Actualizar</button>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label"><PawPrint size={14} /> Perdidas</div><div className="stat-value">{data?.lostPets ?? 0}</div></div>
        <div className="stat-card"><div className="stat-label"><PawPrint size={14} /> Encontradas</div><div className="stat-value">{data?.foundPets ?? 0}</div></div>
        <div className="stat-card"><div className="stat-label"><Link2 size={14} /> Coincidencias pendientes</div><div className="stat-value">{data?.pendingMatches ?? 0}</div></div>
        <div className="stat-card"><div className="stat-label"><MapPin size={14} /> Total ubicaciones</div><div className="stat-value">{data?.totalLocations ?? 0}</div></div>
      </div>
      {data?.locationsByZone && Object.keys(data.locationsByZone).length > 0 && (
        <div className="zones-section">
          <h3>Reportes por zona</h3>
          <div className="zones-grid">
            {Object.entries(data.locationsByZone).map(([z, c]) => (
              <div key={z} className="zone-chip" onClick={() => onNavigate(z)} style={{ cursor: 'pointer' }}><span>{z}</span><span className="zone-count">{c as number}</span></div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function PetsView() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)

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

  const del = async (id: number) => {
    if (!confirm('Eliminar esta mascota?')) return
    try { await fetch(`${API}/pets/${id}`, { method: 'DELETE' }); fetchPets() }
    catch { alert('Error') }
  }

  if (loading && pets.length === 0) return <div className="loading">Cargando mascotas...</div>

  return (
    <>
      <div className="main-header">
        <h2>Mascotas</h2>
        <div className="header-actions">
          <button className="btn" onClick={fetchPets}><RefreshIcon /> Actualizar</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>+ Nueva</button>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      {showForm && <PetForm pet={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={() => { setShowForm(false); fetchPets() }} />}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Raza</th>
              <th>Color</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name || '-'}</td>
                <td>{p.race || '-'}</td>
                <td>{p.color || '-'}</td>
                <td>{p.size || '-'}</td>
                <td><span className={`status-badge ${(p.status || '').toLowerCase()}`}>{statusLabel(p.status)}</span></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '-'}</td>
                <td>
                  <button className="btn" onClick={() => { setEditing(p); setShowForm(true) }}>Editar</button>
                  <button className="btn btn-danger" onClick={() => del(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {pets.length === 0 && <tr className="empty"><td colSpan={8}>No hay mascotas registradas</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PetForm({ pet, onClose, onSave }: { pet: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: pet?.name || '', race: pet?.race || '', color: pet?.color || '', size: pet?.size || '', status: pet?.status || 'PERDIDO', description: pet?.description || '', contactEmail: pet?.contact?.email || '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.name?.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!form.race?.trim()) newErrors.race = 'La raza es obligatoria'
    if (!form.color?.trim()) newErrors.color = 'El color es obligatorio'
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Email invalido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const url = pet ? `${API}/pets/${pet.id}` : `${API}/pets`
      const r = await fetch(url, { method: pet ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (r.ok) onSave(); else alert('Error')
    } catch { alert('Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{pet ? 'Editar mascota' : 'Nueva mascota'}</h3>
        <form onSubmit={submit} noValidate>
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />{errors.name && <span className="error">{errors.name}</span>}</div>
            <div className="form-group"><label>Raza</label><input value={form.race} onChange={e => setForm({...form, race: e.target.value})} />{errors.race && <span className="error">{errors.race}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Color</label><input value={form.color} onChange={e => setForm({...form, color: e.target.value})} />{errors.color && <span className="error">{errors.color}</span>}</div>
            <div className="form-group"><label>Tamaño</label><select value={form.size} onChange={e => setForm({...form, size: e.target.value})}><option value="">Seleccionar</option><option value="PEQUENO">Pequeño</option><option value="MEDIANO">Mediano</option><option value="GRANDE">Grande</option></select></div>
          </div>
          <div className="form-group"><label>Email de contacto</label><input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} placeholder="opcional@email.com" />{errors.contactEmail && <span className="error">{errors.contactEmail}</span>}</div>
          <div className="form-group"><label>Estado</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="PERDIDO">Perdido</option><option value="ENCONTRADO">Encontrado</option></select></div>
          <div className="form-group"><label>Descripcion</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MatchesView() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/matches`)
      if (!r.ok) throw new Error(`Error ${r.status}`)
      const json = await r.json()
      setMatches(Array.isArray(json) ? json : json.content || [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMatches() }, [])

  const confirmMatch = async (id: number) => { try { await fetch(`${API}/matches/${id}/confirm`, { method: 'PUT' }); fetchMatches() } catch { alert('Error') } }
  const rejectMatch = async (id: number) => { try { await fetch(`${API}/matches/${id}/reject`, { method: 'PUT' }); fetchMatches() } catch { alert('Error') } }
  const del = async (id: number) => { if (!window.confirm('Eliminar coincidencia?')) return; try { await fetch(`${API}/matches/${id}`, { method: 'DELETE' }); fetchMatches() } catch { alert('Error') } }
  const runAuto = async () => { try { await fetch(`${API}/matches/run-automatic`, { method: 'POST' }); fetchMatches() } catch { alert('Error') } }

  if (loading && matches.length === 0) return <div className="loading">Cargando coincidencias...</div>

  return (
    <>
      <div className="main-header">
        <h2>Coincidencias</h2>
        <div className="header-actions">
          <button className="btn" onClick={fetchMatches}><RefreshIcon /> Actualizar</button>
          <button className="btn btn-primary" onClick={runAuto}><Zap size={14} /> Matching automático</button>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mascota Perdida</th>
              <th>ID Perdido</th>
              <th>Mascota Encontrada</th>
              <th>ID Encontrado</th>
              <th>% Similitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.petLostName || '-'}</td>
                <td>{m.petLostId || '-'}</td>
                <td>{m.petFoundName || '-'}</td>
                <td>{m.petFoundId || '-'}</td>
                <td>{m.porcentajeCoincidencia != null ? `${m.porcentajeCoincidencia}%` : (m.similarity ? `${(m.similarity * 100).toFixed(0)}%` : '-')}</td>
                <td><span className={`status-badge ${(m.status || 'pendiente').toLowerCase()}`}>{statusLabel(m.status)}</span></td>
                <td>
                  {(!m.status || m.status === 'PENDIENTE') && <><button className="btn btn-success" onClick={() => confirmMatch(m.id)}><Check size={14} /> Confirmar</button><button className="btn btn-warning" onClick={() => rejectMatch(m.id)}><X size={14} /> Rechazar</button></>}
                  <button className="btn btn-danger" onClick={() => del(m.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {matches.length === 0 && <tr className="empty"><td colSpan={8}>No hay coincidencias. Usa "Matching automático" para generar.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function LocationsView({ zoneFilter }: { zoneFilter: string | null }) {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/locations`)
      if (!r.ok) throw new Error(`Error ${r.status}`)
      const json = await r.json()
      setLocations(Array.isArray(json) ? json : [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLocations() }, [])

  const del = async (id: number) => { if (!confirm('Eliminar ubicación?')) return; try { await fetch(`${API}/locations/${id}`, { method: 'DELETE' }); fetchLocations() } catch { alert('Error') } }

  const filtered = zoneFilter ? locations.filter(l => l.zone === zoneFilter) : locations

  if (loading && locations.length === 0) return <div className="loading">Cargando ubicaciones...</div>

  return (
    <>
      <div className="main-header">
        <h2>Ubicaciones{zoneFilter ? ` - ${zoneFilter}` : ''}</h2>
        <div className="header-actions">
          <button className="btn" onClick={fetchLocations}><RefreshIcon /> Actualizar</button>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Zona</th>
              <th>Mapa</th>
              <th>Pet ID</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.latitude}</td>
                <td>{l.longitude}</td>
                <td>{l.zone || 'Sin zona'}</td>
                <td><a href={`https://www.google.com/maps?q=${l.latitude},${l.longitude}`} target="_blank" rel="noopener noreferrer" className="btn btn-map"><MapPin size={14} /></a></td>
                <td>{l.petId || '-'}</td>
                <td><button className="btn btn-danger" onClick={() => del(l.id)}>Eliminar</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr className="empty"><td colSpan={7}>No hay ubicaciones{zoneFilter ? ` en ${zoneFilter}` : ''}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
}
