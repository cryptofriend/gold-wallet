#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const WORLD_BANK_COUNTRY_API = 'https://api.worldbank.org/v2/country?format=json&per_page=400'
const WORLD_BANK_RESERVES_API = 'https://api.worldbank.org/v2/country/all/indicator/FI.RES.TOTL.CD?format=json&per_page=20000'
const WORLD_BANK_IMPORTS_API = 'https://api.worldbank.org/v2/country/all/indicator/TM.VAL.MRCH.CD.WT?format=json&per_page=20000'
const WORLD_BANK_EXPORTS_API = 'https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json&per_page=20000'
const REST_COUNTRIES_API =
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,currencies,independent,unMember,region'

const ALPHA_VANTAGE_GOLD_API =
  'https://www.alphavantage.co/query?function=COMMODITY_EXCHANGE_RATE&from_symbol=XAU&to_symbol=USD&apikey='

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'gold-data')
const countriesOut = path.join(outDir, 'countries.json')
const priceOut = path.join(outDir, 'price.json')
const productionSeedPath = path.join(outDir, 'production-seed.json')

const nowIso = new Date().toISOString()

const fetchJson = async (url) => {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Request failed ${res.status} for ${url}`)
  }

  return res.json()
}

const readJsonIfExists = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

const mapLatestIndicatorByIso3 = (rows) => {
  const byIso3 = new Map()

  for (const row of rows) {
    const iso3 = row.countryiso3code
    const value = row.value

    if (!iso3 || iso3.length !== 3) continue
    if (typeof value !== 'number') continue

    const current = byIso3.get(iso3)
    if (!current || Number(row.date) > Number(current.date)) {
      byIso3.set(iso3, {
        date: row.date,
        value,
      })
    }
  }

  return byIso3
}

const normalizeCurrency = (currencies) => {
  if (!currencies || typeof currencies !== 'object') {
    return null
  }

  const [code] = Object.keys(currencies)
  return code || null
}

const main = async () => {
  const [
    restCountries,
    wbCountriesPayload,
    wbReservesPayload,
    wbImportsPayload,
    wbExportsPayload,
  ] = await Promise.all([
    fetchJson(REST_COUNTRIES_API),
    fetchJson(WORLD_BANK_COUNTRY_API),
    fetchJson(WORLD_BANK_RESERVES_API),
    fetchJson(WORLD_BANK_IMPORTS_API),
    fetchJson(WORLD_BANK_EXPORTS_API),
  ])

  const wbCountries = wbCountriesPayload?.[1] || []
  const wbReserves = wbReservesPayload?.[1] || []
  const wbImports = wbImportsPayload?.[1] || []
  const wbExports = wbExportsPayload?.[1] || []
  const productionSeed = await readJsonIfExists(productionSeedPath)

  const productionByIso2 = productionSeed?.production_tonnes_by_iso2 || {}

  const wbIso2ToIso3 = new Map(
    wbCountries
      .filter((entry) => entry?.iso2Code && entry?.id && entry.iso2Code.length === 2)
      .map((entry) => [entry.iso2Code.toUpperCase(), entry.id.toUpperCase()]),
  )

  const reservesByIso3 = mapLatestIndicatorByIso3(wbReserves)
  const importsByIso3 = mapLatestIndicatorByIso3(wbImports)
  const exportsByIso3 = mapLatestIndicatorByIso3(wbExports)

  const countryRecords = restCountries
    .filter((country) => country?.cca2 && country?.name?.common)
    .map((country) => {
      const iso2 = country.cca2.toUpperCase()
      const iso3 = (country.cca3 || wbIso2ToIso3.get(iso2) || '').toUpperCase() || null
      const reserves = iso3 ? reservesByIso3.get(iso3) : null

      const imports = iso3 ? importsByIso3.get(iso3) : null
      const exports = iso3 ? exportsByIso3.get(iso3) : null
      const seededProduction = productionByIso2[iso2]

      return {
        country: country.name.common,
        iso2,
        currency: normalizeCurrency(country.currencies),
        reserves_tonnes: null,
        imports_usd: imports?.value ?? null,
        exports_usd: exports?.value ?? null,
        production_tonnes: typeof seededProduction === 'number' ? seededProduction : null,
        updated_at: nowIso,
        sources: [
          {
            name: 'REST Countries',
            url: 'https://restcountries.com/',
          },
          {
            name: 'World Bank API - FI.RES.TOTL.CD (includes gold, current US$)',
            url: 'https://api.worldbank.org/v2/country/all/indicator/FI.RES.TOTL.CD?format=json',
          },
          {
            name: 'World Bank API - TM.VAL.MRCH.CD.WT (merchandise imports, current US$)',
            url: 'https://api.worldbank.org/v2/country/all/indicator/TM.VAL.MRCH.CD.WT?format=json',
          },
          {
            name: 'World Bank API - TX.VAL.MRCH.CD.WT (merchandise exports, current US$)',
            url: 'https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json',
          },
          {
            name: productionSeed?.source?.name || 'USGS production seed',
            url:
              productionSeed?.source?.url ||
              'https://www.usgs.gov/centers/national-minerals-information-center/gold-statistics-and-information',
          },
        ],
        reserves_usd_including_gold: reserves?.value ?? null,
        reserves_usd_year: reserves?.date ?? null,
        imports_usd_year: imports?.date ?? null,
        exports_usd_year: exports?.date ?? null,
      }
    })
    .sort((a, b) => a.country.localeCompare(b.country))

  const countriesPayload = {
    schema: {
      country: 'string',
      iso2: 'string (ISO 3166-1 alpha-2)',
      currency: 'string (ISO 4217)|null',
      reserves_tonnes: 'number|null',
      imports_usd: 'number|null',
      exports_usd: 'number|null',
      production_tonnes: 'number|null',
      updated_at: 'string (ISO 8601)',
      sources: [{ name: 'string', url: 'string' }],
      reserves_usd_including_gold: 'number|null',
      reserves_usd_year: 'string|null',
      imports_usd_year: 'string|null',
      exports_usd_year: 'string|null',
    },
    generated_at: nowIso,
    countries_count: countryRecords.length,
    countries: countryRecords,
  }

  let pricePayload = {
    symbol: 'XAU/USD',
    price_usd: null,
    updated_at: nowIso,
    source: 'Alpha Vantage',
    note: 'Set ALPHA_VANTAGE_API_KEY to populate live price.',
  }

  const avKey = process.env.ALPHA_VANTAGE_API_KEY

  if (avKey) {
    try {
      const priceData = await fetchJson(`${ALPHA_VANTAGE_GOLD_API}${encodeURIComponent(avKey)}`)
      const maybePrice = Number(priceData?.RealtimeCurrencyExchangeRate?.['5. Exchange Rate'])

      if (Number.isFinite(maybePrice)) {
        pricePayload = {
          symbol: 'XAU/USD',
          price_usd: maybePrice,
          updated_at: nowIso,
          source: 'Alpha Vantage - COMMODITY_EXCHANGE_RATE',
          raw: priceData,
        }
      } else {
        pricePayload = {
          ...pricePayload,
          note: 'Alpha Vantage key present but response did not include a parseable XAU/USD price.',
          raw: priceData,
        }
      }
    } catch (error) {
      pricePayload = {
        ...pricePayload,
        note: `Price fetch failed: ${error.message}`,
      }
    }
  }

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(countriesOut, `${JSON.stringify(countriesPayload, null, 2)}\n`)
  await fs.writeFile(priceOut, `${JSON.stringify(pricePayload, null, 2)}\n`)

  console.log(`Generated ${countryRecords.length} countries -> ${countriesOut}`)
  console.log(`Generated price payload -> ${priceOut}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
