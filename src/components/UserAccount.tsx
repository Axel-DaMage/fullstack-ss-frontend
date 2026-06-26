import { useState, useEffect } from 'react'
import { PawPrint, Edit3, Trash2, Check, X, User } from 'lucide-react'

const API = '/api'

const statusLabel = (s?: string) => {
  switch (s) {
    case 'PERDIDO': return 'Perdido'
    case 'ENCONTRADO': return 'Encontrado'
    default: return s || '-'
  }
}

export default function UserAccount({ onBack }: { onBack: () => void }) {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'login' | 'list'>('login')

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

  useEffect(() => {
    const savedId = localStorage.getItem('ss_user_id')
    if (savedId) {
      setUserId(savedId)
      setViewMode('list')
      fetchPets()
    }
  }, [])

  const login = () => {
    if (!userId.trim()) return
    localStorage.setItem('ss_user_id', userId.trim())
    setViewMode('list')
    fetchPets()
  }

  const logout = () => {
    localStorage.removeItem('ss_user_id')
    setUserId('')
    setViewMode('login')
    setPets([])
  }

  // Filter pets by userId (contactEmail matches or stored ID matches)
  const myPets = pets.filter(p => p.contactEmail === userId || p.contactName === userId)

  const updateStatus = async (id: number, status: string) => {
    try {
      const pet = pets.find(p => p.id === id)
      if (!pet) return
      const r = await fetch(`${API}/pets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pet, status }),
      })
      if (r.ok) fetchPets()
      else alert('Error al actualizar')
    } catch { alert('Error') }
  }

  const del = async (id: number) => {
    if (!confirm('¿Eliminar este reporte?')) return
    try {
      await fetch(`${API}/pets/${id}`, { method: 'DELETE' })
      fetchPets()
    } catch { alert('Error') }
  }

  const saveEdit = async () => {
    if (!editingId || !editForm) return
    setSaving(true)
    try {
      const r = await fetch(`${API}/pets/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (r.ok) { setEditingId(null); setEditForm(null); fetchPets() }
      else alert('Error al guardar')
    } catch { alert('Error') }
    finally { setSaving(false) }
  }

  if (viewMode === 'login') {
    return (
      <div className="public-page">
        <div className="user-login-container">
          <div className="user-login-icon"><User size={48} /></div>
          <h2>Mi Cuenta</h2>
          <p>Ingresa tu correo o nombre para ver tus reportes</p>
          <div className="form-group">
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="correo@ejemplo.cl o tu nombre"
              onKeyDown={e => e.key === 'Enter' && login()}
            />
          </div>
          <button className="btn btn-primary" onClick={login} disabled={!userId.trim()}>
            Ver mis reportes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="public-page">
      <div className="main-header">
        <h2>Mis Reportes</h2>
        <div className="header-actions">
          <span className="user-badge"><User size={14} /> {userId}</span>
          <button className="btn" onClick={fetchPets}>Actualizar</button>
          <button className="btn btn-danger" onClick={logout}>Salir</button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">Cargando reportes...</div>
      ) : (
        <div className="my-reports-list">
          {myPets.length === 0 ? (
            <div className="empty-state">No tienes reportes activos. ¡Reporta tu primera mascota!</div>
          ) : (
            myPets.map(p => (
              <div key={p.id} className="report-card">
                <div className="report-card-header">
                  <div className="report-card-avatar"><PawPrint size={24} /></div>
                  <div className="report-card-info">
                    <h4>{p.name || 'Sin nombre'}</h4>
                    <span className="pet-card-breed">{p.race || '-'} - {p.color || '-'}</span>
                  </div>
                  <span className={`status-badge ${(p.status || '').toLowerCase()}`}>{statusLabel(p.status)}</span>
                </div>

                {editingId === p.id ? (
                  <div className="report-card-edit">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input value={editForm?.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select value={editForm?.status || 'PERDIDO'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                          <option value="PERDIDO">Perdido</option>
                          <option value="ENCONTRADO">Encontrado</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea value={editForm?.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                    </div>
                    <div className="form-actions">
                      <button className="btn" onClick={() => setEditingId(null)}><X size={14} /> Cancelar</button>
                      <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                        <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="report-card-actions">
                    <button className="btn" onClick={() => { setEditingId(p.id); setEditForm({ ...p }) }}>
                      <Edit3 size={14} /> Editar
                    </button>
                    <button className="btn btn-success" onClick={() => updateStatus(p.id, 'ENCONTRADO')} disabled={p.status === 'ENCONTRADO'}>
                      <Check size={14} /> Ya apareció
                    </button>
                    <button className="btn btn-danger" onClick={() => del(p.id)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
