import { ITitreEtape } from '../../types.js'

import { titreEtapesSortAscByDate, titreEtapesSortAscByOrdre, titreEtapesSortDescByOrdre } from './titre-etapes-sort.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { vi, describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes.js'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'

const titreEtapesSortedDescResult = [
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' },
  { typeId: 'dex', ordre: 1, date: '1988-03-06' },
] as ITitreEtape[]

const titreEtapesSortedAsc = [
  { typeId: 'dex', ordre: 1, date: '1988-03-06' },
  { typeId: 'dpu', ordre: 2, date: '1988-03-11' },
] as ITitreEtape[]

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
    const titreEtapesMemesDatesOrdreDesc: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[] = [
      {
        id: '1',
        typeId: 'dex',
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        titreDemarcheId: newDemarcheId(),
        statutId: 'fai',
      },
      {
        id: '2',
        typeId: 'dpu',
        ordre: 1,
        date: toCaminoDate('1988-03-06'),
        titreDemarcheId: newDemarcheId(),
        statutId: 'fav',
      },
    ]

    const titreEtapesMemesDatesOrdreAscResult = titreEtapesMemesDatesOrdreDesc.slice().reverse()

    expect(titreEtapesSortAscByDate(titreEtapesMemesDatesOrdreDesc, newDemarcheId(), 'oct', 'arm')).toMatchObject(titreEtapesMemesDatesOrdreAscResult)
  })

  test('des étapes avec les mêmes dates sont triées par ordre de type croissant', () => {
    const titreDemarcheId = newDemarcheId('1')
    const titreEtapesMemesDatesOrdreEtapesTypesDesc: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[] = [
      {
        id: '1',
        typeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        titreDemarcheId,
        statutId: 'fav',
      },
      {
        id: '2',
        typeId: ETAPES_TYPES.classementSansSuite,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        titreDemarcheId,
        statutId: 'fav',
      },
      {
        id: '3',
        typeId: ETAPES_TYPES.decisionAdministrative,
        ordre: 2,
        date: toCaminoDate('1988-03-06'),
        titreDemarcheId,
        statutId: 'fav',
      },
    ]
    expect(titreEtapesSortAscByDate(titreEtapesMemesDatesOrdreEtapesTypesDesc, titreDemarcheId, DEMARCHES_TYPES_IDS.Retrait, TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX)).toMatchObject([
      {
        typeId: ETAPES_TYPES.initiationDeLaDemarcheDeRetrait,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
        titreDemarcheId,
      },
      {
        typeId: ETAPES_TYPES.decisionAdministrative,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
        titreDemarcheId,
      },
      {
        typeId: ETAPES_TYPES.classementSansSuite,
        ordre: 2,
        date: '1988-03-06',
        statutId: 'fav',
        titreDemarcheId,
      },
    ])
  })

  test('tri selon l’arbre si les étapes ont la même date', () => {
    const etapes: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[] = [
      {
        id: '1',
        typeId: 'pfd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: '2',
        typeId: 'mfr',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: '3',
        typeId: 'mdp',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
    ]

    const result = titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)
    expect(result[0].typeId).toEqual('pfd')
    expect(result[1].typeId).toEqual('mfr')
    expect(result[2].typeId).toEqual('mdp')
  })

  test("retourne une erreur si le type d'étape est absent dans la définition", () => {
    const etapes: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[] = [
      {
        id: '1',
        typeId: 'mcr',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        typeId: 'bof',
        id: '2',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: '3',
        typeId: 'vfd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
    ]

    expect(() => titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)).toThrowErrorMatchingInlineSnapshot(
      `"l'état bof est inconnu"`
    )
  })

  test('utilise l’id pour trier des étapes totalement identiques', () => {
    const secondMcd: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'> = {
      id: 'mcd2',
      typeId: 'mcd',
      date: toCaminoDate('2020-01-01'),
      statutId: 'fai',
      titreDemarcheId: newDemarcheId(),
    }

    const etapes: Pick<ITitreEtape, 'id' | 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>[] = [
      {
        id: 'mfr',
        typeId: 'mfr',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: 'mdp',
        typeId: 'mdp',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: 'mcd',
        typeId: 'mcd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      {
        id: 'rcd',
        typeId: 'rcd',
        date: toCaminoDate('2020-01-01'),
        statutId: 'fai',
        titreDemarcheId: newDemarcheId(),
      },
      secondMcd,
    ]

    const result = titreEtapesSortAscByDate(etapes, newDemarcheId(), DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX)
    expect(result).toContain(secondMcd)
  })
})
