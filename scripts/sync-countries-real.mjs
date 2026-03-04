#!/usr/bin/env node
import fs from 'node:fs/promises'

const REST = 'https://restcountries.com/v3.1/all?fields=name,cca2,currencies'
const WB_COUNTRY = 'https://api.worldbank.org/v2/country?format=json&per_page=400'
const WB_RESERVES = 'https://api.worldbank.org/v2/country/all/indicator/FI.RES.TOTL.CD?format=json&per_page=20000'
const WB_IMPORTS = 'https://api.worldbank.org/v2/country/all/indicator/TM.VAL.MRCH.CD.WT?format=json&per_page=20000'
const WB_EXPORTS = 'https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json&per_page=20000'

const json = async (url) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

const latestByIso3 = (rows) => {
  const map = new Map()
  for (const row of rows || []) {
    const iso3 = row.countryiso3code
    const v = row.value
    if (!iso3 || iso3.length !== 3 || typeof v !== 'number') continue
    const cur = map.get(iso3)
    if (!cur || Number(row.date) > Number(cur.date)) map.set(iso3, { value: v, date: row.date })
  }
  return map
}

const currencyCode = (currencies) => (currencies && typeof currencies === 'object' ? Object.keys(currencies)[0] || null : null)

const now = new Date().toISOString()

const [rest, wbCountriesPayload, reservesPayload, importsPayload, exportsPayload] = await Promise.all([
  json(REST),
  json(WB_COUNTRY),
  json(WB_RESERVES),
  json(WB_IMPORTS),
  json(WB_EXPORTS),
])

const wbCountries = wbCountriesPayload?.[1] || []
const iso2to3 = new Map(
  wbCountries
    .filter((c) => c?.iso2Code && c?.id && c.iso2Code.length === 2)
    .map((c) => [c.iso2Code.toUpperCase(), c.id.toUpperCase()]),
)

const reserves = latestByIso3(reservesPayload?.[1] || [])
const imports = latestByIso3(importsPayload?.[1] || [])
const exports = latestByIso3(exportsPayload?.[1] || [])

const countries = (rest || [])
  .filter((c) => c?.cca2 && c?.name?.common)
  .map((c) => {
    const iso2 = c.cca2.toUpperCase()
    const iso3 = iso2to3.get(iso2)
    const r = iso3 ? reserves.get(iso3) : null
    const i = iso3 ? imports.get(iso3) : null
    const e = iso3 ? exports.get(iso3) : null

    return {
      country: c.name.common,
      iso2,
      currency: currencyCode(c.currencies),
      reserves_tonnes: null,
      imports_usd: i?.value ?? null,
      exports_usd: e?.value ?? null,
      production_tonnes: null,
      updated_at: now,
      sources: [
        { name: 'REST Countries', url: 'https://restcountries.com/' },
        { name: 'World Bank FI.RES.TOTL.CD', url: 'https://api.worldbank.org/v2/country/all/indicator/FI.RES.TOTL.CD?format=json' },
        { name: 'World Bank TM.VAL.MRCH.CD.WT', url: 'https://api.worldbank.org/v2/country/all/indicator/TM.VAL.MRCH.CD.WT?format=json' },
        { name: 'World Bank TX.VAL.MRCH.CD.WT', url: 'https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json' },
      ],
      reserves_usd_including_gold: r?.value ?? null,
      reserves_usd_year: r?.date ?? null,
      imports_usd_year: i?.date ?? null,
      exports_usd_year: e?.date ?? null,
    }
  })
  .sort((a, b) => a.country.localeCompare(b.country))

const payload = {
  schema: {
    country: 'string',
    iso2: 'string',
    currency: 'string|null',
    reserves_tonnes: 'number|null',
    imports_usd: 'number|null',
    exports_usd: 'number|null',
    production_tonnes: 'number|null',
    updated_at: 'string',
    sources: [{ name: 'string', url: 'string' }],
    reserves_usd_including_gold: 'number|null',
    reserves_usd_year: 'string|null',
    imports_usd_year: 'string|null',
    exports_usd_year: 'string|null',
  },
  generated_at: now,
  countries_count: countries.length,
  countries,
}

await fs.writeFile(new URL('../gold-data/countries.json', import.meta.url), JSON.stringify(payload, null, 2) + '\n')
console.log(`Wrote ${countries.length} countries`)
