import { IDemarcheType, IEtapeType, ITitreEtape } from '../../types'

import {
  titreEtapesSortAscByDate,
  titreEtapesSortAscByOrdre,
  titreEtapesSortDescByOrdre
} from './titre-etapes-sort'

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

console.error = jest.fn()
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
    expect(titreEtapesSortAscByDate(titreEtapesSortedDesc)).toMatchObject(
      titreEtapesSortedAsc
    )
  })

  test('des étapes organisées par date croissante restent triées par date croissante', () => {
    expect(titreEtapesSortAscByDate(titreEtapesSortedAsc)).toMatchObject(
      titreEtapesSortedAsc
    )
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
        {
          id: 'demarche-type-id',
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
      titreEtapesSortAscByDate(etapes, {
        id: 'demarche-type-id',
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
      titreEtapesSortAscByDate(titreEtapesMemesDatesMemeOrdreDesc, {
        etapesTypes
      } as IDemarcheType)
    ).toMatchObject(titreEtapesMemesDatesMemeOrdreDesc.slice().reverse())
  })

  test('tri selon l’arbre si les étapes ont la même date', () => {
    const etapes = [
      { typeId: 'mcr', date: '2020-01-01', ordre: 18 },
      { typeId: 'vfd', date: '2020-01-01', ordre: 23 },
      { typeId: 'eof', date: '2020-01-01', ordre: 36 }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
      { id: 'oct' } as IDemarcheType,
      'arm'
    )
    expect(result[0].typeId).toEqual('vfd')
    expect(result[1].typeId).toEqual('mcr')
    expect(result[2].typeId).toEqual('eof')
  })

  test("loggue une erreur si le type d'étape est absent dans la définition", () => {
    const etapes = [
      { typeId: 'mcr', date: '2020-01-01', ordre: 18 },
      { typeId: 'bof', date: '2020-01-01', ordre: 23 },
      { typeId: 'vfd', date: '2020-01-01', ordre: 36 }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
      { id: 'oct' } as IDemarcheType,
      'arm'
    )
    expect(console.error).toHaveBeenCalledTimes(2)
    expect(result[0].typeId).toEqual('vfd')
    expect(result[1].typeId).toEqual('bof')
    expect(result[2].typeId).toEqual('mcr')
  })

  test('sur un otroi d’ARM la rcm est après la mcp', () => {
    const etapes = [
      { typeId: 'rcm', date: '2018-01-01' },
      { typeId: 'mcp', date: '2018-01-01' }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
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

  test('sur un otroi d’ARM la mnv est après la aco', () => {
    const etapes = [
      { typeId: 'aco', date: '2020-01-01' },
      { typeId: 'mnv', date: '2020-01-01' }
    ] as ITitreEtape[]

    const result = titreEtapesSortAscByDate(
      etapes,
      {
        id: 'oct',
        etapesTypes: [
          { id: 'mnv', ordre: 2101, titreTypeId: 'arm' },
          { id: 'aco', ordre: 2100, titreTypeId: 'arm' }
        ]
      } as IDemarcheType,
      'arm'
    )
    expect(result[0].typeId).toEqual('aco')
    expect(result[1].typeId).toEqual('mnv')
  })
})
