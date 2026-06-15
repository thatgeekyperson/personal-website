#!/usr/bin/env node

/**
 * Reusable Lighthouse Audit & Fix Orchestrator.
 * 
 * Orchestrates: Build -> Local Preview -> Lighthouse Audit -> Fix (via python utility) -> Deploy.
 */

import { execSync, spawn } from "child_process"
import http from "http"
import fs from "fs"
import path from "path"

// -- Config (override via env) --
const THRESHOLDS = {
  performance: parseInt(process.env.LH_PERFORMANCE ?? "80", 10),
  accessibility: parseInt(process.env.LH_ACCESSIBILITY ?? "90", 10),
  "best-practices": parseInt(process.env.LH_BEST_PRACTICES ?? "90", 10),
  seo: parseInt(process.env.LH_SEO ?? "80", 10),
}

const PREVIEW_URL = process.env.LH_PREVIEW_URL ?? "http://localhost:4173"
const PREVIEW_PORT = parseInt(new URL(PREVIEW_URL).port, 10) || 80
const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS ?? "3", 10)
const LHCI_DIR = ".lighthouseci"
const FIX_SCRIPT = ".github/scripts/lighthouse-fix.py"

// -- Helpers --
function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: "pipe", ...opts })
}

function log(msg) {
  process.stdout.write(`[orchestrator] ${msg}\n`)
}

function setOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT
  if (file) fs.appendFileSync(file, `${key}=${value}\n`)
}

function median(nums) {
  const sorted = nums.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

// -- Preview Server --
function serveLocal() {
  log(`Starting local preview server on :${PREVIEW_PORT}...`)
  return spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
    stdio: "ignore",
  })
}

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, res => {
        res.destroy()
        log(`Server responding on ${url}`)
        resolve()
      })
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Server did not start within ${timeoutMs}ms: ${url}`))
        else setTimeout(attempt, 1000)
      })
    }
    attempt()
  })
}

// -- Lighthouse --
function runLighthouse(url) {
  log(`Running Lighthouse (median of 3) against ${url}`)

  if (fs.existsSync(LHCI_DIR)) fs.rmSync(LHCI_DIR, { recursive: true })

  // Use --chrome-flags to bypass potential interstitials and sandbox issues
  const chromeFlags = "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless"

  run(
    [
      "lhci collect",
      `--url="${url}"`,
      "--numberOfRuns=3",
      `--settings.chromeFlags="${chromeFlags}"`,
      "--settings.onlyCategories=performance,accessibility,best-practices,seo",
    ].join(" "),
    { stdio: "inherit" }
  )

  const reportFiles = fs.readdirSync(LHCI_DIR).filter(f => f.endsWith(".json") && !f.includes("manifest"))
  if (!reportFiles.length) throw new Error("No Lighthouse report found.")

  const reports = reportFiles.map(f => JSON.parse(fs.readFileSync(path.join(LHCI_DIR, f), "utf8")))
  const catScore = (r, cat) => Math.round(r.categories[cat].score * 100)
  
  const scores = {
    performance: median(reports.map(r => catScore(r, "performance"))),
    accessibility: median(reports.map(r => catScore(r, "accessibility"))),
    "best-practices": median(reports.map(r => catScore(r, "best-practices"))),
    seo: median(reports.map(r => catScore(r, "seo"))),
  }

  const failingAuditIds = []
  for (const report of reports) {
    for (const audit of Object.values(report.audits)) {
      if (audit.score !== null && audit.score < 1) {
        if (!failingAuditIds.includes(audit.id)) failingAuditIds.push(audit.id)
      }
    }
  }

  return { scores, failingAuditIds }
}

function checkThresholds(scores) {
  return Object.entries(THRESHOLDS)
    .filter(([cat, min]) => scores[cat] < min)
    .map(([cat, min]) => `  ${cat}: ${scores[cat]} (need ≥ ${min})`)
}

// -- Deployment --
function deployToProduction() {
  if (!process.env.VERCEL_TOKEN) {
    log("VERCEL_TOKEN missing. Skipping deploy.")
    return
  }
  log("Deploying to production via Vercel...")
  const out = run("vercel deploy --prod --token \"$VERCEL_TOKEN\" --yes 2>&1")
  const urls = out.match(/https:\/\/[\w.-]+\.vercel\.app/g) ?? []
  log(`✅ Production URL: ${urls[urls.length - 1] ?? "(unknown)"}`)
}

function commitIfChanged(message) {
  const status = run("git status --porcelain").trim()
  if (!status) return false
  run("git add .")
  run(`git commit -m "${message}"`)
  run("git push origin HEAD")
  log(`Committed: ${message}`)
  return true
}

// -- Main --
async function main() {
  let passed = false

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    log(`\nIteration ${i + 1} / ${MAX_ITERATIONS}`)

    if (i > 0) {
      log("Rebuilding...")
      run("npm run build", { stdio: "inherit" })
    }

    const server = serveLocal()
    let result
    try {
      await waitForServer(PREVIEW_URL)
      result = runLighthouse(PREVIEW_URL)
    } finally {
      server.kill("SIGTERM")
    }

    log(`Scores: ${JSON.stringify(result.scores)}`)
    const failures = checkThresholds(result.scores)

    if (!failures.length) {
      log("✅ Thresholds passed!")
      passed = true
      break
    }

    log(`❌ Failing:\n${failures.join("\n")}`)

    if (i < MAX_ITERATIONS - 1) {
      log("Applying fixes...")
      // Call the python script for each failing audit
      const auditArgs = result.failingAuditIds.map(id => `--audit ${id}`).join(" ")
      const fixOut = run(`python3 ${FIX_SCRIPT} ${auditArgs}`)
      log(fixOut)
      
      if (fixOut.includes("[playbook] Fixed:")) {
        commitIfChanged(`fix: lighthouse audit iteration ${i + 1}`)
      } else {
        log("No fixes applied by playbook.")
        break
      }
    }
  }

  setOutput("passed", String(passed))
  if (!passed) {
    log("🚫 Deployment blocked.")
    process.exit(1)
  }

  if (process.env.SKIP_DEPLOY) {
    log("SKIP_DEPLOY set.")
    return
  }

  deployToProduction()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})