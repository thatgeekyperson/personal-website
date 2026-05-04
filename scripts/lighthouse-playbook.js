/**
 * Static Lighthouse fix playbook.
 *
 * Maps known Lighthouse audit IDs to deterministic file edits.
 * No external API required — fixes are applied directly.
 *
 * Returns true if at least one fix was applied, false otherwise.
 */

import fs from 'fs'

const INDEX_HTML = 'index.html'
const INDEX_CSS = 'src/index.css'
const ROBOTS_TXT = 'public/robots.txt'

function readFile(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '' }
function writeFile(p, content) { fs.writeFileSync(p, content, 'utf8') }
function patchFile(p, search, replace) {
  const src = readFile(p)
  if (!src.includes(search)) return false
  writeFile(p, src.replace(search, replace))
  return true
}
function injectBefore(p, anchor, injection) {
  const src = readFile(p)
  if (src.includes(injection.trim().split('\n')[0])) return false // already present
  if (!src.includes(anchor)) return false
  writeFile(p, src.replace(anchor, injection + anchor))
  return true
}

// ── Individual fix functions ──────────────────────────────────────────────────

function fixMetaDescription() {
  return injectBefore(INDEX_HTML, '</head>',
    '    <meta name="description" content="Manan Khasgiwale — software engineer specialising in data pipelines. Projects, background, and contact." />\n')
}

function fixDocumentTitle() {
  return patchFile(INDEX_HTML, '<title></title>', '<title>Manan — Developer</title>')
}

function fixHtmlLang() {
  return patchFile(INDEX_HTML, '<html>', '<html lang="en">')
}

function fixRobotsTxt() {
  if (fs.existsSync(ROBOTS_TXT)) return false
  writeFile(ROBOTS_TXT, 'User-agent: *\nAllow: /\n')
  return true
}

function fixFontDisplay() {
  // Ensure Google Fonts URL uses display=swap
  const src = readFile(INDEX_HTML)
  if (!src.includes('fonts.googleapis.com') || src.includes('display=swap')) return false
  writeFile(INDEX_HTML, src.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?([^"&]+)(?:&display=swap)?/,
    (m, p1) => `https://fonts.googleapis.com/css2?${p1}&display=swap`
  ))
  return true
}

function fixPreconnect() {
  return injectBefore(INDEX_HTML, '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    ')
}

function fixScrollPadding() {
  const src = readFile(INDEX_CSS)
  if (src.includes('scroll-padding-top')) return false
  return patchFile(INDEX_CSS,
    'scroll-behavior: smooth;',
    'scroll-behavior: smooth;\n  scroll-padding-top: 64px;')
}

function fixViewportMeta() {
  return injectBefore(INDEX_HTML, '</head>',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n')
}

// ── Playbook registry ─────────────────────────────────────────────────────────

const PLAYBOOK = {
  'meta-description':        fixMetaDescription,
  'document-title':          fixDocumentTitle,
  'html-has-lang':           fixHtmlLang,
  'is-crawlable':            fixRobotsTxt,
  'robots-txt':              fixRobotsTxt,
  'font-display':            fixFontDisplay,
  'uses-rel-preconnect':     fixPreconnect,
  'scroll-padding':          fixScrollPadding,
  'viewport':                fixViewportMeta,
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {string[]} auditIds - Lighthouse audit IDs that failed
 * @returns {boolean} true if at least one fix was applied
 */
export function applyPlaybook(auditIds) {
  let anyFixed = false
  for (const id of auditIds) {
    const fix = PLAYBOOK[id]
    if (!fix) continue
    const applied = fix()
    if (applied) {
      process.stdout.write(`[playbook] Fixed: ${id}\n`)
      anyFixed = true
    }
  }
  if (!anyFixed) process.stdout.write('[playbook] No known fixes for remaining audits — manual intervention needed.\n')
  return anyFixed
}
