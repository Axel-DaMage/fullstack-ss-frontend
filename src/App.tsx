import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Dog, MapPin, GitMerge, 
  RefreshCw, Plus, Edit, Trash2, Check, X,
  Loader2
} from 'lucide-react';
import './components/styles.css';

type Section = 'dashboard' | 'pets' | 'matches' | 'locations';

const API_BASE = '/api';

const translateStatus = (status?: string): string => {
  switch (status) {
    case 'LOST': return 'Perdido';
    case 'FOUND': return 'Encontrado';
    case 'PENDING': return 'Pendiente';
    case 'CONFIRMED': return 'Confirmada';
    case 'REJECTED': return 'Rechazada';
    default: return status || '-';
  }
};

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'pets', label: 'Mascotas', icon: <Dog size={18} /> },
    { id: 'matches', label: 'Coincidencias', icon: <GitMerge size={18} /> },
    { id: 'locations', label: 'Ubicaciones', icon: <MapPin size={18} /> },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="app-title">Sanos y Salvos</h1>
        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={currentSection === item.id ? 'active' : ''}
              onClick={() => setCurrentSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <main className="app-content">
        {currentSection === 'dashboard' && <DashboardView baseUrl={API_BASE} />}
        {currentSection === 'pets' && <PetsView baseUrl={API_BASE} />}
        {currentSection === 'matches' && <MatchesView baseUrl={API_BASE} />}
        {currentSection === 'locations' && <LocationsView baseUrl={API_BASE} />}
      </main>
    </div>
  );
}

