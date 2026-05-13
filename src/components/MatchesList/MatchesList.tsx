import React, { useState, useEffect } from 'react';

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

export const MatchesList: React.FC<MatchesListProps> = ({ apiUrl = 'http://localhost:8081/api' }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/matches`);
      if (!response.ok) throw new Error('Error al cargar matches');
      let data = await response.json();
      if (filter !== 'ALL') {
        data = data.filter((m: Match) => m.status === filter);
      }
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await fetch(`${apiUrl}/matches/${id}/confirm`, { method: 'PUT' });
      setMatches(matches.map(m => m.id === id ? { ...m, status: 'CONFIRMED' } : m));
    } catch (err) {
      alert('Error al confirmar');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await fetch(`${apiUrl}/matches/${id}/reject`, { method: 'PUT' });
      setMatches(matches.map(m => m.id === id ? { ...m, status: 'REJECTED' } : m));
    } catch (err) {
      alert('Error al rechazar');
    }
  };

  const runAutomaticMatching = async () => {
    try {
      await fetch(`${apiUrl}/matching/run-automatic`, { method: 'POST' });
      fetchMatches();
      alert('Matching automático ejecutado');
    } catch (err) {
      alert('Error al ejecutar matching');
    }
  };

  if (loading) return <div className="matches-loading">Cargando coincidencias...</div>;

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h2>Coincidencias</h2>
        <button className="btn-auto-match" onClick={runAutomaticMatching}>
          Ejecutar Matching Automático
        </button>
      </div>
      <div className="matches-filter">
        <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>Todas</button>
        <button className={filter === 'PENDING' ? 'active' : ''} onClick={() => setFilter('PENDING')}>Pendientes</button>
        <button className={filter === 'CONFIRMED' ? 'active' : ''} onClick={() => setFilter('CONFIRMED')}>Confirmadas</button>
        <button className={filter === 'REJECTED' ? 'active' : ''} onClick={() => setFilter('REJECTED')}>Rechazadas</button>
      </div>
      <div className="matches-list">
        {matches.length === 0 ? (
          <p className="matches-empty">No hay coincidencias</p>
        ) : (
          matches.map(match => (
            <div key={match.id} className={`match-card status-${match.status.toLowerCase()}`}>
              <div className="match-info">
                <p><strong>ID:</strong> {match.id}</p>
                <p><strong>Pet Perdido:</strong> {match.petLostId}</p>
                <p><strong>Pet Encontrado:</strong> {match.petFoundId}</p>
                <p><strong>Coincidencia:</strong> {match.matchPercentage}%</p>
                <p><strong>Fecha:</strong> {new Date(match.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="match-actions">
                <span className={`status-badge ${match.status.toLowerCase()}`}>{match.status}</span>
                {match.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleConfirm(match.id)}>Confirmar</button>
                    <button onClick={() => handleReject(match.id)}>Rechazar</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchesList;