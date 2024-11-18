import { Pool } from 'pg'
import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest'
import { dbManager } from '../../../tests/db-manager'
import { newEtapeId } from '../../database/models/_format/id-create'
import { etapeConsentementUpdate } from './titres-etapes-consentement'
import { callAndExit } from '../../tools/fp-tools'
import { createTitreWithDemarcheAndEtape, IEtapeInsert, ITitreInsert } from '../../../tests/integration-test-helper'
import { dateAddDays } from 'camino-common/src/date'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE } from 'camino-common/src/machines'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { getEtapeConsentement } from './titres-etapes-consentement.queries'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('etapeConsentementUpdate', () => {
  test("gère un id d'étape inconnu", async () => {
    const etapeId = newEtapeId()
    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Élément non trouvé dans la base de données
       extra: [object Object]
      detail: undefined
       zod: undefined]
    `)
  })

  const titre: Omit<ITitreInsert, 'id'> = {
    nom: 'titre',
    typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
    propsTitreEtapesIds: {},
    titreStatutId: TitresStatutIds.DemandeInitiale,
  }

  const etape: Omit<IEtapeInsert, 'id' | 'titreDemarcheId'> = {
    date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 14),
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    typeId: ETAPES_TYPES.demande,
    statutId: ETAPES_STATUTS.FAIT,
    substances: ['auru'],
  }

  test("ne fait rien si le périmètre de l'étape est null", async () => {
    const { etapeId } = await createTitreWithDemarcheAndEtape(titre, { typeId: DEMARCHES_TYPES_IDS.Octroi }, etape)
    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).resolves.toBe(null)
  })

  let index = 0

  const featureMultipolygon = (index: number): FeatureMultiPolygon => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [index * 2, index * 2],
            [index * 2, index * 2 + 1],
            [index * 2 + 1, index * 2 + 1],
            [index * 2 + 1, index * 2],
            [index * 2, index * 2],
          ],
        ],
      ],
    },
  })

  const dateDemande = dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 100)
  const demarcheConsentementDateDebut = dateAddDays(dateDemande, -20)

  test('met à jour le consentement', async () => {
    const perimetre = featureMultipolygon(index++)
    const { demarcheId: demarcheIdConsentement } = await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi, demarcheDateDebut: demarcheConsentementDateDebut },
      {
        ...etape,
        geojson4326Perimetre: perimetre,
        geojsonOriginePerimetre: perimetre,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['auru'],
      }
    )

    const { etapeId } = await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi },
      {
        ...etape,
        date: dateDemande,
        geojson4326Perimetre: perimetre,
        geojsonOriginePerimetre: perimetre,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['arge'],
      }
    )

    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).resolves.toStrictEqual({
      etapeId,
      new: [demarcheIdConsentement],
      old: [],
    })

    const updatedEtape = await callAndExit(getEtapeConsentement(dbPool, etapeId))
    expect(updatedEtape?.id).toBe(etapeId)
    expect(updatedEtape?.demarche_ids_consentement).toStrictEqual([demarcheIdConsentement])
  })

  test("n'a pas de demande de consentement si substances identiques", async () => {
    const perimetre = featureMultipolygon(index++)
    await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi, demarcheDateDebut: demarcheConsentementDateDebut },
      {
        ...etape,
        geojson4326Perimetre: perimetre,
        geojsonOriginePerimetre: perimetre,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
      }
    )

    const { etapeId } = await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi },
      {
        ...etape,
        date: dateDemande,
        geojson4326Perimetre: perimetre,
        geojsonOriginePerimetre: perimetre,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
      }
    )

    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).resolves.toStrictEqual({
      etapeId,
      new: [],
      old: [],
    })
  })

  test("n'a pas de demande de consentement si périmetre totalement différent", async () => {
    const perimetre1 = featureMultipolygon(index++)
    await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi, demarcheDateDebut: demarcheConsentementDateDebut },
      {
        ...etape,
        geojson4326Perimetre: perimetre1,
        geojsonOriginePerimetre: perimetre1,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['auru'],
      }
    )

    const perimetre2 = featureMultipolygon(index++)
    const { etapeId } = await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi },
      {
        ...etape,
        date: dateDemande,
        geojson4326Perimetre: perimetre2,
        geojsonOriginePerimetre: perimetre2,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['arge'],
      }
    )

    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).resolves.toStrictEqual({
      etapeId,
      new: [],
      old: [],
    })
  })

  test("n'a pas de demande de consentement si autre période", async () => {
    const perimetre1 = featureMultipolygon(index++)

    //Se termine avant la demande
    await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi, demarcheDateDebut: demarcheConsentementDateDebut, demarcheDateFin: dateAddDays(demarcheConsentementDateDebut, 1) },
      {
        ...etape,
        geojson4326Perimetre: perimetre1,
        geojsonOriginePerimetre: perimetre1,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['auru'],
      }
    )

    //Commence après la demande
    await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi, demarcheDateDebut: dateAddDays(dateDemande, 10) },
      {
        ...etape,
        geojson4326Perimetre: perimetre1,
        geojsonOriginePerimetre: perimetre1,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['auru'],
      }
    )

    const perimetre2 = featureMultipolygon(index++)
    const { etapeId } = await createTitreWithDemarcheAndEtape(
      titre,
      { typeId: DEMARCHES_TYPES_IDS.Octroi },
      {
        ...etape,
        date: dateDemande,
        geojson4326Perimetre: perimetre2,
        geojsonOriginePerimetre: perimetre2,
        geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
        substances: ['arge'],
      }
    )

    await expect(callAndExit(etapeConsentementUpdate(dbPool, etapeId))).resolves.toStrictEqual({
      etapeId,
      new: [],
      old: [],
    })
  })
})
