import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el título de la aplicación', () => {
    render(<App />);
    expect(screen.getByText('Sanos y Salvos')).toBeInTheDocument();
  });

  it('renderiza los botones de navegación', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mascotas')).toBeInTheDocument();
    expect(screen.getByText('Coincidencias')).toBeInTheDocument();
  });

  it('navega a la sección de mascotas al hacer click', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mascotas'));
    expect(screen.getByText('Cargando mascotas...')).toBeInTheDocument();
  });

  it('navega a la sección de coincidencias al hacer click', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Coincidencias'));
    expect(screen.getByText('Cargando coincidencias...')).toBeInTheDocument();
  });

  it('el botón de dashboard está activo por defecto', () => {
    render(<App />);
    const dashboardBtn = screen.getByText('Dashboard');
    expect(dashboardBtn.closest('button')).toHaveClass('active');
  });

  it('cambia la clase active al navegar', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Mascotas'));
    const petsBtn = screen.getByText('Mascotas');
    expect(petsBtn.closest('button')).toHaveClass('active');
  });

  it('renderiza el componente Dashboard por defecto', () => {
    render(<App />);
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
  });
});