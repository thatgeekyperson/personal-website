import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />)
  })

  it('renders GitHub link', () => {
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toBeInTheDocument()
  })

  it('renders LinkedIn link', () => {
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedinLink).toBeInTheDocument()
  })

  it('GitHub link has rel="noopener noreferrer"', () => {
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('LinkedIn link has rel="noopener noreferrer"', () => {
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
