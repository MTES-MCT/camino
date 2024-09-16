import { test, expect, describe } from 'vitest'
import { EtapeHeritageProps, isHeritageProps } from './heritage'

describe('isHeritageProps', () => {
  test('la string "camino" n\'est pas une heritageProp', () => {
    expect(isHeritageProps('camino')).toBe(false)
  })

  test.each<EtapeHeritageProps>(['titulaires', 'amodiataires', 'dateDebut', 'dateFin', 'duree', 'substances', 'perimetre'])('%s est une heritageProp', prop => {
    expect(isHeritageProps(prop)).toBe(true)
  })
})
