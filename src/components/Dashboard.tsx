import React, { useState, useEffect } from 'react';
import { useEvent } from '../lib/useEvent';
import { Events } from '../lib/events';

export interface DashboardProps {
  apiUrl?: string;
  onNavigate?: (section: string) => void;
}

interface DashboardData {
  lostPets: number;
  foundPets: number;
  pendingMatches: number;
  totalLocations: number;
  locationsByZone?: Record<string, number>;
}

export const Dashboard: React.FC<DashboardProps> = ({ apiUrl = 'http://localhost:8081/api', onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEvent(Events.PET_CREATED, () => fetchDashboard());
  useEvent(Events.PET_UPDATED, () => fetchDashboard());
  useEvent(Events.PET_DELETED, () => fetchDashboard());
  useEvent(Events.MATCH_CREATED, () => fetchDashboard());
  useEvent(Events.MATCH_UPDATED, () => fetchDashboard());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/dashboard`);
      if (!response.ok) throw new Error('Error al cargar dashboard');
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Cargando dashboard...</div>;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Panel de Control</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card lost">
          <h3>Mascotas Perdidas</h3>
          <p className="dashboard-number">{data?.lostPets || 0}</p>
          {onNavigate && <button onClick={() => onNavigate('pets')}>Ver más</button>}
        </div>
        <div className="dashboard-card found">
          <h3>Mascotas Encontradas</h3>
          <p className="dashboard-number">{data?.foundPets || 0}</p>
          {onNavigate && <button onClick={() => onNavigate('pets')}>Ver más</button>}
        </div>
        <div className="dashboard-card matches">
          <h3>Coincidencias Pendientes</h3>
          <p className="dashboard-number">{data?.pendingMatches || 0}</p>
          {onNavigate && <button onClick={() => onNavigate('matches')}>Ver más</button>}
        </div>
        <div className="dashboard-card locations">
          <h3>Total Ubicaciones</h3>
          <p className="dashboard-number">{data?.totalLocations || 0}</p>
          {onNavigate && <button onClick={() => onNavigate('locations')}>Ver más</button>}
        </div>
      </div>
      {data?.locationsByZone && (
        <div className="dashboard-zones">
          <h3>Reportes por Zona</h3>
          <div className="zones-list">
            {Object.entries(data.locationsByZone).map(([zone, count]) => (
              <div key={zone} className="zone-item">
                <span className="zone-name">{zone}</span>
                <span className="zone-count">{count} reportes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;