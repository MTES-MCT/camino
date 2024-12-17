import { toCaminoDate } from 'camino-common/src/date'
import { getDemarcheDateDebut, getDemarcheDateEffet, getDemarcheDateFin, TitreEtapeForMachine, toMachineEtapes } from './machine-common'
import { describe, expect, test, vi } from 'vitest'
import { ETAPE_IS_NOT_BROUILLON, ETAPE_IS_BROUILLON } from 'camino-common/src/etape'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'

console.error = vi.fn()
describe('getDemarcheDateEffet', () => {
  test("ne fait rien si ne n'est pas une démarche d'annulation", () => {
    expect(getDemarcheDateEffet(DEMARCHES_TYPES_IDS.Octroi, null, { date: toCaminoDate('2025-01-15') })).toStrictEqual(null)
  })

  test("prend la première date d'effet", () => {
    expect(getDemarcheDateEffet(DEMARCHES_TYPES_IDS.Retrait, null, { date: toCaminoDate('2025-01-15') })).toStrictEqual('2025-01-15')
    expect(getDemarcheDateEffet(DEMARCHES_TYPES_IDS.Retrait, toCaminoDate('2024-01-01'), { date: toCaminoDate('2025-01-15') })).toStrictEqual('2024-01-01')
  })
})
describe('getDemarcheDateDebut', () => {
  test("date étape déjà existant (par exemple pour une prolongation, la date de début est la date de la demande et non de l'avenant)", () => {
    const dateEtapePrecedente = toCaminoDate('2020-01-01')
    expect(getDemarcheDateDebut(DEMARCHES_TYPES_IDS.Octroi, { dateDebut: null, dateEtape: dateEtapePrecedente }, { date: toCaminoDate('2021-01-01'), dateDebut: null })).toStrictEqual({
      dateEtape: dateEtapePrecedente,
      dateDebut: null,
    })
  })
  test('la dernière date de début est toujours gagnante', () => {
    const dateEtapePrecedente = toCaminoDate('2020-01-01')
    const dateDebutDerniereEtape = toCaminoDate('2023-01-01')
    expect(
      getDemarcheDateDebut(DEMARCHES_TYPES_IDS.Octroi, { dateDebut: null, dateEtape: dateEtapePrecedente }, { date: toCaminoDate('2021-01-01'), dateDebut: dateDebutDerniereEtape })
    ).toStrictEqual({
      dateDebut: dateDebutDerniereEtape,
      dateEtape: null,
    })
  })
  test("la date de début d'une étape précedente gagne sur la date (pas la date de début, la date de l'étape) de la nouvelle étape", () => {
    const dateDebutEtapePrecedente = toCaminoDate('2020-01-01')
    expect(getDemarcheDateDebut(DEMARCHES_TYPES_IDS.Octroi, { dateEtape: null, dateDebut: dateDebutEtapePrecedente }, { date: toCaminoDate('2021-01-01'), dateDebut: null })).toStrictEqual({
      dateDebut: dateDebutEtapePrecedente,
      dateEtape: null,
    })
  })
  test("pas de date de début si le type de démarche n'est pas une phase", () => {
    expect(getDemarcheDateDebut(DEMARCHES_TYPES_IDS.DeplacementDePerimetre, { dateDebut: null, dateEtape: null }, { date: toCaminoDate('2021-01-01'), dateDebut: null })).toStrictEqual({
      dateDebut: null,
      dateEtape: null,
    })
  })
})
describe('getDemarcheDateFin', () => {
  test("pas de date de fin si le type de démarche n'est pas une phase", () => {
    expect(getDemarcheDateFin(DEMARCHES_TYPES_IDS.DeplacementDePerimetre, { dateFin: null, duree: null }, { dateFin: toCaminoDate('2021-01-01'), duree: null })).toStrictEqual({
      dateFin: null,
      duree: null,
    })
  })

  test('la date de fin est plus précise que la duree', () => {
    const dateFin = toCaminoDate('2021-01-01')
    expect(getDemarcheDateFin(DEMARCHES_TYPES_IDS.Octroi, { dateFin: null, duree: null }, { dateFin, duree: 12 })).toStrictEqual({
      dateFin,
      duree: null,
    })
  })

  test('on choisit toujours la valeur la plus récente', () => {
    const dateFin = toCaminoDate('2021-01-01')
    expect(getDemarcheDateFin(DEMARCHES_TYPES_IDS.Octroi, { dateFin: toCaminoDate('2020-01-01'), duree: null }, { dateFin, duree: 12 })).toStrictEqual({
      dateFin,
      duree: null,
    })
  })
  test('la durée est selectionnée si elle est seule', () => {
    expect(getDemarcheDateFin(DEMARCHES_TYPES_IDS.Octroi, { dateFin: toCaminoDate('2020-01-01'), duree: null }, { dateFin: null, duree: 12 })).toStrictEqual({
      dateFin: null,
      duree: 12,
    })
  })
  test('on est capable de gérer les titres infinis', () => {
    expect(getDemarcheDateFin(DEMARCHES_TYPES_IDS.Octroi, { dateFin: null, duree: null }, { dateFin: null, duree: null })).toStrictEqual({
      dateFin: 'TITRE_INFINI',
      duree: null,
    })
  })
})
describe('toMachineEtapes', () => {
  test('transforme une étape de la bdd en étape de machine', () => {
    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-01-01'),
          dateFin: null,
          dateDebut: null,
          duree: null,
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          communes: [],
          ordre: 0,
          concurrence: 'non-applicable',
          hasTitreFrom: 'non-applicable',
          surface: null,
          contenu: null,
          demarcheIdsConsentement: [],
        },
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        dateDebut: null,
        dateFin: null,
        duree: null,
        date: '2022-01-01',
        consentement: 'non-applicable',
      },
    ])

    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          date: toCaminoDate('2022-01-01'),
          dateFin: null,
          dateDebut: null,
          duree: null,
          contenu: { arm: { mecanise: true } },
          hasTitreFrom: 'non-applicable',
          concurrence: 'non-applicable',
          communes: [],
          ordre: 0,
          surface: null,
          demarcheIdsConsentement: [],
        },
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        dateDebut: null,
        dateFin: null,
        duree: null,
        date: '2022-01-01',
        consentement: 'non-applicable',
        contenu: { arm: { mecanise: true } },
      },
    ])
  })

  test('filtre les étapes en brouillon', () => {
    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_BROUILLON,
          date: toCaminoDate('2022-01-01'),
          dateFin: null,
          dateDebut: null,
          duree: null,
          contenu: { arm: { mecanise: true } },
          concurrence: 'non-applicable',
          hasTitreFrom: 'non-applicable',
          communes: [],
          ordre: 0,
          surface: null,
          demarcheIdsConsentement: [],
        },
      ])
    ).toEqual([])
  })

  test('emet une erreur si le type de l’étape est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'iii',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          date: '2022-01-01',
        } as unknown as TitreEtapeForMachine,
      ])
    ).toThrowErrorMatchingInlineSnapshot(`[Error: l'état iii est inconnu]`)
  })

  test('emet une erreur si le type de le statut est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'mfr',
          statutId: 'ffi',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          date: '2022-01-01',
        } as unknown as TitreEtapeForMachine,
      ])
    ).toThrowErrorMatchingInlineSnapshot(`[Error: le status ffi est inconnu, {"id":"id","typeId":"mfr","statutId":"ffi","isBrouillon":false,"date":"2022-01-01"}]`)
  })
})
