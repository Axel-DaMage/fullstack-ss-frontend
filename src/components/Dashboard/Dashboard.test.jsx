import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  const mockData = {
    lostPets: 10,
    foundPets: 5,
    pendingMatches: 3,
    totalLocations: 15,
    locationsByZone: {
      'Norte': 8,
      'Sur': 7
    }
  };

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza loading inicialmente', () => {
    render(<Dashboard />);
    expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument();
  });

  it('renderiza datos del dashboard después de cargar', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando dashboard...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renderiza zonas', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Norte')).toBeInTheDocument();
    });
    expect(screen.getByText('Sur')).toBeInTheDocument();
  });

  it('navega al hacer click en botones', async () => {
    const onNavigate = vi.fn();
    render(<Dashboard onNavigate={onNavigate} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando dashboard...')).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByText('Ver más');
    fireEvent.click(buttons[0]);
    expect(onNavigate).toHaveBeenCalled();
  });
});
