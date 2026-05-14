import React, { useState, useEffect } from 'react';
import { eventEmitter } from '../lib/EventEmitter';
import { Events } from '../lib/events';

export interface MatchesListProps {
  apiUrl?: string;
}

interface Match {
  id: number;
  petLostId: number;
  petFoundId: number;
  matchPercentage: number;
  status: string;
  createdAt: string;
}

export const MatchesList: React.FC<MatchesListProps> = ({ apiUrl = '/api' }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/matching/matches`);
      if (!response.ok) throw new Error('Error al cargar coincidencias');
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await fetch(`${apiUrl}/matching/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' })
      });
      setMatches(matches.map(m => m.id === id ? { ...m, status: 'CONFIRMED' } : m));
    } catch (err) {
      alert('Error al confirmar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta coincidencia?')) return;
    try {
      await fetch(`${apiUrl}/matching/matches/${id}`, { method: 'DELETE' });
      setMatches(matches.filter(m => m.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const filteredMatches = filter === 'ALL' 
    ? matches 
    : matches.filter(m => m.status === filter);

  if (loading) return <div className="matches-loading">Cargando coincidencias...</div>;
  if (error) return <div className="matches-error">Error: {error}</div>;

  return (
    <div className="matches-list-container">
      <div className="matches-filter">
        <button 
          className={filter === 'ALL' ? 'active' : ''} 
          onClick={() => setFilter('ALL')}
        >
          Todas
        </button>
        <button 
          className={filter === 'PENDING' ? 'active' : ''} 
          onClick={() => setFilter('PENDING')}
        >
          Pendientes
        </button>
        <button 
          className={filter === 'CONFIRMED' ? 'active' : ''} 
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmadas
        </button>
      </div>
      <div className="matches-grid">
        {filteredMatches.length === 0 ? (
          <p className="matches-empty">No hay coincidencias</p>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="match-card">
              <div className="match-percentage">
                {match.matchPercentage}% coincidencia
              </div>
              <p>Pet Perdido ID: {match.petLostId}</p>
              <p>Pet Encontrado ID: {match.petFoundId}</p>
              <span className={`match-status ${match.status.toLowerCase()}`}>
                {match.status}
              </span>
              <div className="match-actions">
                {match.status === 'PENDING' && (
                  <button onClick={() => handleConfirm(match.id)}>Confirmar</button>
                )}
                <button onClick={() => handleDelete(match.id)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesList;