import {
  IDemarcheType,
  IEtapeType,
  ITitre,
  ITitreTypeDemarcheTypeEtapeType
} from '../../src/types.js'

import { graphQLCall, queryImport } from './index.js'

import Titres from '../../src/database/models/titres.js'
import DemarchesTypes from '../../src/database/models/demarches-types.js'
import options from '../../src/database/queries/_options.js'
import {
  etapeTypeGet,
  titreTypeDemarcheTypeEtapeTypeGet
} from '../../src/database/queries/metas.js'
import { titreEtapePropsIds } from '../../src/business/utils/titre-etape-heritage-props-find.js'
import { etapeTypeSectionsFormat } from '../../src/api/_format/etapes-types.js'
import { Role } from 'camino-common/src/roles.js'
import {
  AdministrationId,
  sortedAdministrations
} from 'camino-common/src/static/administrations.js'
import {
  idGenerate,
  newDemarcheId
} from '../../src/database/models/_format/id-create.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes.js'
import { documentCreate } from '../../src/database/queries/documents.js'
import { isGestionnaire } from 'camino-common/src/static/administrationsTitresTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { expect } from 'vitest'
export const visibleCheck = async (
  administrationId: AdministrationId,
  visible: boolean,
  cible: 'titres' | 'demarches' | 'etapes',
  titreTypeId: TitreTypeId,
  locale: boolean,
  etapeTypeId?: EtapeTypeId
) => {
  const titreQuery = queryImport('titre')

  const administration = sortedAdministrations.find(
    a => a.id === administrationId
  )!

  const gestionnaire = isGestionnaire(administration.id)

  const titre = titreBuild(
    {
      titreId: `${titreTypeId}${
        locale ? '-local' : ''
      }-${cible}-admin-${administrationId}`,
      titreTypeId
    },
    gestionnaire ? administrationId : undefined,
    locale ? administrationId : undefined,
    etapeTypeId
  )

  await Titres.query().insertGraph(titre, options.titres.update)

  const res = await graphQLCall(
    titreQuery,
    { id: titre.id },
    'admin',
    administration.id
  )

  expect(res.body.errors).toBeUndefined()
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
      expect(res.body.data.titre.demarches![0]!.id).toEqual(
        titre.demarches![0]!.id
      )
    } else {
      expect(res.body.data.titre ? res.body.data.titre.demarches : []).toEqual(
        []
      )
    }
  } else if (cible === 'etapes') {
    if (visible) {
      expect(res.body.data.titre.demarches![0]!.etapes).not.toBeNull()
      expect(res.body.data.titre.demarches![0]!.etapes![0]!.id).toEqual(
        titre.demarches![0]!.etapes![0]!.id
      )
    } else {
      expect(res.body.data.titre.demarches![0]!.etapes).toEqual([])
    }
  }
}

export const creationCheck = async (
  administrationId: string,
  creer: boolean,
  cible: string,
  titreTypeId: TitreTypeId
) => {
  const administration = sortedAdministrations.find(
    a => a.id === administrationId
  )!

  if (cible === 'titres') {
    const titre = {
      nom: `${titreTypeId}-${cible}-admin-${administrationId}`,
      typeId: titreTypeId
    }

    const titreCreerQuery = queryImport('titre-creer')
    const res = await graphQLCall(
      titreCreerQuery,
      {
        titre
      },
      'admin',
      administration.id
    )

    if (creer) {
      expect(res.body.data).toMatchObject({
        titreCreer: { nom: titre.nom }
      })
    } else {
      expect(res.body.errors[0].message).toBe('permissions insuffisantes')
    }
  } else if (cible === 'demarches') {
    const titreCreated = await titreCreerSuper(administrationId, titreTypeId)
    const res = await demarcheCreerProfil(
      titreCreated.body.data.titreCreer.id,
      'admin',
      administration.id
    )

    if (creer) {
      expect(res.body.errors).toBeUndefined()
      expect(res.body.data).toMatchObject({ demarcheCreer: {} })
    } else {
      expect(res.body.errors[0].message).toBe('droits insuffisants')
    }
  } else if (cible === 'etapes') {
    const titreCreated = await titreCreerSuper(administrationId, titreTypeId)

    const demarcheCreated = await demarcheCreerProfil(
      titreCreated.body.data.titreCreer.id,
      'super'
    )

    expect(demarcheCreated.body.errors).toBeUndefined()

    const etapeTypeId = 'mfr'
    const etapeType = (await etapeTypeGet(etapeTypeId, {
      fields: {}
    })) as IEtapeType

    const demarcheType = (await DemarchesTypes.query()
      .withGraphFetched(options.demarchesTypes.graph)
      .findById(
        demarcheCreated.body.data.demarcheCreer.demarches[0].type!.id
      )) as IDemarcheType

    const tde = (await titreTypeDemarcheTypeEtapeTypeGet(
      {
        titreTypeId,
        demarcheTypeId: demarcheType.id,
        etapeTypeId: etapeType.id
      },
      { fields: { id: {} } }
    )) as ITitreTypeDemarcheTypeEtapeType

    const sections = etapeTypeSectionsFormat(etapeType.sections, tde.sections)

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

    const titreDemarcheId =
      demarcheCreated.body.data.demarcheCreer.demarches[0].id

    const documentTypesIds = getDocuments(
      titreTypeId,
      demarcheType.id,
      etapeTypeId
    )
      .filter(({ optionnel }) => !optionnel)
      .map(({ id }) => id)
    const documentIds = []

    for (const documentTypeId of documentTypesIds) {
      const id = idGenerate()
      documentIds.push(id)
      await documentCreate({
        id,
        typeId: documentTypeId,
        date: toCaminoDate('2020-01-01'),
        uri: 'https://camino.beta.gouv.fr'
      })
    }
    const res = await graphQLCall(
      queryImport('titre-etape-creer'),
      {
        etape: {
          typeId: etapeTypeId,
          statutId: 'fai',
          titreDemarcheId,
          date: '2022-01-01',
          duree: 10,
          heritageProps: titreEtapePropsIds.reduce(
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
          points: [
            {
              groupe: 1,
              contour: 1,
              point: 1,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 2,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 2 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 3,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 2, y: 1 } }
              ]
            },
            {
              groupe: 1,
              contour: 1,
              point: 4,
              references: [
                { geoSystemeId: '4326', coordonnees: { x: 1, y: 1 } }
              ]
            }
          ]
        }
      },
      'super'
    )

    if (creer) {
      expect(res.body.errors).toBeUndefined()
      expect(res.body.data).toMatchObject({ etapeCreer: {} })
    } else {
      expect(res.body.errors[0].message).toBe(
        'droits insuffisants pour créer cette étape'
      )
    }
  }
}

