import { useState, useEffect, useRef } from 'react'
import { MapPin, PawPrint, Send, ArrowLeft, CheckCircle } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API = '/api'

const COLORS = ['Negro', 'Blanco', 'Marron', 'Gris', 'Dorado', 'Crema', 'Naranja', 'Atigrado', 'Tricolor', 'Otro']
const SIZES = ['PEQUENO', 'MEDIANO', 'GRANDE']
const SPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hamster', 'Otro']
const BREEDS: Record<string, string[]> = {
  Perro: ['Labrador', 'Pastor Aleman', 'Golden Retriever', 'Chihuahua', 'Bulldog', 'Poodle', 'Beagle', 'Mestizo', 'Otro'],
  Gato: ['Siames', 'Persa', 'Bengali', 'Angora', 'Comun Europeo', 'Mestizo', 'Otro'],
  Conejo: ['Holandes', 'Rex', 'Enano', 'Otro'],
  Ave: ['Perico', 'Canario', 'Loro', 'Otro'],
  Hamster: ['Sirio', 'Ruso', 'Otro'],
  Otro: ['Otro'],
}

function createDefaultMarkerIcon() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

const statusHeroConfig: Record<string, { title: string; subtitle: string; gradient: string }> = {
  PERDIDO: { title: 'Reportar mascota perdida', subtitle: 'Ayúdanos a encontrar a tu mascota', gradient: 'linear-gradient(135deg, #d32f2f, #b71c1c)' },
  ENCONTRADO: { title: 'Reportar mascota encontrada', subtitle: 'Ayuda a que esta mascota vuelva a casa', gradient: 'linear-gradient(135deg, #2e7d32, #1b5e20)' },
}

export default function ReportForm({
  initialStatus,
  onBack,
  onSaved,
}: {
  initialStatus?: string
  onBack: () => void
  onSaved: () => void
}) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    color: '',
    size: 'MEDIANO',
    status: initialStatus || 'PERDIDO',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  })
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const leafletMapRef = useRef<L.Map | null>(null)

  const breeds = BREEDS[form.species] || ['Otro']

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  useEffect(() => {
    if (step !== 3 || !mapRef.current || leafletMapRef.current) return
    const map = L.map(mapRef.current).setView([-33.4489, -70.6693], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    leafletMapRef.current = map

    map.on('click', (e: L.LeafletMouseEvent) => {
      setLat(e.latlng.lat)
      setLng(e.latlng.lng)
      if (markerRef.current) markerRef.current.remove()
      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], { icon: createDefaultMarkerIcon() }).addTo(map)
    })

    return () => { map.remove(); leafletMapRef.current = null }
  }, [step])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lat || !lng) { setError('Debes marcar la ubicación en el mapa'); return }
    setSaving(true); setError(null)
    try {
      const petRes = await fetch(`${API}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          especie: form.species,
          race: form.breed,
          color: form.color,
          size: form.size,
          status: form.status,
          description: form.description,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
        }),
      })
      if (!petRes.ok) throw new Error('Error al crear reporte')
      const pet = await petRes.json()
      await fetch(`${API}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: pet.id, latitude: lat, longitude: lng, zone: 'No especificada' }),
      })
      setDone(true)
      setTimeout(() => onSaved(), 2000)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const heroCfg = statusHeroConfig[form.status] || statusHeroConfig.PERDIDO

  if (done) {
    return (
      <div className="public-page">
        <div className="report-form-container">
          <div className="report-success-card">
            <CheckCircle size={48} />
            <h2>¡Reporte creado con éxito!</h2>
            <p>Gracias por ayudar. Pronto redirigiremos al inicio.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-page">
      <div className="report-form-container">
        <div className="report-hero" style={{ background: heroCfg.gradient }}>
          <button className="report-hero-back" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
          <h2>{heroCfg.title}</h2>
          <p>{heroCfg.subtitle}</p>
        </div>

        <div className="steps-bar">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}><span>1</span> Datos</div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}><span>2</span> Detalles</div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}><span>3</span> Ubicación</div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {step === 1 && (
          <div className="report-step-card">
            <h3><PawPrint size={18} /> Información de la mascota</h3>
            <div className="form-group">
              <label>Nombre de la mascota</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Luna" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Especie</label>
                <select value={form.species} onChange={e => { set('species', e.target.value); set('breed', '') }}>
                  {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Raza</label>
                <select value={form.breed} onChange={e => set('breed', e.target.value)}>
                  <option value="">Seleccionar</option>
                  {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Color principal</label>
                <select value={form.color} onChange={e => set('color', e.target.value)}>
                  <option value="">Seleccionar</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tamaño</label>
                <select value={form.size} onChange={e => set('size', e.target.value)}>
                  {SIZES.map(s => <option key={s} value={s}>{s === 'PEQUENO' ? 'Pequeño' : s === 'MEDIANO' ? 'Mediano' : 'Grande'}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="report-btn report-btn-primary" onClick={() => setStep(2)} disabled={!form.name || !form.breed || !form.color}>
                Siguiente <PawPrint size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="report-step-card">
            <h3><MapPin size={18} /> Descripción y contacto</h3>
            <div className="form-group">
              <label>Descripción adicional</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Señas particulares, última vez visto, etc." />
            </div>
            <div className="form-group">
              <label>Tu nombre</label>
              <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Opcional" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+56 9 XXXX XXXX" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="correo@ejemplo.cl" />
              </div>
            </div>
            <div className="form-actions">
              <button className="report-btn" onClick={() => setStep(1)}>Atrás</button>
              <button className="report-btn report-btn-primary" onClick={() => setStep(3)}>
                Siguiente <MapPin size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="report-step-card">
            <h3><MapPin size={18} /> Marca la ubicación</h3>
            <p className="form-hint">Haz clic en el mapa donde viste por última vez a la mascota</p>
            {lat && lng && <p className="form-coords">Ubicación: {lat.toFixed(4)}, {lng.toFixed(4)}</p>}
            <div ref={mapRef} className="report-map" />
            <div className="form-actions">
              <button className="report-btn" onClick={() => setStep(2)}>Atrás</button>
              <button className="report-btn report-btn-primary" onClick={submit} disabled={saving || !lat || !lng}>
                <Send size={16} /> {saving ? 'Guardando...' : 'Publicar reporte'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
