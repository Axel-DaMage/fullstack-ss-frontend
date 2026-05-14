import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const ENDPOINTS = [
  {
    category: 'Pets',
    methods: [
      { method: 'GET', path: '/pets', description: 'Listar todas las mascotas', params: null },
      { method: 'GET', path: '/pets/{id}', description: 'Obtener mascota por ID', params: { id: 'number' } },
      { method: 'POST', path: '/pets', description: 'Crear nueva mascota', params: { name: 'string', race: 'string', color: 'string', status: 'string', description: 'string' } },
      { method: 'PUT', path: '/pets/{id}', description: 'Actualizar mascota', params: { id: 'number', name: 'string', race: 'string', color: 'string', status: 'string' } },
      { method: 'DELETE', path: '/pets/{id}', description: 'Eliminar mascota', params: { id: 'number' } },
      { method: 'GET', path: '/pets/search/race/{race}', description: 'Buscar por raza', params: { race: 'string' } },
      { method: 'GET', path: '/pets/search/status/{status}', description: 'Buscar por estado', params: { status: 'string' } },
      { method: 'GET', path: '/pets/search/color/{color}', description: 'Buscar por color', params: { color: 'string' } },
      { method: 'GET', path: '/pets/totals/status', description: 'Contar por estado', params: null },
      { method: 'GET', path: '/pets/{id}/with-location', description: 'Mascota con ubicación', params: { id: 'number' } },
    ]
  },
  {
    category: 'Locations',
    methods: [
      { method: 'GET', path: '/locations', description: 'Listar todas las ubicaciones', params: null },
      { method: 'GET', path: '/locations/{id}', description: 'Obtener ubicación por ID', params: { id: 'number' } },
      { method: 'POST', path: '/locations', description: 'Crear nueva ubicación', params: { latitude: 'number', longitude: 'number', zone: 'string', petId: 'number' } },
      { method: 'PUT', path: '/locations/{id}', description: 'Actualizar ubicación', params: { id: 'number', latitude: 'number', longitude: 'number', zone: 'string' } },
      { method: 'DELETE', path: '/locations/{id}', description: 'Eliminar ubicación', params: { id: 'number' } },
      { method: 'GET', path: '/locations/search/zone/{zone}', description: 'Buscar por zona', params: { zone: 'string' } },
      { method: 'GET', path: '/locations/search/pet/{petId}', description: 'Buscar por ID mascota', params: { petId: 'number' } },
      { method: 'GET', path: '/locations/search/date-range', description: 'Buscar por rango de fechas', params: { startDate: 'date', endDate: 'date' } },
      { method: 'GET', path: '/locations/totals/zone', description: 'Contar por zona', params: null },
    ]
  },
  {
    category: 'Matches',
    methods: [
      { method: 'GET', path: '/matches', description: 'Listar todas las coincidencias', params: null },
      { method: 'GET', path: '/matches/{id}', description: 'Obtener coincidencia por ID', params: { id: 'number' } },
      { method: 'POST', path: '/matches', description: 'Crear coincidencia', params: { petLostId: 'number', petFoundId: 'number' } },
      { method: 'PUT', path: '/matches/{id}/confirm', description: 'Confirmar coincidencia', params: { id: 'number' } },
      { method: 'PUT', path: '/matches/{id}/reject', description: 'Rechazar coincidencia', params: { id: 'number' } },
      { method: 'DELETE', path: '/matches/{id}', description: 'Eliminar coincidencia', params: { id: 'number' } },
      { method: 'POST', path: '/matching/run-automatic', description: 'Ejecutar matching automático', params: null },
    ]
  },
  {
    category: 'Dashboard',
    methods: [
      { method: 'GET', path: '/dashboard', description: 'Obtener datos del dashboard', params: null },
    ]
  },
  {
    category: 'Health',
    methods: [
      { method: 'GET', path: '/health', description: 'Verificar estado del servicio', params: null },
    ]
  }
]

const METHOD_COLORS = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e',
  PATCH: '#50e3c2'
}

