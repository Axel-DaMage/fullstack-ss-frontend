import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetCard } from './PetCard';

describe('PetCard', () => {
  const mockPet = {
    id: 1,
    name: 'Firulais',
    race: 'Labrador',
    color: 'Dorado',
    size: 'Grande',
    status: 'LOST',
    description: 'Perro muy amigable',
    photoUrl: 'https://example.com/photo.jpg'
  };

  it('renderiza el nombre de la mascota', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Firulais')).toBeInTheDocument();
  });

  it('renderiza la raza de la mascota', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Labrador')).toBeInTheDocument();
  });

  it('renderiza el color de la mascota', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Dorado')).toBeInTheDocument();
  });

  it('renderiza el tamaño de la mascota', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Grande')).toBeInTheDocument();
  });

  it('renderiza el estado de la mascota', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('LOST')).toBeInTheDocument();
  });

  it('renderiza la descripción si existe', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.getByText('Perro muy amigable')).toBeInTheDocument();
  });

  it('no renderiza descripción si no existe', () => {
    const petWithoutDescription = { ...mockPet, description: undefined };
    render(<PetCard pet={petWithoutDescription} />);
    expect(screen.queryByText('Perro muy amigable')).not.toBeInTheDocument();
  });

  it('llama a onEdit cuando se presiona el botón editar', () => {
    const onEdit = vi.fn();
    render(<PetCard pet={mockPet} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Editar'));
    expect(onEdit).toHaveBeenCalledWith(mockPet);
  });

  it('llama a onDelete cuando se presiona el botón eliminar', () => {
    const onDelete = vi.fn();
    render(<PetCard pet={mockPet} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('llama a onViewLocation cuando se presiona el botón ver ubicación', () => {
    const onViewLocation = vi.fn();
    render(<PetCard pet={mockPet} onViewLocation={onViewLocation} />);
    fireEvent.click(screen.getByText('Ver Ubicación'));
    expect(onViewLocation).toHaveBeenCalledWith(1);
  });

  it('no muestra botones si no se pasan los handlers', () => {
    render(<PetCard pet={mockPet} />);
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    expect(screen.queryByText('Ver Ubicación')).not.toBeInTheDocument();
  });

  it('renderiza la imagen cuando photoUrl existe', () => {
    render(<PetCard pet={mockPet} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Firulais');
  });

  it('aplica clase correcta para estado LOST', () => {
    const { container } = render(<PetCard pet={mockPet} />);
    expect(container.querySelector('.pet-card')).toHaveClass('pet-card-lost');
  });

  it('aplica clase correcta para estado FOUND', () => {
    const petFound = { ...mockPet, status: 'FOUND' };
    const { container } = render(<PetCard pet={petFound} />);
    expect(container.querySelector('.pet-card')).toHaveClass('pet-card-found');
  });
});