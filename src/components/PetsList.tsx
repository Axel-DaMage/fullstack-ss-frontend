import React, { useState, useEffect } from 'react';
import { PetCard, Pet } from './PetCard';
import { eventEmitter } from '../lib/EventEmitter';
import { Events } from '../lib/events';

export interface PetsListProps {
  apiUrl?: string;
  onPetSelect?: (pet: Pet) => void;
}

interface ApiPet {
  id: number;
  name: string;
  race: string;
  color: string;
  size: string;
  status: string;
  description: string;
  photoUrl?: string;
}

export const PetsList: React.FC<PetsListProps> = ({ apiUrl = '/api', onPetSelect }) => {
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');

  useEffect(() => {
    fetchPets();
  }, [filter]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' 
        ? `${apiUrl}/pets` 
        : `${apiUrl}/pets/search/status/${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar mascotas');
      const data = await response.json();
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta mascota?')) return;
    try {
      await fetch(`${apiUrl}/pets/${id}`, { method: 'DELETE' });
      setPets(pets.filter(p => p.id !== id));
      eventEmitter.emit(Events.PET_DELETED, { id: String(id), name: '', type: '' });
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleCreatePet = async (pet: Partial<ApiPet>) => {
    try {
      const response = await fetch(`${apiUrl}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pet)
      });
      if (!response.ok) throw new Error('Error al crear');
      const createdPet = await response.json();
      setPets([...pets, createdPet]);
      eventEmitter.emit(Events.PET_CREATED, { id: String(createdPet.id), name: createdPet.name, type: createdPet.status });
    } catch (err) {
      alert('Error al crear mascota');
    }
  };

  const handleUpdatePet = async (id: number, pet: Partial<ApiPet>) => {
    try {
      const response = await fetch(`${apiUrl}/pets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pet)
      });
      if (!response.ok) throw new Error('Error al actualizar');
      const updatedPet = await response.json();
      setPets(pets.map(p => p.id === id ? updatedPet : p));
      eventEmitter.emit(Events.PET_UPDATED, { id: String(id), name: updatedPet.name, type: updatedPet.status });
    } catch (err) {
      alert('Error al actualizar mascota');
    }
  };

  if (loading) return <div className="pets-loading">Cargando mascotas...</div>;
  if (error) return <div className="pets-error">Error: {error}</div>;

  return (
    <div className="pets-list-container">
      <div className="pets-filter">
        <button 
          className={filter === 'ALL' ? 'active' : ''} 
          onClick={() => setFilter('ALL')}
        >
          Todas
        </button>
        <button 
          className={filter === 'LOST' ? 'active' : ''} 
          onClick={() => setFilter('LOST')}
        >
          Perdidas
        </button>
        <button 
          className={filter === 'FOUND' ? 'active' : ''} 
          onClick={() => setFilter('FOUND')}
        >
          Encontradas
        </button>
      </div>
      <div className="pets-grid">
        {pets.length === 0 ? (
          <p className="pets-empty">No hay mascotas registradas</p>
        ) : (
          pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onDelete={handleDelete}
              onViewLocation={onPetSelect ? () => onPetSelect(pet) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PetsList;