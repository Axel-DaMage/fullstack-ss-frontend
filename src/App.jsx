import { useState, useEffect } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard'
import { PetsList } from './components/PetsList'
import { PetCard } from './components/PetCard'
import { MatchesList } from './components/MatchesList'
import { DevConsole } from './components/DevConsole'
import { Login } from './components/Login'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [pets, setPets] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('jwt_token'))

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [petsRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/pets`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/matches`, { headers: getAuthHeaders() })
      ])
      const petsData = await petsRes.json()
      const matchesData = await matchesRes.json()
      setPets(petsData)
      setMatches(matchesData)
    } catch (err) {
      setError('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePet = async (pet) => {
    try {
      const res = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pet)
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      setError('Error creating pet')
    }
  }

  const handleDeletePet = async (id) => {
    try {
      const res = await fetch(`${API_URL}/pets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      setError('Error deleting pet')
    }
  }

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt_token')
    setToken(null)
    setPets([])
    setMatches([])
    setCurrentView('dashboard')
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Sanos y Salvos</h1>
        <div className="nav-links">
          <button className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>Dashboard</button>
          <button className={currentView === 'pets' ? 'active' : ''} onClick={() => setCurrentView('pets')}>Mascotas</button>
          <button className={currentView === 'matches' ? 'active' : ''} onClick={() => setCurrentView('matches')}>Coincidencias</button>
          <button className={currentView === 'devconsole' ? 'active dev-btn' : 'dev-btn'} onClick={() => setCurrentView('devconsole')}>API Explorer</button>
          <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </nav>

      <main className="main-content">
        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error">{error}</div>}

        {currentView === 'dashboard' && (
          <Dashboard 
            pets={pets}
            matches={matches}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'pets' && (
          <PetsList 
            pets={pets}
            onPetSelect={(pet) => console.log('Selected:', pet)}
          />
        )}

        {currentView === 'matches' && (
          <MatchesList matches={matches} />
        )}

        {currentView === 'devconsole' && (
          <DevConsole />
        )}
      </main>
    </div>
  )
}

export default App