export const modificationCheck = async (
  administrationId: AdministrationId,
  modifier: boolean,
  cible: string,
  titreTypeId: TitreTypeId,
  locale?: boolean,
  etapeTypeId?: EtapeTypeId
) => {
  const administration = sortedAdministrations.find(
    a => a.id === administrationId
  )!

  const gestionnaire = isGestionnaire(administrationId)

  const titre = titreBuild(
    {
      titreId: `${titreTypeId}${
        locale ? '-local' : ''
      }${etapeTypeId}-${cible}-modification-admin-${administrationId}`,
      titreTypeId
    },
    gestionnaire ? administrationId : undefined,
    locale ? administrationId : undefined,
    etapeTypeId
  )
  await Titres.query().insertGraph(titre, options.titres.update)

  const res = await graphQLCall(
    queryImport('titre'),
    { id: titre.id },
    'admin',
    administration.id
  )

  if (cible === 'titres') {
    if (modifier) {
      expect(res.body.errors).toBeUndefined()
      expect(res.body.data.titre).toMatchObject({
        modification: true
      })
    } else {
      expect(
        res.body.data.titre ? res.body.data.titre.modification : null
      ).toBeNull()
    }
  } else if (cible === 'demarches') {
    if (modifier) {
      expect(res.body.errors).toBeUndefined()
      expect(res.body.data.titre.demarches![0]).toMatchObject({
        modification: true
      })
    } else {
      expect(res.body.errors).toBeUndefined()
      const demarches = res.body.data.titre.demarches
      const check = !demarches.length || !demarches[0].modification
      expect(check).toBeTruthy()
    }
  } else if (cible === 'etapes') {
    if (modifier) {
      expect(res.body.errors).toBeUndefined()
      expect(res.body.data.titre.demarches![0]!.etapes![0]).toMatchObject({
        modification: true
      })
    } else {
      const etapes = res.body.data.titre.demarches![0]!.etapes
      const check = !etapes.length || !etapes[0].modification
      expect(check).toBeTruthy()
    }
  }
}

const titreCreerSuper = async (administrationId: string, titreTypeId: string) =>
  graphQLCall(
    queryImport('titre-creer'),
    {
      titre: {
        nom: `titre-${titreTypeId!}-cree-${administrationId!}`,
        typeId: titreTypeId!
      }
    },
    'super'
  )

const demarcheCreerProfil = async (
  titreId: string,
  profil: Role,
  administrationId?: AdministrationId
) =>
  graphQLCall(
    queryImport('titre-demarche-creer'),
    { demarche: { titreId, typeId: 'oct' } },
    profil!,
    administrationId
  )

const titreBuild = (
  {
    titreId,
    titreTypeId
  }: {
    titreId: string
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
            id: `${titreId}-demarche-id-etape-id`,
            typeId: etapeTypeId || 'mcr',
            ordre: 0,
            titreDemarcheId: newDemarcheId(`${titreId}-demarche-id`),
            statutId: 'enc',
            date: toCaminoDate('2020-01-01'),
            administrationsLocales: administrationIdLocale
              ? [administrationIdLocale]
              : []
          }
        ]
      }
    ],
    publicLecture: false
  }

  return titre
}
