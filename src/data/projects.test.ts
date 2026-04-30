import { projects } from '@/data/projects'

describe('projects data', () => {
  it('each project has non-empty id', () => {
    projects.forEach((project) => {
      expect(project.id).toBeTruthy()
      expect(project.id.length).toBeGreaterThan(0)
    })
  })

  it('each project has non-empty title', () => {
    projects.forEach((project) => {
      expect(project.title).toBeTruthy()
      expect(project.title.length).toBeGreaterThan(0)
    })
  })

  it('each project has non-empty description', () => {
    projects.forEach((project) => {
      expect(project.description).toBeTruthy()
      expect(project.description.length).toBeGreaterThan(0)
    })
  })

  it('each project has non-empty githubUrl', () => {
    projects.forEach((project) => {
      expect(project.githubUrl).toBeTruthy()
      expect(project.githubUrl.length).toBeGreaterThan(0)
    })
  })

  it('each githubUrl starts with "https://github.com/"', () => {
    projects.forEach((project) => {
      expect(project.githubUrl).toMatch(/^https:\/\/github\.com\//)
    })
  })

  it('all ids are unique', () => {
    const ids = projects.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
