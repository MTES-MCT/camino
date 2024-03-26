/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ITitre } from '../../src/types.js'

import { graphQLCall, queryImport } from './index.js'

import Titres from '../../src/database/models/titres.js'
import options from '../../src/database/queries/_options.js'
import { newDemarcheId, newEtapeDocumentId, newTitreId, newEtapeId } from '../../src/database/models/_format/id-create.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { isGestionnaire } from 'camino-common/src/static/administrationsTitresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { expect } from 'vitest'
import { AdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations.js'
import { TestUser } from 'camino-common/src/tests-utils.js'
import type { Pool } from 'pg'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreId } from 'camino-common/src/validators/titres.js'
import TitresDemarches from '../../src/database/models/titres-demarches.js'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes.js'
export const visibleCheck = async (
  pool: Pool,
  administrationId: AdministrationId,
  visible: boolean,
  cible: 'titres' | 'demarches' | 'etapes',
  titreTypeId: TitreTypeId,
  locale: boolean,
  etapeTypeId?: EtapeTypeId
) => {
  const titreQuery = queryImport('titre')

  const administration = sortedAdministrations.find(a => a.id === administrationId)!

  const gestionnaire = isGestionnaire(administration.id, null)

  const titre = titreBuild(
    {
      titreId: newTitreId(`${titreTypeId}${locale ? '-local' : ''}-${cible}-admin-${administrationId}`),
      titreTypeId,
    },
    gestionnaire ? administrationId : undefined,
    locale ? administrationId : undefined,
    etapeTypeId
  )

  await Titres.query().insertGraph(titre, options.titres.update)

  const res = await graphQLCall(
    pool,
    titreQuery,
    { id: titre.id },
    {
      role: 'admin',
      administrationId: administration.id,
    }
  )

  expect(res.body.errors).toBe(undefined)
  if (cible === 'titres') {
    if (visible) {
      expect(res.body.data.titre).not.toBeNull()
      expect(res.body.data.titre.id).toEqual(titre.id)
    } else {
      expect(res.body.data.titre).toBeNull()
    }
  } else if (cible === 'demarches') {
    if (visible) {
      expect(res.body.data.titre.demarches).not.toBeNull()
      expect(res.body.data.titre.demarches![0]).not.toBeNull()
      expect(res.body.data.titre.demarches![0]!.id).toEqual(titre.demarches![0]!.id)
    } else {
      expect(res.body.data.titre ? res.body.data.titre.demarches : []).toEqual([])
    }
  } else if (cible === 'etapes') {
    if (visible) {
      expect(res.body.data.titre.demarches![0]!.etapes).not.toBeNull()
      expect(res.body.data.titre.demarches![0]!.etapes![0]!.id).toEqual(titre.demarches![0]!.etapes![0]!.id)
    } else {
      expect(res.body.data.titre.demarches![0]!.etapes).toEqual([])
    }
  }
}

