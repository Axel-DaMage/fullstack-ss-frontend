import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL || '/api'

function createMarkerIcon(color: string) {
  const svgIcon = L.divIcon({
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "><svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
  return svgIcon
}

export default function InteractiveMap({ onBack, onViewPet }: { onBack: () => void; onViewPet: (petId: number) => void }) {
  const [pets, setPets] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/pets`).then(r => r.json()),
      fetch(`${API}/locations`).then(r => r.json()),
    ]).then(([petsData, locsData]) => {
      setPets(Array.isArray(petsData) ? petsData : [])
      setLocations(Array.isArray(locsData) ? locsData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || !mapRef.current || leafletMapRef.current) return
    const map = L.map(mapRef.current).setView([-33.4489, -70.6693], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    leafletMapRef.current = map

    const petMap = new Map(pets.map(p => [p.id, p]))
    const bounds: L.LatLngBoundsExpression[] = []

    locations.forEach(loc => {
      if (!loc.latitude || !loc.longitude) return
      const pet = petMap.get(loc.petId)
      const isLost = pet?.status === 'PERDIDO' || pet?.status === 'LOST'
      const color = isLost ? '#d32f2f' : '#2e7d32'
      const marker = L.marker([loc.latitude, loc.longitude], { icon: createMarkerIcon(color) })
      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px;">
          <strong style="font-size: 15px;">${pet?.name || 'Mascota'}</strong><br/>
          <span style="color: ${color}; font-weight: 600; font-size: 12px; text-transform: uppercase;">
            ${isLost ? 'Perdido' : 'Encontrado'}
          </span><br/>
          <span style="font-size: 13px; color: #666;">${pet?.race || ''} ${pet?.color || ''}</span><br/>
          <span style="font-size: 12px; color: #999;">${loc.zone || ''}</span><br/>
          <button onclick="window.__viewPet(${pet?.id})" style="
            margin-top: 8px; padding: 4px 12px;
            background: ${color}; color: white;
            border: none; border-radius: 4px;
            cursor: pointer; font-size: 12px;
          ">Ver más</button>
        </div>
      `)
      marker.addTo(map)
      bounds.push([loc.latitude, loc.longitude])
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => { map.remove(); leafletMapRef.current = null }
  }, [loading, pets, locations])

  useEffect(() => {
    (window as any).__viewPet = (id: number) => onViewPet(id)
    return () => { delete (window as any).__viewPet }
  }, [onViewPet])

  if (loading) return <div className="loading">Cargando mapa...</div>

  return (
    <div className="public-page radar-page">
      <div className="main-header">
        <h2>Radar de mascotas</h2>
        <div className="header-actions">
          <button className="btn" onClick={onBack}>Volver</button>
        </div>
      </div>
      <div className="radar-legend">
        <div className="legend-item"><span className="legend-dot legend-lost" /> Perdido</div>
        <div className="legend-item"><span className="legend-dot legend-found" /> Encontrado</div>
      </div>
      <div ref={mapRef} className="radar-map" />
    </div>
  )
}
