import { useState, useEffect } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard'
import { PetsList } from './components/PetsList'
import { PetCard } from './components/PetCard'
import { MatchesList } from './components/MatchesList'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [pets, setPets] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [petsRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/pets`),
        fetch(`${API_URL}/matches`)
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_URL}/pets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      setError('Error deleting pet')
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1>Sanos y Salvos</h1>
        <div className="nav-links">
          <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentView('pets')}>Mascotas</button>
          <button onClick={() => setCurrentView('matches')}>Matches</button>
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
      </main>
    </div>
  )
}

export default App