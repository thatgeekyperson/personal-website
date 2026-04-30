import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

describe('Hero', () => {
  beforeEach(() => {
    render(<Hero />)
  })

  it('renders an h1 element', () => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders "View Projects" link with href="#projects"', () => {
    const link = screen.getByRole('link', { name: /view projects/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })

  it('renders Contact link with href starting with "mailto:"', () => {
    const link = screen.getByRole('link', { name: /contact/i })
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toMatch(/^mailto:/)
  })
})