export const creationCheck = async (pool: Pool, administrationId: string, creer: boolean, cible: string, titreTypeId: TitreTypeId) => {
  const administration = sortedAdministrations.find(a => a.id === administrationId)!

  if (cible === 'titres') {
    const titre = {
      nom: `${titreTypeId}-${cible}-admin-${administrationId}`,
      typeId: titreTypeId,
    }

    const titreCreerQuery = queryImport('titre-creer')
    const res = await graphQLCall(
      pool,
      titreCreerQuery,
      {
        titre,
      },
      {
        role: 'admin',
        administrationId: administration.id,
      }
    )

    if (creer) {
      expect(res.body.data).toMatchObject({
        titreCreer: { nom: titre.nom },
      })
    } else {
      expect(res.body.errors[0].message).toBe('permissions insuffisantes')
    }
  } else if (cible === 'demarches') {
    const titreCreated = await titreCreerSuper(pool, administrationId, titreTypeId)
    const res = await demarcheCreerProfil(pool, titreCreated.body.data.titreCreer.id, {
      role: 'admin',
      administrationId: administration.id,
    })

    if (creer) {
      expect(res.body.errors).toBe(undefined)
      expect(res.body.data).toMatchObject({ demarcheCreer: {} })
    } else {
      expect(res.body.errors[0].message).toBe('droits insuffisants')
    }
  } else if (cible === 'etapes') {
    const titreCreated = await titreCreerSuper(pool, administrationId, titreTypeId)

    const result = await demarcheCreerProfil(pool, titreCreated.body.data.titreCreer.id, { role: 'super' })

    expect(result.body.errors).toBe(undefined)

    const slug = result.body.data.demarcheCreer.slug

    const demarche = await TitresDemarches.query().findOne({ slug })

    const etapeTypeId = 'mfr'

    const sections = getSections(titreTypeId, demarche?.typeId, etapeTypeId)

    const heritageContenu = sections.reduce((acc, section) => {
      if (!acc[section.id]) {
        acc[section.id] = {}
      }

      section.elements?.forEach(e => {
        acc[section.id][e.id] = { actif: false }
      })

      return acc
    }, {} as any)

    const contenu = sections.reduce((acc, section) => {
      if (!acc[section.id]) {
        acc[section.id] = {}
      }

      section.elements?.forEach(e => {
        let value
        if (e.type === 'radio') {
          value = false
        } else if (e.type === 'text') {
          value = 'text'
        } else if (e.type === 'number' || e.type === 'integer') {
          value = 0
        } else if (e.type === 'select') {
          value = 'fakeId'
        }
        acc[section.id][e.id] = value
      })

      return acc
    }, {} as any)

    const documentTypesIds = getDocuments(titreTypeId, demarche?.typeId, etapeTypeId)
      .filter(({ optionnel }) => !optionnel)
      .map(({ id }) => id)
    const documentIds = []

    for (const documentTypeId of documentTypesIds) {
      const id = newEtapeDocumentId(toCaminoDate('2020-01-01'), documentTypeId)
      documentIds.push(id)
      //FIXME
      // await documentCreate({
      //   id,
      //   typeId: documentTypeId,
      //   date: toCaminoDate('2020-01-01'),
      //   fichier: true,
      // })
    }
    const res = await graphQLCall(
      pool,
      queryImport('titre-etape-creer'),
      {
        etape: {
          typeId: etapeTypeId,
          statutId: 'fai',
          titreDemarcheId: demarche?.id,
          date: '2022-01-01',
          duree: 10,
          heritageProps: ETAPE_HERITAGE_PROPS.reduce(
            (acc, prop) => {
              acc[prop] = { actif: false }

              return acc
            },
            {} as {
              [key: string]: { actif: boolean }
            }
          ),
          heritageContenu,
          contenu,
          substances: ['auru'],
          documentIds,
          geojson4326Perimetre: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [1, 2],
                    [1, 2],
                    [1, 2],
                    [1, 2],
                  ],
                ],
              ],
            },
          },
          geojsonOrigineGeoSystemeId: GEO_SYSTEME_IDS.WGS84,
          geojsonOriginePerimetre: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [1, 2],
                    [1, 2],
                    [1, 2],
                    [1, 2],
                  ],
                ],
              ],
            },
          },
        },
      },
      {
        role: 'super',
      }
    )

    if (creer) {
      expect(res.body.errors).toBe(undefined)
      expect(res.body.data).toMatchObject({ etapeCreer: {} })
    } else {
      expect(res.body.errors[0].message).toBe('droits insuffisants pour créer cette étape')
    }
  }
}

const titreCreerSuper = async (pool: Pool, administrationId: string, titreTypeId: string) =>
  graphQLCall(
    pool,
    queryImport('titre-creer'),
    {
      titre: {
        nom: `titre-${titreTypeId!}-cree-${administrationId!}`,
        typeId: titreTypeId!,
      },
    },
    {
      role: 'super',
    }
  )

const demarcheCreerProfil = async (pool: Pool, titreId: string, user: TestUser) => graphQLCall(pool, queryImport('titre-demarche-creer'), { demarche: { titreId, typeId: 'oct' } }, user)

const titreBuild = (
  {
    titreId,
    titreTypeId,
  }: {
    titreId: TitreId
    titreTypeId: TitreTypeId
  },
  administrationIdGestionnaire?: AdministrationId,
  administrationIdLocale?: AdministrationId,
  etapeTypeId?: EtapeTypeId
) => {
  const titre: ITitre = {
    id: titreId,
    nom: 'nom titre',
    typeId: titreTypeId,
    titreStatutId: 'val',
    propsTitreEtapesIds: { points: `${titreId}-demarche-id-etape-id` },
    demarches: [
      {
        id: newDemarcheId(`${titreId}-demarche-id`),
        titreId,
        typeId: 'oct',
        etapes: [
          {
            id: newEtapeId(`${titreId}-demarche-id-etape-id`),
            typeId: etapeTypeId || 'mcr',
            ordre: 0,
            titreDemarcheId: newDemarcheId(`${titreId}-demarche-id`),
            statutId: 'enc',
            date: toCaminoDate('2020-01-01'),
            administrationsLocales: administrationIdLocale ? [administrationIdLocale] : [],
          },
        ],
      },
    ],
    publicLecture: false,
  }

  return titre
}
