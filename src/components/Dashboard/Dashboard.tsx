import React, { useState, useEffect, useRef } from 'react';

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

export const Dashboard: React.FC<DashboardProps> = ({ apiUrl = '/api', onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const REFRESH_INTERVAL = 1000;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/dashboard`);
      if (!response.ok) throw new Error('Error al cargar dashboard');
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(fetchDashboard, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const renderFormatted = (d: DashboardData) => {
    return (
      <div className="formatted-view">
        <div className="stats-grid">
          <div className="stat-card lost">
            <span className="stat-icon">🐕</span>
            <span className="stat-label">Mascotas Perdidas</span>
            <span className="stat-value">{d.lostPets}</span>
          </div>
          <div className="stat-card found">
            <span className="stat-icon">🔍</span>
            <span className="stat-label">Mascotas Encontradas</span>
            <span className="stat-value">{d.foundPets}</span>
          </div>
          <div className="stat-card matches">
            <span className="stat-icon">🤝</span>
            <span className="stat-label">Coincidencias Pendientes</span>
            <span className="stat-value">{d.pendingMatches}</span>
          </div>
          <div className="stat-card locations">
            <span className="stat-icon">📍</span>
            <span className="stat-label">Total Ubicaciones</span>
            <span className="stat-value">{d.totalLocations}</span>
          </div>
        </div>
        {d.locationsByZone && Object.keys(d.locationsByZone).length > 0 && (
          <div className="zones-section">
            <h3>Reportes por Zona</h3>
            <div className="zones-list">
              {Object.entries(d.locationsByZone)
                .sort((a, b) => b[1] - a[1])
                .map(([zone, count]) => (
                  <div key={zone} className="zone-item">
                    <span className="zone-name">{zone}</span>
                    <span className="zone-badge">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="dashboard-loading">Cargando dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Panel de Control</h2>
        <div className="dashboard-controls">
          <button onClick={fetchDashboard} className="refresh-btn">Actualizar</button>
        </div>
        <div className="last-updated">
          Ultima actualizacion: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="dual-view">
        <div className="view-panel raw">
          <div className="panel-header">
            <span className="panel-title">Raw JSON</span>
          </div>
          <pre className="json-raw">
{JSON.stringify(data, null, 2)}
          </pre>
        </div>
        <div className="view-panel formatted">
          <div className="panel-header">
            <span className="panel-title">Vista Formateada</span>
          </div>
          <div className="formatted-content">
            {data && renderFormatted(data)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;