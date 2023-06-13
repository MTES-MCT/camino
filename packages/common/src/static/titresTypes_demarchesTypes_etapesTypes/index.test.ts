import { getEtapesTDE, isTDEExist } from './index.js'
import { test, expect } from 'vitest'

test('getEtapesTDE', () => {
  expect(getEtapesTDE('apm', 'amo')).toMatchInlineSnapshot('[]')
  expect(getEtapesTDE('arm', 'oct')).toMatchInlineSnapshot(`
    [
      "rcd",
      "rcb",
      "mfr",
      "mdp",
      "mcd",
      "mcb",
      "dae",
      "mom",
      "men",
      "mod",
      "pfd",
      "vfd",
      "mcp",
      "mca",
      "mcm",
      "rca",
      "rcm",
      "mim",
      "rim",
      "mcr",
      "meo",
      "css",
      "edm",
      "mnc",
      "ede",
      "rde",
      "mio",
      "rio",
      "eof",
      "mcs",
      "rcs",
      "mia",
      "ria",
      "aof",
      "sca",
      "aca",
      "mna",
      "mnd",
      "mnb",
      "pfc",
      "vfc",
      "def",
      "des",
      "sco",
      "mns",
      "aco",
      "mnv",
    ]
  `)
})

test('isTDEExist', () => {
  expect(isTDEExist('apm', 'amo', 'mfr')).toBe(false)
  expect(isTDEExist('arm', 'oct', 'mfr')).toBe(true)
})
