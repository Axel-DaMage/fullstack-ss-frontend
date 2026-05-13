import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PetsList } from './PetsList';

describe('PetsList', () => {
  const mockPets = [
    { id: 1, name: 'Rex', race: 'Pastor Alemán', color: 'Negro', size: 'Grande', status: 'LOST', description: '' },
    { id: 2, name: 'Luna', race: 'Poodle', color: 'Blanco', size: 'Pequeño', status: 'FOUND', description: '' }
  ];

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPets)
      })
    );
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza loading inicialmente', () => {
    render(<PetsList />);
    expect(screen.getByText('Cargando mascotas...')).toBeInTheDocument();
  });

  it('renderiza mascotas después de cargar', async () => {
    render(<PetsList />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando mascotas...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Rex')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('filtra mascotas cuando se presiona botón', async () => {
    render(<PetsList />);
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Perdidas'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/pets'));
  });

  it('maneja error de API', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    render(<PetsList />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });
});
