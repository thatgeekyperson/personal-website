import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('renders nav with aria-label="Main navigation"', () => {
    render(<Navbar />)
    // There may be multiple navs (desktop + mobile when open); at least one must exist
    const navs = screen.getAllByRole('navigation', { name: 'Main navigation' })
    expect(navs.length).toBeGreaterThan(0)
  })

  it('hamburger button has an aria-label attribute', () => {
    render(<Navbar />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('clicking hamburger shows mobile menu links', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    // Before clicking, mobile nav links may not be visible (they're hidden by CSS in jsdom
    // but the nav element itself isn't rendered yet — it's conditionally mounted)
    const button = screen.getByRole('button')
    await user.click(button)

    // After clicking, both About and Projects links should appear in the mobile nav
    const links = screen.getAllByRole('link', { name: /about/i })
    expect(links.length).toBeGreaterThan(0)
    const projectLinks = screen.getAllByRole('link', { name: /projects/i })
    expect(projectLinks.length).toBeGreaterThan(0)
  })
})
