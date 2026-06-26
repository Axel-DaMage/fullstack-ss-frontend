import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deberia renderizar el titulo Sanos y Salvos al menos una vez', () => {
    render(<App />)
    expect(screen.getAllByText('Sanos y Salvos').length).toBeGreaterThanOrEqual(1)
  })

  it('deberia mostrar el subtitulo Plataforma por defecto', () => {
    render(<App />)
    expect(screen.getAllByText('Plataforma').length).toBeGreaterThanOrEqual(1)
  })

  it('deberia mostrar las secciones de navegacion principales', () => {
    render(<App />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Galería')).toBeInTheDocument()
    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(screen.getByText('Mi Cuenta')).toBeInTheDocument()
  })

  it('deberia mostrar las secciones de Admin', () => {
    render(<App />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Mascotas')).toBeInTheDocument()
    expect(screen.getByText('Coincidencias')).toBeInTheDocument()
    expect(screen.getByText('Ubicaciones')).toBeInTheDocument()
  })

  it('deberia mostrar PublicHome por defecto con el hero subtitle', () => {
    render(<App />)
    expect(screen.getByText('Ayudamos a que las mascotas perdidas vuelvan a casa')).toBeInTheDocument()
  })

  it('deberia tener el boton de Seed con texto Cargar datos demo', () => {
    render(<App />)
    expect(screen.getByText('Cargar datos demo')).toBeInTheDocument()
  })
})
