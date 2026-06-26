import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PublicHome from './PublicHome'

describe('PublicHome', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = vi.fn()
  })

  it('deberia renderizar el hero con titulo y subtitulo', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    render(<PublicHome onNavigate={mockNavigate} />)
    expect(screen.getByText('Sanos y Salvos')).toBeInTheDocument()
    expect(screen.getByText('Ayudamos a que las mascotas perdidas vuelvan a casa')).toBeInTheDocument()
  })

  it('deberia tener botones para reportar mascota', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    render(<PublicHome onNavigate={mockNavigate} />)
    expect(screen.getByText('Perdí a mi mascota')).toBeInTheDocument()
    expect(screen.getByText('Encontré una mascota')).toBeInTheDocument()
  })

  it('deberia mostrar las estadisticas cuando se cargan', async () => {
    const stats = { foundPets: 5, lostPets: 3, totalLocations: 10 }
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(stats) })
    render(<PublicHome onNavigate={mockNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })
    const metricValues = screen.getAllByText('3')
    expect(metricValues.length).toBeGreaterThanOrEqual(1)
  })

  it('deberia mostrar los pasos de como funciona', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    render(<PublicHome onNavigate={mockNavigate} />)
    expect(screen.getByText('Reporta')).toBeInTheDocument()
    expect(screen.getByText('Comparte')).toBeInTheDocument()
    expect(screen.getByText('Reencuentra')).toBeInTheDocument()
  })

  it('deberia llamar fetch con /api/dashboard', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    render(<PublicHome onNavigate={mockNavigate} />)
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/dashboard')
  })
})
