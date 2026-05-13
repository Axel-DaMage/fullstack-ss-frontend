import React from 'react';

export interface Pet {
  id: number;
  name: string;
  race: string;
  color: string;
  size: string;
  status: string;
  description: string;
  photoUrl?: string;
}

export interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
  onViewLocation?: (petId: number) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete, onViewLocation }) => {
  const statusClass = pet.status === 'LOST' ? 'pet-card-lost' : 'pet-card-found';

  return (
    <div className={`pet-card ${statusClass}`}>
      {pet.photoUrl && (
        <img src={pet.photoUrl} alt={pet.name} className="pet-card-image" />
      )}
      <div className="pet-card-content">
        <h3 className="pet-card-name">{pet.name}</h3>
        <p className="pet-card-status">
          <span className={`status-badge ${pet.status.toLowerCase()}`}>
            {pet.status}
          </span>
        </p>
        <div className="pet-card-details">
          <p><strong>Raza:</strong> {pet.race || 'No especificada'}</p>
          <p><strong>Color:</strong> {pet.color || 'No especificado'}</p>
          <p><strong>Tamaño:</strong> {pet.size || 'No especificado'}</p>
        </div>
        {pet.description && (
          <p className="pet-card-description">{pet.description}</p>
        )}
        <div className="pet-card-actions">
          {onEdit && <button onClick={() => onEdit(pet)}>Editar</button>}
          {onDelete && <button onClick={() => onDelete(pet.id)}>Eliminar</button>}
          {onViewLocation && <button onClick={() => onViewLocation(pet.id)}>Ver Ubicación</button>}
        </div>
      </div>
    </div>
  );
};

export default PetCard;