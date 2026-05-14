import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('App', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Simulate a logged-in user
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'jwt_token') return 'fake-jwt-token-for-testing';
      return null;
    });

    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
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

  it('navega a la sección de mascotas al hacer click', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mascotas'));
    expect(await screen.findByText('Cargando mascotas...')).toBeInTheDocument();
  });

  it('navega a la sección de coincidencias al hacer click', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Coincidencias'));
    expect(await screen.findByText('Cargando coincidencias...')).toBeInTheDocument();
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

  it('renderiza el componente Dashboard por defecto', async () => {
    render(<App />);
    expect(await screen.findByText('Panel de Control')).toBeInTheDocument();
  });

  it('muestra el botón de cerrar sesión', () => {
    render(<App />);
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('muestra login cuando no hay token', () => {
    localStorageMock.getItem.mockImplementation(() => null);
    render(<App />);
    expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument();
  });
});