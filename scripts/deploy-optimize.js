#!/usr/bin/env node

/**
 * Reusable Lighthouse Audit & Fix Orchestrator.
 * 
 * Orchestrates: Build -> Local Preview -> Lighthouse Audit -> Fix (via scripts/lighthouse-playbook.js) -> Deploy.
 */

import { execSync, spawn } from "child_process"
import http from "http"
import fs from "fs"
import path from "path"

// -- Config (override via env) --
const THRESHOLDS = {
  performance: parseInt(process.env.LH_PERFORMANCE ?? "95", 10),
  accessibility: parseInt(process.env.LH_ACCESSIBILITY ?? "100", 10),
  "best-practices": parseInt(process.env.LH_BEST_PRACTICES ?? "96", 10),
  seo: parseInt(process.env.LH_SEO ?? "90", 10),
}

const PREVIEW_URL = process.env.LH_PREVIEW_URL ?? "http://localhost:4173"
const PREVIEW_PORT = parseInt(new URL(PREVIEW_URL).port, 10) || 80
const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS ?? "3", 10)
const LHCI_DIR = ".lighthouseci"
const FIX_SCRIPT = "scripts/lighthouse-playbook.js"

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
  const chromeFlags = "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless"
  // Lighthouse reports score: null when a category errors — exclude those runs
  // from the median rather than letting null coerce to 0.
  const medianScore = (reports, cat, label) => {
    const scores = reports
      .map(r => r.categories[cat]?.score)
      .filter(s => s !== null && s !== undefined)
      .map(s => Math.round(s * 100))
    const errored = reports.length - scores.length
    if (errored > 0) log(`⚠️  ${label}: ${errored} run(s) produced no ${cat} score (errored); using ${scores.length} valid run(s).`)
    if (!scores.length) throw new Error(`${label}: all Lighthouse runs failed to produce a ${cat} score.`)
    return median(scores)
  }
  const failingAuditIds = []

  // 1. Mobile Pass
  log(`Running Mobile Lighthouse (median of 3) against ${url}`)
  if (fs.existsSync(LHCI_DIR)) fs.rmSync(LHCI_DIR, { recursive: true })

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

  const mobileReportFiles = fs.readdirSync(LHCI_DIR).filter(f => f.endsWith(".json") && !f.includes("manifest"))
  if (!mobileReportFiles.length) throw new Error("No Mobile Lighthouse report found.")

  const mobileReports = mobileReportFiles.map(f => JSON.parse(fs.readFileSync(path.join(LHCI_DIR, f), "utf8")))
  const mobileScores = {
    performance: medianScore(mobileReports, "performance", "Mobile"),
    accessibility: medianScore(mobileReports, "accessibility", "Mobile"),
    "best-practices": medianScore(mobileReports, "best-practices", "Mobile"),
    seo: medianScore(mobileReports, "seo", "Mobile"),
  }

  for (const report of mobileReports) {
    for (const audit of Object.values(report.audits)) {
      if (audit.score !== null && audit.score < 1) {
        if (!failingAuditIds.includes(audit.id)) failingAuditIds.push(audit.id)
      }
    }
  }

  // 2. Desktop Pass
  log(`Running Desktop Lighthouse (median of 3) against ${url}`)
  if (fs.existsSync(LHCI_DIR)) fs.rmSync(LHCI_DIR, { recursive: true })

  run(
    [
      "lhci collect",
      `--url="${url}"`,
      "--numberOfRuns=3",
      `--settings.chromeFlags="${chromeFlags}"`,
      "--settings.onlyCategories=performance,accessibility,best-practices,seo",
      "--settings.preset=desktop",
    ].join(" "),
    { stdio: "inherit" }
  )

  const desktopReportFiles = fs.readdirSync(LHCI_DIR).filter(f => f.endsWith(".json") && !f.includes("manifest"))
  if (!desktopReportFiles.length) throw new Error("No Desktop Lighthouse report found.")

  const desktopReports = desktopReportFiles.map(f => JSON.parse(fs.readFileSync(path.join(LHCI_DIR, f), "utf8")))
  const desktopScores = {
    performance: medianScore(desktopReports, "performance", "Desktop"),
    accessibility: medianScore(desktopReports, "accessibility", "Desktop"),
    "best-practices": medianScore(desktopReports, "best-practices", "Desktop"),
    seo: medianScore(desktopReports, "seo", "Desktop"),
  }

  for (const report of desktopReports) {
    for (const audit of Object.values(report.audits)) {
      if (audit.score !== null && audit.score < 1) {
        if (!failingAuditIds.includes(audit.id)) failingAuditIds.push(audit.id)
      }
    }
  }

  return { mobileScores, desktopScores, failingAuditIds }
}

function checkThresholds(device, scores) {
  return Object.entries(THRESHOLDS)
    .filter(([cat, min]) => scores[cat] < min)
    .map(([cat, min]) => `  ${device} ${cat}: ${scores[cat]} (need ≥ ${min})`)
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

  if (!process.env.GITHUB_ACTIONS) {
    log(`[dry-run] Local changes detected, would commit: "${message}"`)
    return false
  }

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

    log(`Mobile Scores: ${JSON.stringify(result.mobileScores)}`)
    log(`Desktop Scores: ${JSON.stringify(result.desktopScores)}`)
    const failures = [
      ...checkThresholds("Mobile", result.mobileScores),
      ...checkThresholds("Desktop", result.desktopScores)
    ]

    if (!failures.length) {
      log("✅ Thresholds passed!")
      passed = true
      break
    }

    log(`❌ Failing:\n${failures.join("\n")}`)

    if (i < MAX_ITERATIONS - 1) {
      log("Applying fixes...")
      const auditArgs = result.failingAuditIds.map(id => `--audit ${id}`).join(" ")
      const fixOut = run(`node ${FIX_SCRIPT} ${auditArgs}`)
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