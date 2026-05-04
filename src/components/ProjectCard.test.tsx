import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/data/projects'

const mockProject: Project = {
  id: 'test-project',
  title: 'Test Project',
  description: 'A project used for testing purposes.',
  techStack: ['React', 'TypeScript'],
  githubUrl: 'https://github.com/test-org/test-project',
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument()
  })

  it('GitHub link has target="_blank" and rel="noopener noreferrer"', () => {
    render(<ProjectCard project={mockProject} />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does NOT render live demo link when liveUrl is undefined', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.queryByRole('link', { name: /live demo/i })).not.toBeInTheDocument()
  })

  it('renders live demo link when liveUrl is provided', () => {
    const projectWithLive: Project = { ...mockProject, liveUrl: 'https://example.com' }
    render(<ProjectCard project={projectWithLive} />)
    const liveLink = screen.getByRole('link', { name: /live demo/i })
    expect(liveLink).toBeInTheDocument()
    expect(liveLink).toHaveAttribute('href', 'https://example.com')
    expect(liveLink).toHaveAttribute('target', '_blank')
    expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
