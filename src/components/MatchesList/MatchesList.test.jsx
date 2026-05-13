import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MatchesList } from './MatchesList';

describe('MatchesList', () => {
  const mockMatches = [
    { id: 1, petLostId: 10, petFoundId: 20, matchPercentage: 90, status: 'PENDING', createdAt: '2023-10-01T10:00:00Z' },
    { id: 2, petLostId: 11, petFoundId: 21, matchPercentage: 85, status: 'CONFIRMED', createdAt: '2023-10-02T10:00:00Z' }
  ];

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMatches)
      })
    );
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza loading inicialmente', () => {
    render(<MatchesList />);
    expect(screen.getByText('Cargando coincidencias...')).toBeInTheDocument();
  });

  it('renderiza coincidencias después de cargar', async () => {
    render(<MatchesList />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando coincidencias...')).not.toBeInTheDocument();
    });
    
    expect(screen.getAllByText(/ID:/i, { selector: 'strong' })[0]).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('filtra coincidencias cuando se presiona botón', async () => {
    render(<MatchesList />);
    await waitFor(() => {
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirmadas'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/matches'));
  });

  it('llama a run-automatic al hacer click', async () => {
    render(<MatchesList />);
    await waitFor(() => {
      expect(screen.getByText('Ejecutar Matching Automático')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ejecutar Matching Automático'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/matching/run-automatic'), expect.objectContaining({ method: 'POST' }));
  });

  it('confirma coincidencia', async () => {
    render(<MatchesList />);
    await waitFor(() => {
      expect(screen.getByText('Confirmar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirmar'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/matches/1/confirm'), expect.objectContaining({ method: 'PUT' }));
  });

  it('rechaza coincidencia', async () => {
    render(<MatchesList />);
    await waitFor(() => {
      expect(screen.getByText('Rechazar')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Rechazar'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/matches/1/reject'), expect.objectContaining({ method: 'PUT' }));
  });
});
