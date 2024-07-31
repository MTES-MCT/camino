/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ITitre } from '../../src/types'

import { graphQLCall, queryImport, restNewPostCall, restPostCall } from './index'

import Titres from '../../src/database/models/titres'
import options from '../../src/database/queries/_options'
import { newDemarcheId, newTitreId, newEtapeId, idGenerate } from '../../src/database/models/_format/id-create'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { toCaminoDate } from 'camino-common/src/date'
import { expect } from 'vitest'
import { AdministrationId, sortedAdministrations } from 'camino-common/src/static/administrations'
import { TestUser } from 'camino-common/src/tests-utils'
import type { Pool } from 'pg'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { TitreId } from 'camino-common/src/validators/titres'
import TitresDemarches from '../../src/database/models/titres-demarches'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes'
import { DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { copyFileSync, mkdirSync } from 'node:fs'
import { ETAPE_IS_NOT_BROUILLON, TempEtapeDocument } from 'camino-common/src/etape'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { userSuper } from '../../src/database/user-super'
import { defaultHeritageProps } from 'camino-common/src/etape-form'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { HTTP_STATUS } from 'camino-common/src/http'
import { titreCreate } from '../../src/database/queries/titres'

const dir = `${process.cwd()}/files/tmp/`

export const testDocumentCreateTemp = (typeId: DocumentTypeId): TempEtapeDocument => {
  const fileName = `existing_temp_file_${idGenerate()}`
  mkdirSync(dir, { recursive: true })
  copyFileSync(`./src/tools/small.pdf`, `${dir}/${fileName}`)

  return {
    etape_document_type_id: typeId,
    entreprises_lecture: true,
    public_lecture: true,
    description: 'desc',
    temp_document_name: tempDocumentNameValidator.parse(fileName),
  }
}

export const visibleCheck = async (
  pool: Pool,
  administrationId: AdministrationId,
  visible: boolean,
  cible: 'titres' | 'demarches' | 'etapes',
  titreTypeId: TitreTypeId,
  locale: boolean,
  etapeTypeId?: EtapeTypeId
): Promise<void> => {
  const titreQuery = queryImport('titre')

  const administration = sortedAdministrations.find(a => a.id === administrationId)!

  const titre = titreBuild(
    {
      titreId: newTitreId(`${titreTypeId}${locale ? '-local' : ''}-${cible}-admin-${administrationId}`),
      titreTypeId,
    },
    locale ? administrationId : undefined,
    etapeTypeId
  )

  await Titres.query().upsertGraph(titre, options.titres.update)

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
  const titreRes = res.body.data.titres.elements[0] ?? null
  if (cible === 'titres') {
    if (visible) {
      expect(titreRes).not.toBeNull()
      expect(titreRes.id).toEqual(titre.id)
    } else {
      expect(titreRes).toBeNull()
    }
  } else if (cible === 'demarches') {
    if (visible) {
      expect(titreRes.demarches).not.toBeNull()
      expect(titreRes.demarches![0]).not.toBeNull()
      expect(titreRes.demarches![0]!.id).toEqual(titre.demarches![0]!.id)
    } else {
      expect(titreRes ? titreRes.demarches : []).toEqual([])
    }
  } else if (cible === 'etapes') {
    if (visible) {
      expect(titreRes.demarches![0]!.etapes).not.toBeNull()
      expect(titreRes.demarches![0]!.etapes![0]!.id).toEqual(titre.demarches![0]!.etapes![0]!.id)
    } else {
      if (isNotNullNorUndefined(titreRes?.demarches?.[0])) {
        expect(titreRes.demarches![0]!.etapes).toEqual([])
      }
    }
  }
}

export const creationCheck = async (pool: Pool, administrationId: string, creer: boolean, cible: string, titreTypeId: TitreTypeId): Promise<void> => {
  const administration = sortedAdministrations.find(a => a.id === administrationId)!

  if (cible === 'titres') {
    const titre = {
      nom: `${titreTypeId}-${cible}-admin-${administrationId}`,
      titreTypeId,
      references: [],
      titreFromIds: [],
    }

    const res = await restNewPostCall(
      pool,
      '/rest/titres',
      {},
      {
        role: 'admin',
        administrationId: administration.id,
      },
      titre
    )
    if (creer) {
      expect(res.statusCode).toBe(HTTP_STATUS.OK)
    } else {
      expect(res.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
    }
  } else if (cible === 'demarches') {
    const titreCreated = await titreCreateSuper(pool, administrationId, titreTypeId)
    const res = await demarcheCreerProfil(pool, titreCreated, {
      role: 'admin',
      administrationId: administration.id,
    })

    if (creer) {
      expect(res.body.errors).toBe(undefined)
      expect(res.body.data).toMatchObject({ demarcheCreer: {} })
    } else {
      expect(res.body.errors).toHaveLength(1)
    }
  } else if (cible === 'etapes') {
    const titreCreated = await titreCreateSuper(pool, administrationId, titreTypeId)

    const result = await demarcheCreerProfil(pool, titreCreated, { role: 'super' })

    expect(result.body.errors).toBe(undefined)

    const slug = result.body.data.demarcheCreer.slug

    const demarche = await TitresDemarches.query().findOne({ slug })
    expect(demarche).not.toBeUndefined()
    expect(demarche).not.toBeNull()
    if (isNullOrUndefined(demarche)) {
      throw new Error('pour typescript')
    }

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

    const documentTypesIds = getDocuments(titreTypeId, demarche.typeId, etapeTypeId)
      .filter(({ optionnel }) => !optionnel)
      .map(({ id }) => id)
    const etapeDocuments = []

    for (const documentTypeId of documentTypesIds) {
      etapeDocuments.push(testDocumentCreateTemp(documentTypeId))
    }
    const res = await restPostCall(pool, '/rest/etapes', {}, userSuper, {
      typeId: etapeTypeId,
      statutId: 'fai',
      titreDemarcheId: demarche.id,
      date: toCaminoDate('2022-01-01'),
      etapeAvis: [],
      duree: 10,
      dateDebut: null,
      dateFin: null,
      geojson4326Points: null,
      geojsonOriginePoints: null,
      geojsonOrigineForages: null,
      titulaireIds: [],
      amodiataireIds: [],
      note: { valeur: '', is_avertissement: false },
      entrepriseDocumentIds: [],
      heritageProps: defaultHeritageProps,
      heritageContenu,
      contenu,
      substances: ['auru'],
      etapeDocuments,
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
    })

    if (creer) {
      expect(res.statusCode).toBe(HTTP_STATUS.OK)
    } else {
      expect(res.body.errors[0].message).toBe('droits insuffisants pour créer cette étape')
    }
  }
}

const titreCreateSuper = async (_pool: Pool, administrationId: string, titreTypeId: TitreTypeId) => {
  const titre = await titreCreate({ nom: `titre-${titreTypeId!}-cree-${administrationId!}`, typeId: titreTypeId, titreStatutId: 'ind', propsTitreEtapesIds: {} }, {})

  return titre.id
}

const demarcheCreerProfil = async (pool: Pool, titreId: string, user: TestUser) => graphQLCall(pool, queryImport('titre-demarche-creer'), { demarche: { titreId, typeId: 'oct' } }, user)

const titreBuild = (
  {
    titreId,
    titreTypeId,
  }: {
    titreId: TitreId
    titreTypeId: TitreTypeId
  },
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
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
