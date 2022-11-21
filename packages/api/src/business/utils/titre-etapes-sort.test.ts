import { IDemarcheType, IEtapeType, ITitreEtape } from '../../types'

import {
  titreEtapesSortAscByDate,
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from './titre-etapes-sort'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { vi, describe, test, expect } from 'vitest'

const titreEtapesSortedDescResult = [
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' },
  { typeId: 'dex', ordre: 1, date: '1988-03-06' }
] as ITitreEtape[]

const titreEtapesSortedAsc = [
  { typeId: 'dex', ordre: 1, date: '1988-03-06' },
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' }
] as ITitreEtape[]

const titreEtapesSortedDesc = titreEtapesSortedAsc.slice().reverse()

const etapesTypes = [
  { id: 'dex', nom: 'dex', ordre: 100, titreTypeId: 'titre-type-id' },
  { id: 'dpu', nom: 'dpu', ordre: 200, titreTypeId: 'titre-type-id' }
] as IEtapeType[]

console.error = vi.fn()
describe('trie les étapes', () => {
  test('des étapes organisées par ordre décroissant sont triées par ordre croissant', () => {
    expect(titreEtapesSortAscByOrdre(titreEtapesSortedDesc)).toMatchObject(
      titreEtapesSortedAsc
    )
  })

  test('des étapes organisées par ordre croissant restent triées par ordre croissant', () => {
    expect(titreEtapesSortAscByOrdre(titreEtapesSortedAsc)).toMatchObject(
      titreEtapesSortedAsc
    )
  })

  test('des étapes organisées par ordre croissant sont triées par ordre décroissant', () => {
    expect(titreEtapesSortDescByOrdre(titreEtapesSortedAsc)).toMatchObject(
      titreEtapesSortedDescResult
    )
  })

  test('des étapes organisées par ordre décroissant restent triées par ordre décroissant', () => {
    expect(titreEtapesSortDescByOrdre(titreEtapesSortedDesc)).toMatchObject(
      titreEtapesSortedDescResult
    )
  })

  test('des étapes organisées par date décroissante sont triées par date croissante', () => {
    expect(
      titreEtapesSortAscByDate(titreEtapesSortedDesc, newDemarcheId())
    ).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes organisées par date croissante restent triées par date croissante', () => {
    expect(
      titreEtapesSortAscByDate(titreEtapesSortedAsc, newDemarcheId())
    ).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes avec les mêmes dates organisées par ordre décroissant sont triées par ordre croissant', () => {
    const titreEtapesMemesDatesOrdreDesc = [
      { typeId: 'dpu', ordre: 2, date: '1988-03-06' },
      { typeId: 'dex', ordre: 1, date: '1988-03-06' }
    ] as ITitreEtape[]

    const titreEtapesMemesDatesOrdreAscResult = titreEtapesMemesDatesOrdreDesc
      .slice()
      .reverse()

    expect(
      titreEtapesSortAscByDate(
        titreEtapesMemesDatesOrdreDesc,
        newDemarcheId(),
        null,
        'titre-type-id'
      )
    ).toMatchObject(titreEtapesMemesDatesOrdreAscResult)
  })

  test('des étapes avec les mêmes dates sont triées par ordre de type croissant', () => {
    const titreEtapesMemesDatesOrdreEtapesTypesDesc = [
      { typeId: 'dpu', ordre: 2, date: '1988-03-06' },
      { typeId: 'dex', ordre: 2, date: '1988-03-06' },
      { typeId: 'xxx', ordre: 2, date: '1988-03-06' }
    ] as ITitreEtape[]
    expect(
      titreEtapesSortAscByDate(
        titreEtapesMemesDatesOrdreEtapesTypesDesc,
        newDemarcheId(),
        {
          id: 'amo',
          etapesTypes
        } as IDemarcheType,
        'titre-type-id'
      )
    ).toMatchObject([
      { typeId: 'dex', ordre: 2, date: '1988-03-06' },
      { typeId: 'dpu', ordre: 2, date: '1988-03-06' },
      { typeId: 'xxx', ordre: 2, date: '1988-03-06' }
    ])
  })

  test('des étapes avec les mêmes dates sont triées par ordre de type croissant', () => {
    const etapes = [
      {
        typeId: 'dpu',
        ordre: 1,
        date: '1988-03-06'
      },
      {
        typeId: 'dex',
        ordre: 2,
        date: '1988-03-06'
      }
    ] as ITitreEtape[]

    expect(
      titreEtapesSortAscByDate(etapes, newDemarcheId(), {
        id: 'amo',
        etapesTypes: [
          { id: 'dex', nom: 'dex', ordre: 100 },
          { id: 'dpu', nom: 'dpu', ordre: 100 }
        ] as IEtapeType[]
      } as IDemarcheType)
    ).toMatchObject(etapes)
  })

  test('des étapes avec les mêmes dates sont triées par ordre croissant', () => {
    const titreEtapesMemesDatesMemeOrdreDesc = [
      { typeId: 'dex', ordre: 2, date: '1988-03-06' },
      { typeId: 'dex', ordre: 1, date: '1988-03-06' }
    ] as ITitreEtape[]

    expect(
      titreEtapesSortAscByDate(
        titreEtapesMemesDatesMemeOrdreDesc,
        newDemarcheId(),
        {
          etapesTypes
        } as IDemarcheType
      )
    ).toMatchObject(titreEtapesMemesDatesMemeOrdreDesc.slice().reverse())
  })

  test('tri selon l’arbre si les étapes ont la même date', () => {
    const etapes = [
      { typeId: 'pfd', date: '2020-01-01', statutId: 'fai' },
      { typeId: 'mfr', date: '2020-01-01', statutId: 'fai' },
      { typeId: 'mdp', date: '2020-01-01', statutId: 'fai' }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
      newDemarcheId(),
      { id: 'oct' } as IDemarcheType,
      'arm'
    )
    expect(result[0].typeId).toEqual('pfd')
    expect(result[1].typeId).toEqual('mfr')
    expect(result[2].typeId).toEqual('mdp')
  })

  test("retourne une erreur si le type d'étape est absent dans la définition", () => {
    const etapes = [
      { typeId: 'mcr', date: '2020-01-01', statutId: 'fai' },
      { typeId: 'bof', date: '2020-01-01', statutId: 'fai' },
      { typeId: 'vfd', date: '2020-01-01', statutId: 'fai' }
    ] as ITitreEtape[]

    expect(() =>
      titreEtapesSortAscByDate(
        etapes,
        newDemarcheId(),
        { id: 'oct' } as IDemarcheType,
        'arm'
      )
    ).toThrowErrorMatchingInlineSnapshot(`"l'état bof est inconnu"`)
  })

  test('sur un otroi d’ARM la rcm est après la mcp', () => {
    const etapes = [
      { typeId: 'rcm', date: '2018-01-01' },
      { typeId: 'mcp', date: '2018-01-01' }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
      newDemarcheId(),
      {
        id: 'oct',
        etapesTypes: [
          { id: 'rcm', ordre: 1006, titreTypeId: 'arm' },
          { id: 'mcp', ordre: 1000, titreTypeId: 'arm' }
        ]
      } as IDemarcheType,
      'arm'
    )
    expect(result[0].typeId).toEqual('mcp')
    expect(result[1].typeId).toEqual('rcm')
  })
})
