import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PetGallery from './PetGallery'

describe('PetGallery', () => {
  const mockBack = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = vi.fn()
  })

  it('deberia mostrar estado de carga inicialmente', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    render(<PetGallery onBack={mockBack} />)
    expect(screen.getByText('Cargando mascotas...')).toBeInTheDocument()
  })

  it('deberia mostrar mascotas cuando se cargan', async () => {
    const pets = [
      { id: 1, name: 'Firulais', race: 'Beagle', status: 'PERDIDO', color: 'Marron', size: 'MEDIANO' },
      { id: 2, name: 'Mishi', race: 'Siames', status: 'ENCONTRADO', color: 'Gris', size: 'PEQUENO' }
    ]
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(pets) })
    render(<PetGallery onBack={mockBack} />)
    await waitFor(() => {
      expect(screen.getByText('Firulais')).toBeInTheDocument()
      expect(screen.getByText('Mishi')).toBeInTheDocument()
    })
    expect(screen.getByText('Beagle')).toBeInTheDocument()
    expect(screen.getByText('Siames')).toBeInTheDocument()
  })

  it('deberia mostrar estado vacio cuando no hay mascotas', async () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    render(<PetGallery onBack={mockBack} />)
    await waitFor(() => {
      expect(screen.getByText('No hay mascotas que coincidan con los filtros')).toBeInTheDocument()
    })
  })

  it('deberia llamar fetch con /api/pets', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    render(<PetGallery onBack={mockBack} />)
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/pets')
  })

  it('deberia mostrar error cuando falla la peticion', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Error de red'))
    render(<PetGallery onBack={mockBack} />)
    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument()
    })
  })

  it('deberia mostrar boton de filtros', () => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    render(<PetGallery onBack={mockBack} />)
    expect(screen.getByText('Filtros')).toBeInTheDocument()
  })
})
