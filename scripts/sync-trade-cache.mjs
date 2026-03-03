#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Minimal UN Comtrade trade-cache importer.
 *
 * Usage:
 * 1) Export CSV from UN Comtrade for HS 7108 (non-monetary gold), grouped by reporter country.
 *    Required columns: iso2, imports_usd, exports_usd
 * 2) Run:
 *    node scripts/sync-trade-cache.mjs ./path/to/file.csv
 */

const [, , inputPathArg] = process.argv

if (!inputPathArg) {
  console.error('Usage: node scripts/sync-trade-cache.mjs ./trade.csv')
  process.exit(1)
}

const inputPath = path.resolve(process.cwd(), inputPathArg)
const outPath = path.resolve(process.cwd(), 'gold-data/trade-cache.json')

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const row = {}
    headers.forEach((header, i) => {
      row[header] = cols[i]
    })
    return row
  })
}

const toNumber = (value) => {
  if (!value) return null
  const n = Number(String(value).replace(/[$,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

const main = async () => {
  const raw = await fs.readFile(inputPath, 'utf8')
  const rows = parseCsv(raw)

  const trade_usd_by_iso2 = {}

  for (const row of rows) {
    const iso2 = (row.iso2 || '').toUpperCase()
    if (!iso2 || iso2.length !== 2) continue

    trade_usd_by_iso2[iso2] = {
      imports_usd: toNumber(row.imports_usd),
      exports_usd: toNumber(row.exports_usd),
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    source: 'UN Comtrade CSV import',
    required_columns: ['iso2', 'imports_usd', 'exports_usd'],
    trade_usd_by_iso2,
  }

  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Wrote trade cache: ${outPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
