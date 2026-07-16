import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

// Create an in-memory virtual file system representation.
// Note: Variable must start with "mock" to satisfy Vitest's module mocking hoisting rules.
const mockFiles: Record<string, string> = {}

vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn((path: string) => path in mockFiles),
      readFileSync: vi.fn((path: string) => mockFiles[path] || ''),
      writeFileSync: vi.fn((path: string, content: string) => {
        mockFiles[path] = content
      })
    }
  }
})

// @ts-ignore
import { applyPlaybook } from '../../scripts/lighthouse-playbook.js'

describe('lighthouse-playbook fixes', () => {
  let stdoutSpy: any

  beforeEach(() => {
    // Clear all files from mock FS
    for (const key in mockFiles) {
      delete mockFiles[key]
    }
    // Spy on process.stdout.write to prevent cluttering console output and check logs
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('meta-description', () => {
    it('injects meta description when not already present', () => {
      mockFiles['index.html'] = '<html><head><title>Test</title></head></html>'
      
      const result = applyPlaybook(['meta-description'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<meta name="description" content="Manan Khasgiwale — software engineer specialising in data pipelines. Projects, background, and contact." />')
      expect(mockFiles['index.html']).toContain('    <meta name="description" content="Manan Khasgiwale — software engineer specialising in data pipelines. Projects, background, and contact." />\n</head>')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: meta-description'))
    })

    it('returns false when meta description is already present', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <meta name="description" content="Manan Khasgiwale — software engineer specialising in data pipelines. Projects, background, and contact." />\n  </head>\n</html>'
      
      const result = applyPlaybook(['meta-description'])
      
      expect(result).toBe(false)
    })
  })

  describe('document-title', () => {
    it('patches title when title is empty', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <title></title>\n  </head>\n</html>'
      
      const result = applyPlaybook(['document-title'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<title>Manan — Developer</title>')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: document-title'))
    })

    it('returns false when empty title tag is not found', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <title>Some Title</title>\n  </head>\n</html>'
      
      const result = applyPlaybook(['document-title'])
      
      expect(result).toBe(false)
    })
  })

  describe('html-has-lang', () => {
    it('adds lang attribute to html tag', () => {
      mockFiles['index.html'] = '<html>\n  <head></head>\n</html>'
      
      const result = applyPlaybook(['html-has-lang'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<html lang="en">')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: html-has-lang'))
    })

    it('returns false when default html tag is not found', () => {
      mockFiles['index.html'] = '<html lang="fr">\n  <head></head>\n</html>'
      
      const result = applyPlaybook(['html-has-lang'])
      
      expect(result).toBe(false)
    })
  })

  describe('is-crawlable and robots-txt', () => {
    it('creates public/robots.txt if it does not exist', () => {
      const result = applyPlaybook(['is-crawlable'])
      
      expect(result).toBe(true)
      expect(mockFiles['public/robots.txt']).toBe('User-agent: *\nAllow: /\n')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: is-crawlable'))
    })

    it('supports robots-txt alias', () => {
      const result = applyPlaybook(['robots-txt'])
      
      expect(result).toBe(true)
      expect(mockFiles['public/robots.txt']).toBe('User-agent: *\nAllow: /\n')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: robots-txt'))
    })

    it('returns false if robots.txt already exists', () => {
      mockFiles['public/robots.txt'] = 'User-agent: *\nDisallow: /private\n'
      
      const result = applyPlaybook(['is-crawlable'])
      
      expect(result).toBe(false)
      expect(mockFiles['public/robots.txt']).toBe('User-agent: *\nDisallow: /private\n')
    })
  })

  describe('font-display', () => {
    it('appends display=swap to Google Fonts URL', () => {
      mockFiles['index.html'] = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500" rel="stylesheet">'
      
      const result = applyPlaybook(['font-display'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: font-display'))
    })

    it('returns false if Google Fonts url already has display=swap', () => {
      mockFiles['index.html'] = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">'
      
      const result = applyPlaybook(['font-display'])
      
      expect(result).toBe(false)
    })

    it('returns false if no Google Fonts url is present', () => {
      mockFiles['index.html'] = '<link href="/style.css" rel="stylesheet">'
      
      const result = applyPlaybook(['font-display'])
      
      expect(result).toBe(false)
    })
  })

  describe('uses-rel-preconnect', () => {
    it('injects gstatic preconnect before googleapis preconnect', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n  </head>\n</html>'
      
      const result = applyPlaybook(['uses-rel-preconnect'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="preconnect" href="https://fonts.googleapis.com">')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: uses-rel-preconnect'))
    })

    it('returns false if gstatic preconnect is already present', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n  </head>\n</html>'
      
      const result = applyPlaybook(['uses-rel-preconnect'])
      
      expect(result).toBe(false)
    })

    it('returns false if googleapis preconnect is missing', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n  </head>\n</html>'
      
      const result = applyPlaybook(['uses-rel-preconnect'])
      
      expect(result).toBe(false)
    })
  })

  describe('scroll-padding', () => {
    it('injects scroll-padding-top below scroll-behavior: smooth', () => {
      mockFiles['src/index.css'] = 'html {\n  scroll-behavior: smooth;\n}'
      
      const result = applyPlaybook(['scroll-padding'])
      
      expect(result).toBe(true)
      expect(mockFiles['src/index.css']).toContain('scroll-behavior: smooth;\n  scroll-padding-top: 64px;')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: scroll-padding'))
    })

    it('returns false if scroll-padding-top is already present', () => {
      mockFiles['src/index.css'] = 'html {\n  scroll-behavior: smooth;\n  scroll-padding-top: 64px;\n}'
      
      const result = applyPlaybook(['scroll-padding'])
      
      expect(result).toBe(false)
    })

    it('returns false if scroll-behavior is missing', () => {
      mockFiles['src/index.css'] = 'html {\n  color: red;\n}'
      
      const result = applyPlaybook(['scroll-padding'])
      
      expect(result).toBe(false)
    })
  })

  describe('viewport', () => {
    it('injects viewport meta before head close tag', () => {
      mockFiles['index.html'] = '<html><head></head></html>'
      
      const result = applyPlaybook(['viewport'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
      expect(mockFiles['index.html']).toContain('    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n</head>')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: viewport'))
    })

    it('returns false if viewport meta is already present', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  </head>\n</html>'
      
      const result = applyPlaybook(['viewport'])
      
      expect(result).toBe(false)
    })
  })

  describe('multiple updates', () => {
    it('applies multiple fixes at once', () => {
      mockFiles['index.html'] = '<html>\n  <head>\n    <title></title>\n  </head>\n</html>'
      
      const result = applyPlaybook(['document-title', 'viewport', 'invalid-audit-id'])
      
      expect(result).toBe(true)
      expect(mockFiles['index.html']).toContain('<title>Manan — Developer</title>')
      expect(mockFiles['index.html']).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: document-title'))
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('[playbook] Fixed: viewport'))
    })
  })
})
