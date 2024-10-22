import { test, expect } from 'vitest'
import { capitalize, levenshtein, slugify, urlToSplit } from './strings'

test('urlToSplit', () => {
  expect(urlToSplit('http://proxy-paas.dgaln-pre1.eco4.sihc.fr:3128')).toStrictEqual({
    value: 'http://proxy-paas.dgaln-pre1.eco4.sihc.fr:3128',
    host: 'proxy-paas.dgaln-pre1.eco4.sihc.fr',
    port: 3128,
  })
  expect(urlToSplit(undefined)).toStrictEqual(undefined)
  expect(urlToSplit('http://google.fr')).toStrictEqual({ value: 'http://google.fr', host: 'google.fr', port: 80 })
  expect(urlToSplit('https://google.fr')).toStrictEqual({ value: 'https://google.fr', host: 'google.fr', port: 443 })
})

test('capitalize', () => {
  expect(capitalize('')).toBe('')
  expect(capitalize('A')).toBe('A')
  expect(capitalize('a')).toBe('A')
  expect(capitalize('é')).toBe('É')

  expect(capitalize('bonjour à tous')).toBe('Bonjour à tous')
})

test('levenshtein', () => {
  expect(levenshtein('or', 'or')).toBe(0)
  expect(levenshtein('oru', 'or')).toBe(1)
  expect(levenshtein('port', 'or')).toBe(2)
  expect(levenshtein('or', 'port')).toBe(2)
  expect(levenshtein('', 'port')).toBe(4)
})

test('slugify', () => {
  expect(slugify("Mer d'Iroise")).toBe('mer-d-iroise')
  expect(slugify(" Mer -d'Iroise ")).toBe('mer-d-iroise')
  expect(slugify('2.2 Affluent Mana amont')).toBe('2-2-affluent-mana-amont')
  expect(slugify('Affluent Rivière Ouanary')).toBe('affluent-riviere-ouanary')
  expect(slugify('Entrevernes-N°1')).toBe('entrevernes-n-1')

  expect(slugify('Hagenau Schlössel I')).toBe('hagenau-schloessel-i')
  expect(slugify('Saül')).toBe('sauel')
  expect(slugify('Airs-&-Feu')).toBe('airs-and-feu')
  expect(slugify('BIEDERSDORF-A. BERGMann')).toBe('biedersdorf-a-berg-mann')
  expect(slugify('cœur')).toBe('coeur')
  expect(slugify('Isselbächel')).toBe('isselbaechel')
  expect(slugify('Elsaß')).toBe('elsass')
})
