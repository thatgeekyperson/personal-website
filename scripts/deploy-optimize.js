#!/usr/bin/env node

/**
 * Autonomous deploy-and-optimize loop for personal-website.
 *
 * Runs in GitHub Actions. For each iteration:
 *   1. Deploy to Vercel preview
 *   2. Run Lighthouse CI against the preview URL
 *   3. If any score < threshold, apply static fix playbook and retry
 *
 * No external API required. Fixes are deterministic file edits defined in
 * scripts/lighthouse-playbook.js.
 *
 * Writes GitHub Actions outputs: passed=true|false, preview_url=<url>
 * Exits non-zero if thresholds not met after MAX_ITERATIONS.
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { applyPlaybook } from './lighthouse-playbook.js'

// ── Config ────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  // CI runners score ~5 pts lower than local due to shared resource contention
  performance: 90,
  accessibility: 100,
  'best-practices': 96,
  // Vercel adds X-Robots-Tag: noindex to ALL preview URLs by design.
  // SEO is validated locally via the /optimize skill instead.
  seo: 0,
}

const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS ?? '3', 10)
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const BYPASS_SECRET = process.env.VERCEL_BYPASS_SECRET
const LHCI_DIR = '.lighthouseci'

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts })
}

function log(msg) {
  process.stdout.write(`[deploy-optimize] ${msg}\n`)
}

function setOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT
  if (file) fs.appendFileSync(file, `${key}=${value}\n`)
}

// ── Deploy ────────────────────────────────────────────────────────────────────

function deployPreview() {
  log('Deploying Vercel preview...')
  const out = run(`vercel deploy --token=${VERCEL_TOKEN} --yes 2>&1`)
  const urls = out.match(/https:\/\/[\w.-]+\.vercel\.app/g) ?? []
  if (!urls.length) throw new Error(`No deployment URL found:\n${out}`)
  const url = urls[urls.length - 1]
  log(`Preview URL: ${url}`)
  return url
}

// ── Lighthouse ────────────────────────────────────────────────────────────────

function runLighthouse(url) {
  log(`Running Lighthouse against ${url}`)

  if (fs.existsSync(LHCI_DIR)) fs.rmSync(LHCI_DIR, { recursive: true })

  const extraHeaders = BYPASS_SECRET
    ? `{"x-vercel-protection-bypass":"${BYPASS_SECRET}"}`
    : '{}'

  run(
    [
      'lhci collect',
      `--url="${url}"`,
      '--numberOfRuns=1',
      `--settings.extraHeaders='${extraHeaders}'`,
      '--settings.chromeFlags="--no-sandbox --disable-dev-shm-usage"',
      '--settings.onlyCategories=performance,accessibility,best-practices,seo',
    ].join(' '),
    { stdio: 'inherit' },
  )

  const reportFile = fs
    .readdirSync(LHCI_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('manifest'))
    .sort()
    .pop()

  if (!reportFile) throw new Error('No Lighthouse report found in ' + LHCI_DIR)

  const report = JSON.parse(fs.readFileSync(path.join(LHCI_DIR, reportFile), 'utf8'))
  const cats = report.categories

  const scores = {
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    'best-practices': Math.round(cats['best-practices'].score * 100),
    seo: Math.round(cats.seo.score * 100),
  }

  // Extract failing audit IDs for the playbook
  const failingAuditIds = Object.values(report.audits)
    .filter(a => a.score !== null && a.score !== undefined && a.score < 1)
    .map(a => a.id)

  const failingAuditsSummary = Object.values(report.audits)
    .filter(a => a.score !== null && a.score !== undefined && a.score < 1)
    .sort((a, b) => a.score - b.score)
    .slice(0, 15)
    .map(a => `  [${Math.round(a.score * 100)}] ${a.id}: ${a.title}`)

  return { scores, failingAuditIds, failingAuditsSummary }
}

function checkThresholds(scores) {
  return Object.entries(THRESHOLDS)
    .filter(([cat, min]) => scores[cat] < min)
    .map(([cat, min]) => `  ${cat}: ${scores[cat]} (need ≥ ${min})`)
}

function deployToProduction() {
  log('Deploying to production...')
  const out = run(`vercel deploy --prod --token=${VERCEL_TOKEN} --yes 2>&1`)
  const urls = out.match(/https:\/\/[\w.-]+\.vercel\.app/g) ?? []
  const prodUrl = urls[urls.length - 1] ?? '(unknown)'
  log(`✅ Production URL: ${prodUrl}`)
}

function commitIfChanged(message) {
  const status = run('git status --porcelain').trim()
  if (!status) { log('No changes to commit'); return false }
  run('git add -A')
  run(`git commit -m "${message}"`)
  log(`Committed: ${message}`)
  return true
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let previewUrl = ''
  let passed = false

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    log(`\n${'─'.repeat(60)}`)
    log(`Iteration ${i + 1} / ${MAX_ITERATIONS}`)
    log('─'.repeat(60))

    if (i > 0) {
      log('Rebuilding...')
      run('npm run build', { stdio: 'inherit' })
    }

    previewUrl = deployPreview()

    log('Waiting 15 s for Vercel to propagate...')
    await new Promise(r => setTimeout(r, 15_000))

    const { scores, failingAuditIds, failingAuditsSummary } = runLighthouse(previewUrl)
    log(`Scores: ${JSON.stringify(scores)}`)

    const failures = checkThresholds(scores)

    if (!failures.length) {
      log('✅ All Lighthouse thresholds passed!')
      passed = true
      break
    }

    log(`❌ Failing:\n${failures.join('\n')}`)
    log(`Failing audits:\n${failingAuditsSummary.join('\n')}`)

    if (i < MAX_ITERATIONS - 1) {
      log('Applying static fix playbook...')
      const fixed = applyPlaybook(failingAuditIds)
      if (fixed) {
        run('npm run build', { stdio: 'inherit' })
        commitIfChanged(`fix: lighthouse playbook attempt ${i + 1}`)
      } else {
        log('Playbook has no fixes for remaining audits — stopping early.')
        break
      }
    } else {
      log('Max iterations reached — thresholds not met.')
    }
  }

  setOutput('passed', String(passed))
  setOutput('preview_url', previewUrl)

  if (!passed) {
    log('🚫 Production deploy blocked — Lighthouse thresholds not met.')
    process.exit(1)
  }

  deployToProduction()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
