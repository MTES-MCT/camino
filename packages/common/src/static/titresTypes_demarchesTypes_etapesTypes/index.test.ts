import { getEtapesTDE, isTDEExist } from './index'
import { test, expect } from 'vitest'

test('getEtapesTDE', () => {
  expect(getEtapesTDE('apm', 'amo')).toMatchInlineSnapshot('[]')
  expect(getEtapesTDE('arm', 'oct')).toMatchInlineSnapshot(`
    [
      "rcd",
      "rcb",
      "mfr",
      "mcd",
      "mcb",
      "dae",
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
      "rif",
      "mcr",
      "meo",
      "css",
      "exp",
      "mnc",
      "rde",
      "asc",
      "mcs",
      "rcs",
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
