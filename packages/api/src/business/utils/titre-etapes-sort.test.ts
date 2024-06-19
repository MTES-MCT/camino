import { titreEtapesSortAscByDate, titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from './titre-etapes-sort.js'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create.js'
import { vi, describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common.js'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape.js'

const titreEtapesSortedDescResult = [
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' },
  { typeId: 'dex', ordre: 1, date: '1988-03-06' },
] as TitreEtapeForMachine[]

const titreEtapesSortedAsc = [
  { typeId: 'dex', ordre: 1, date: '1988-03-06' },
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' },
] as TitreEtapeForMachine[]

const titreEtapesSortedDesc = titreEtapesSortedAsc.slice().reverse()

console.error = vi.fn()
console.warn = vi.fn()

describe('trie les étapes', () => {
  test('des étapes organisées par ordre décroissant sont triées par ordre croissant', () => {
    expect(titreEtapesSortAscByOrdre(titreEtapesSortedDesc)).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes organisées par ordre croissant restent triées par ordre croissant', () => {
    expect(titreEtapesSortAscByOrdre(titreEtapesSortedAsc)).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes organisées par ordre croissant sont triées par ordre décroissant', () => {
    expect(titreEtapesSortDescByOrdre(titreEtapesSortedAsc)).toMatchObject(titreEtapesSortedDescResult)
  })

  test('des étapes organisées par ordre décroissant restent triées par ordre décroissant', () => {
    expect(titreEtapesSortDescByOrdre(titreEtapesSortedDesc)).toMatchObject(titreEtapesSortedDescResult)
  })

  test('des étapes organisées par date décroissante sont triées par date croissante', () => {
    expect(titreEtapesSortAscByDate(titreEtapesSortedDesc, newDemarcheId(), 'oct', 'prh')).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes organisées par date croissante restent triées par date croissante', () => {
    expect(titreEtapesSortAscByDate(titreEtapesSortedAsc, newDemarcheId(), 'oct', 'prh')).toMatchObject(titreEtapesSortedAsc)
  })

  test('des étapes avec les mêmes dates organisées par ordre décroissant sont triées par ordre croissant', () => {
    const titreEtapesMemesDatesOrdreDesc: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('1'),
        typeId: 'dex',
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
      {
        id: newEtapeId('2'),
        typeId: 'dpu',
        ordre: 1,
        date: toCaminoDate('1988-03-06'),
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
    ]

    const titreEtapesMemesDatesOrdreAscResult = titreEtapesMemesDatesOrdreDesc.slice().reverse()

    expect(titreEtapesSortAscByDate(titreEtapesMemesDatesOrdreDesc, newDemarcheId(), 'oct', 'arm')).toStrictEqual(titreEtapesMemesDatesOrdreAscResult)
  })

  test('des étapes avec les mêmes dates sont triées par ordre de type croissant', () => {
    const titreDemarcheId = newDemarcheId('1')
    const titreEtapesMemesDatesOrdreEtapesTypesDesc: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('1'),
        typeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
      {
        id: newEtapeId('2'),
        typeId: ETAPES_TYPES.classementSansSuite,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
      {
        id: newEtapeId('3'),
        typeId: ETAPES_TYPES.decisionAdministrative,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        statutId: 'fav',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
    ]
    expect(titreEtapesSortAscByDate(titreEtapesMemesDatesOrdreEtapesTypesDesc, titreDemarcheId, DEMARCHES_TYPES_IDS.Retrait, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)).toMatchObject([
      {
        typeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
      },
      {
        typeId: ETAPES_TYPES.decisionAdministrative,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
      },
      {
        typeId: ETAPES_TYPES.classementSansSuite,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
      },
    ])
  })

  test('tri selon l’arbre si les étapes ont la même date', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('1'),
        typeId: 'pfd',
        ordre: 1,
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
      {
        id: newEtapeId('2'),
        typeId: 'mfr',
        ordre: 2,
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        communes: [],
        contenu: {},
        surface: null,
      },
      {
        id: newEtapeId('3'),
        typeId: 'mdp',
        ordre: 3,
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        communes: [],
        contenu: {},
      },
    ]

    const result = titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)
    expect(result[0].typeId).toEqual('pfd')
    expect(result[1].typeId).toEqual('mfr')
    expect(result[2].typeId).toEqual('mdp')
  })

  test("retourne une erreur si le type d'étape est absent dans la définition", () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('1'),
        typeId: 'mcr',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        ordre: 1,
        communes: [],
        contenu: null,
      },
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeId: 'bof',
        id: newEtapeId('2'),
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        ordre: 2,
        communes: [],
        contenu: null,
      },
      {
        id: newEtapeId('3'),
        typeId: 'vfd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        ordre: 3,
        communes: [],
        contenu: null,
      },
    ]

    expect(() => titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)).toThrowErrorMatchingInlineSnapshot(
      `[Error: l'état bof est inconnu]`
    )
  })

  test('utilise l’id pour trier des étapes totalement identiques', () => {
    const secondMcd: TitreEtapeForMachine = {
      id: newEtapeId('mcd2'),
      typeId: 'mcd',
      date: toCaminoDate('2020-01-01'),
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      surface: null,
      ordre: 5,
      contenu: {},
      communes: [],
    }

    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('mfr'),
        ordre: 1,
        typeId: 'mfr',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        contenu: {},
        communes: [],
      },
      {
        id: newEtapeId('mdp'),
        ordre: 2,
        typeId: 'mdp',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        contenu: {},
        communes: [],
      },
      {
        id: newEtapeId('mcd'),
        ordre: 3,
        typeId: 'mcd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        contenu: {},
        communes: [],
      },
      {
        id: newEtapeId('rcd'),
        ordre: 4,
        typeId: 'rcd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        surface: null,
        contenu: {},
        communes: [],
      },
      secondMcd,
    ]

    const result = titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)
    expect(result).toContain(secondMcd)
  })
})