function DashboardView({ baseUrl }: { baseUrl: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(3000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/dashboard`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchDashboard, refreshInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refreshInterval]);

  if (loading && !data) return <div className="loading"><Loader2 className="spin" /> Cargando...</div>;

  return (
    <div className="view-container">
      <div className="view-header">
        <h2><LayoutDashboard className="section-icon" /> Panel de Control</h2>
        <div className="controls">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-actualizar
          </label>
          <select value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} disabled={!autoRefresh}>
            <option value={1000}>1 seg</option>
            <option value={2000}>2 seg</option>
            <option value={3000}>3 seg</option>
            <option value={5000}>5 seg</option>
            <option value={10000}>10 seg</option>
          </select>
          <button onClick={fetchDashboard} className="refresh-btn">
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
      </div>
      <div className="last-updated">Ultima actualizacion: {lastUpdated.toLocaleTimeString()}</div>

      {error && <div className="error-box">{error}</div>}

      <div className="stats-cards">
        <div className="stat-card lost">
          <span className="stat-icon"><Dog size={40} /></span>
          <div className="stat-content">
            <span className="stat-value">{data?.lostPets || 0}</span>
            <span className="stat-label">Mascotas Perdidas</span>
          </div>
        </div>
        <div className="stat-card found">
          <span className="stat-icon"><Dog size={40} /></span>
          <div className="stat-content">
            <span className="stat-value">{data?.foundPets || 0}</span>
            <span className="stat-label">Mascotas Encontradas</span>
          </div>
        </div>
        <div className="stat-card matches">
          <span className="stat-icon"><GitMerge size={40} /></span>
          <div className="stat-content">
            <span className="stat-value">{data?.pendingMatches || 0}</span>
            <span className="stat-label">Coincidencias Pendientes</span>
          </div>
        </div>
        <div className="stat-card locations">
          <span className="stat-icon"><MapPin size={40} /></span>
          <div className="stat-content">
            <span className="stat-value">{data?.totalLocations || 0}</span>
            <span className="stat-label">Total Ubicaciones</span>
          </div>
        </div>
      </div>

      {data?.locationsByZone && Object.keys(data.locationsByZone).length > 0 && (
        <div className="zones-section">
          <h3><MapPin className="section-icon" /> Reportes por Zona</h3>
          <div className="zones-list">
            {Object.entries(data.locationsByZone).map(([zone, count]) => (
              <div key={zone} className="zone-item">
                <span className="zone-name"><MapPin size={14} /> {zone}</span>
                <span className="zone-badge">{count} reportes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PetsView({ baseUrl }: { baseUrl: string }) {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/pets`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setPets(Array.isArray(json) ? json : json.content || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchPets, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const deletePet = async (id: number) => {
    if (!confirm('Eliminar esta mascota?')) return;
    try {
      const res = await fetch(`${baseUrl}/pets/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPets();
      else alert('Error al eliminar');
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2><Dog className="section-icon" /> Mascotas</h2>
        <div className="controls">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-actualizar
          </label>
          <button onClick={fetchPets} className="refresh-btn">
            <RefreshCw size={16} /> Actualizar
          </button>
          <button onClick={() => { setEditingPet(null); setShowForm(true); }} className="add-btn">
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {showForm && (
        <PetForm
          baseUrl={baseUrl}
          pet={editingPet}
          onClose={() => { setShowForm(false); setEditingPet(null); }}
          onSave={() => { setShowForm(false); fetchPets(); }}
        />
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Raza</th>
              <th>Color</th>
              <th>Tamano</th>
              <th>Estado</th>
              <th>Descripcion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(pet => (
              <tr key={pet.id}>
                <td>{pet.id}</td>
                <td>{pet.name || '-'}</td>
                <td>{pet.race || '-'}</td>
                <td>{pet.color || '-'}</td>
                <td>{pet.size || '-'}</td>
                <td><span className={`status-badge ${pet.status?.toLowerCase()}`}>{translateStatus(pet.status)}</span></td>
                <td>{pet.description?.substring(0, 50) || '-'}...</td>
                <td>
                  <button onClick={() => { setEditingPet(pet); setShowForm(true); }} className="edit-btn">
                    <Edit size={14} /> Editar
                  </button>
                  <button onClick={() => deletePet(pet.id)} className="delete-btn">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {pets.length === 0 && <tr><td colSpan={8}>No hay mascotas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PetForm({ baseUrl, pet, onClose, onSave }: { baseUrl: string; pet: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: pet?.name || '',
    race: pet?.race || '',
    color: pet?.color || '',
    size: pet?.size || '',
    status: pet?.status || 'LOST',
    description: pet?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = pet ? `${baseUrl}/pets/${pet.id}` : `${baseUrl}/pets`;
      const method = pet ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) onSave();
      else alert('Error al guardar');
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{pet ? 'Editar Mascota' : 'Nueva Mascota'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input type="text" placeholder="Raza" value={form.race} onChange={e => setForm({...form, race: e.target.value})} />
          </div>
          <div className="form-row">
            <input type="text" placeholder="Color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            <select value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
              <option value="">Tamano</option>
              <option value="SMALL">Pequeno</option>
              <option value="MEDIUM">Mediano</option>
              <option value="LARGE">Grande</option>
            </select>
          </div>
          <div className="form-row">
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="LOST">Perdido</option>
              <option value="FOUND">Encontrado</option>
            </select>
          </div>
          <textarea placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              <X size={16} /> Cancelar
            </button>
            <button type="submit" disabled={saving} className="save-btn">
              {saving ? <Loader2 className="spin" /> : <Check size={16} />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MatchesView({ baseUrl }: { baseUrl: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/matches`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setMatches(Array.isArray(json) ? json : json.content || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchMatches, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const confirmMatch = async (id: number) => {
    try {
      const res = await fetch(`${baseUrl}/matches/${id}/confirm`, { method: 'PUT' });
      if (res.ok) fetchMatches();
    } catch { alert('Error'); }
  };

  const rejectMatch = async (id: number) => {
    try {
      const res = await fetch(`${baseUrl}/matches/${id}/reject`, { method: 'PUT' });
      if (res.ok) fetchMatches();
    } catch { alert('Error'); }
  };

  const deleteMatch = async (id: number) => {
    if (!confirm('Eliminar esta coincidencia?')) return;
    try {
      const res = await fetch(`${baseUrl}/matches/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMatches();
    } catch { alert('Error'); }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2><GitMerge className="section-icon" /> Coincidencias</h2>
        <div className="controls">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-actualizar
          </label>
          <button onClick={fetchMatches} className="refresh-btn">
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mascota Perdida</th>
              <th>Mascota Encontrada</th>
              <th>Similitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.petLostName || m.petLostId || '-'}</td>
                <td>{m.petFoundName || m.petFoundId || '-'}</td>
                <td>{m.similarity ? `${(m.similarity * 100).toFixed(0)}%` : '-'}</td>
                <td><span className={`status-badge ${m.status?.toLowerCase() || 'pending'}`}>{translateStatus(m.status)}</span></td>
                <td>
                  {m.status === 'PENDING' && (
                    <>
                      <button onClick={() => confirmMatch(m.id)} className="confirm-btn">
                        <Check size={14} /> Confirmar
                      </button>
                      <button onClick={() => rejectMatch(m.id)} className="reject-btn">
                        <X size={14} /> Rechazar
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteMatch(m.id)} className="delete-btn">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {matches.length === 0 && <tr><td colSpan={6}>No hay coincidencias</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LocationsView({ baseUrl }: { baseUrl: string }) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/locations`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setLocations(Array.isArray(json) ? json : json.content || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLocations, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const deleteLocation = async (id: number) => {
    if (!confirm('Eliminar esta ubicacion?')) return;
    try {
      const res = await fetch(`${baseUrl}/locations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchLocations();
    } catch { alert('Error'); }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h2><MapPin className="section-icon" /> Ubicaciones</h2>
        <div className="controls">
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-actualizar
          </label>
          <button onClick={fetchLocations} className="refresh-btn">
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Zona</th>
              <th>Pet ID</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id}>
                <td>{loc.id}</td>
                <td>{loc.latitude}</td>
                <td>{loc.longitude}</td>
                <td>{loc.zone || 'Sin zona'}</td>
                <td>{loc.petId || '-'}</td>
                <td>
                  <button onClick={() => deleteLocation(loc.id)} className="delete-btn">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && <tr><td colSpan={6}>No hay ubicaciones</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;