export function DevConsole() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pathParams, setPathParams] = useState({})
  const [bodyParams, setBodyParams] = useState({})
  const [jwtToken, setJwtToken] = useState('')
  const [useAuth, setUseAuth] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Pets')

  const handleExecute = async () => {
    if (!selectedEndpoint) return

    setLoading(true)
    setResponse(null)

    let url = API_URL + selectedEndpoint.path
    let body = null

    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value)
    })

    const headers = {
      'Content-Type': 'application/json'
    }

    if (useAuth && jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    }

    try {
      let res
      const options = { method: selectedEndpoint.method, headers }

      if (selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE') {
        const bodyData = {}
        Object.entries(bodyParams).forEach(([key, value]) => {
          if (value) bodyData[key] = value
        })
        if (Object.keys(bodyData).length > 0) {
          options.body = JSON.stringify(bodyData)
        }
      }

      res = await fetch(url, options)

      let data
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: Object.fromEntries(res.headers.entries())
      })
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Error',
        data: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEndpointClick = (endpoint) => {
    setSelectedEndpoint(endpoint)
    setResponse(null)
    setPathParams({})
    setBodyParams({})
  }

  const getSampleBody = () => {
    if (!selectedEndpoint?.params) return ''
    const sample = {}
    Object.entries(selectedEndpoint.params).forEach(([key, type]) => {
      if (type === 'string') sample[key] = 'example'
      else if (type === 'number') sample[key] = 1
      else if (type === 'date') sample[key] = '2024-01-01'
    })
    return JSON.stringify(sample, null, 2)
  }

  return (
    <div className="dev-console">
      <div className="dev-sidebar">
        <div className="dev-header">
          <h2>API Explorer</h2>
          <div className="auth-section">
            <label>
              <input
                type="checkbox"
                checked={useAuth}
                onChange={(e) => setUseAuth(e.target.checked)}
              />
              JWT Auth
            </label>
            {useAuth && (
              <input
                type="text"
                placeholder="Bearer token"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                className="jwt-input"
              />
            )}
          </div>
        </div>

        <div className="category-tabs">
          {ENDPOINTS.map(cat => (
            <button
              key={cat.category}
              className={activeCategory === cat.category ? 'active' : ''}
              onClick={() => setActiveCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <div className="endpoints-list">
          {ENDPOINTS.find(c => c.category === activeCategory)?.methods.map((ep, idx) => (
            <div
              key={idx}
              className={`endpoint-item ${selectedEndpoint === ep ? 'selected' : ''}`}
              onClick={() => handleEndpointClick(ep)}
            >
              <span
                className="method-badge"
                style={{ backgroundColor: METHOD_COLORS[ep.method] }}
              >
                {ep.method}
              </span>
              <span className="endpoint-path">{ep.path}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dev-main">
        {selectedEndpoint ? (
          <>
            <div className="endpoint-header">
              <h3>{selectedEndpoint.description}</h3>
              <span
                className="method-badge large"
                style={{ backgroundColor: METHOD_COLORS[selectedEndpoint.method] }}
              >
                {selectedEndpoint.method}
              </span>
              <code className="endpoint-url">{API_URL}{selectedEndpoint.path}</code>
            </div>

            {selectedEndpoint.params && (
              <div className="params-section">
                <h4>Parámetros</h4>
                <div className="params-grid">
                  {Object.entries(selectedEndpoint.params).map(([key, type]) => (
                    <div key={key} className="param-field">
                      <label>
                        {key}
                        {selectedEndpoint.path.includes(`{${key}}`) && <span className="path-param"> (path)</span>}
                      </label>
                      <input
                        type={type === 'number' ? 'number' : 'text'}
                        placeholder={type}
                        value={
                          selectedEndpoint.path.includes(`{${key}}`)
                            ? pathParams[key] || ''
                            : bodyParams[key] || ''
                        }
                        onChange={(e) => {
                          if (selectedEndpoint.path.includes(`{${key}}`)) {
                            setPathParams({ ...pathParams, [key]: e.target.value })
                          } else {
                            setBodyParams({ ...bodyParams, [key]: e.target.value })
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
                  <div className="body-section">
                    <h4>Request Body (JSON)</h4>
                    <textarea
                      value={getSampleBody()}
                      onChange={(e) => setBodyParams(JSON.parse(e.target.value))}
                      rows={8}
                    />
                  </div>
                )}
              </div>
            )}

            <button className="execute-btn" onClick={handleExecute} disabled={loading}>
              {loading ? 'Ejecutando...' : 'Ejecutar Request'}
            </button>

            {response && (
              <div className="response-section">
                <h4>Response</h4>
                <div className={`status-badge ${response.status >= 200 && response.status < 300 ? 'success' : 'error'}`}>
                  Status: {response.status} {response.statusText}
                </div>
                <pre className="response-body">
                  {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="no-selection">
            <h3>Selecciona un endpoint para probar</h3>
            <p>Usa el panel lateral para explorar los endpoints disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}