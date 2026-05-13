import { useState, useEffect } from 'react';
import { Dashboard, PetsList, MatchesList } from './components';
import './components/styles.css';
import { eventEmitter } from './lib/EventEmitter';
import { Events } from './lib/events';
import { EventLogger } from './lib/EventLogger';

type Section = 'dashboard' | 'pets' | 'matches';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = (section: Section) => {
    setCurrentSection(section);
    eventEmitter.emit(Events.SECTION_CHANGED, section);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    const handlePetChange = () => handleRefresh();
    const unsub1 = eventEmitter.on(Events.PET_CREATED, handlePetChange);
    const unsub2 = eventEmitter.on(Events.PET_UPDATED, handlePetChange);
    const unsub3 = eventEmitter.on(Events.PET_DELETED, handlePetChange);
    const unsub4 = eventEmitter.on(Events.MATCH_CREATED, handlePetChange);
    return () => {
      unsub1(); unsub2(); unsub3(); unsub4();
    };
  }, []);

  const renderSection = () => {
    const key = refreshKey;
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard key={key} apiUrl="http://localhost:8081/api" onNavigate={handleNavigate} />;
      case 'pets':
        return <PetsList key={key} apiUrl="http://localhost:8081/api" />;
      case 'matches':
        return <MatchesList key={key} apiUrl="http://localhost:8081/api" />;
      default:
        return <Dashboard key={key} apiUrl="http://localhost:8081/api" onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="app-title">Sanos y Salvos</h1>
        <div className="nav-links">
          <button 
            className={currentSection === 'dashboard' ? 'active' : ''} 
            onClick={() => handleNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentSection === 'pets' ? 'active' : ''} 
            onClick={() => handleNavigate('pets')}
          >
            Mascotas
          </button>
          <button 
            className={currentSection === 'matches' ? 'active' : ''} 
            onClick={() => handleNavigate('matches')}
          >
            Coincidencias
          </button>
        </div>
      </nav>
      <main className="app-content">
        {renderSection()}
      </main>
      <EventLogger />
    </div>
  );
}

export default App;