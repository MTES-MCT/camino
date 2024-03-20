import { titreGet, titresGet } from '../../database/queries/titres.js'
import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'
import { titresActivitesGet } from '../../database/queries/titres-activites.js'
import { entreprisesGet } from '../../database/queries/entreprises.js'

import { titreFormat, titresFormat } from '../_format/titres.js'
import { titreDemarcheFormat } from '../_format/titres-demarches.js'
import { titreActiviteFormat } from '../_format/titres-activites.js'
import { entrepriseFormat } from '../_format/entreprises.js'

import { tableConvert } from './_convert.js'
import { fileNameCreate } from '../../tools/file-name-create.js'

import { titreGeojsonPropertiesFormat, titresGeojsonFormat, titresTableFormat } from './format/titres.js'
import { titresDemarchesFormatTable } from './format/titres-demarches.js'
import { titresActivitesFormatTable } from './format/titres-activites.js'
import { entreprisesFormatTable } from './format/entreprises.js'

import { User } from 'camino-common/src/roles.js'
import { DownloadFormat } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { z, ZodType } from 'zod'
import { exhaustiveCheck, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'
import { getCommunesIndex } from '../../database/queries/communes.js'
import { FeatureCollection, GeojsonFeaturePoint } from 'camino-common/src/perimetre.js'
import { FieldsTitre } from '../../database/queries/_options'
import { titresValidator, demarchesValidator, activitesValidator, entreprisesValidator } from '../../business/utils/filters.js'

const formatCheck = (formats: string[], format: string) => {
  if (!formats.includes(format)) {
    throw new Error(`Format « ${format} » non supporté.`)
  }
}

const titreFields: FieldsTitre = {
  substancesEtape: { id: {} },
  titulaires: { id: {} },
  amodiataires: { id: {} },
  pointsEtape: { id: {} },
  demarches: {
    etapes: {
      id: {},
    },
  },
}

type GenericQueryInput<T extends ZodType> = { [key in keyof z.infer<T>]?: null | string }

interface ITitreInput {
  query: { format?: DownloadFormat }
  params: { id?: string | null }
}

export const titre =
  (pool: Pool) =>
  async ({ query: { format = 'geojson' }, params: { id } }: ITitreInput, user: User) => {
    formatCheck(['geojson'], format)

    const titre = await titreGet(id!, { fields: titreFields }, user)

    if (!titre) {
      return null
    }

    const titreFormatted = titreFormat(titre)

    const communesIndex = await getCommunesIndex(pool, titreFormatted.communes?.map(({ id }) => id) ?? [])

    if (titreFormatted.pointsEtape === undefined) {
      throw new Error('Le périmètre du titre n’est pas chargé')
    }

    if (titreFormatted.pointsEtape === null || isNullOrUndefined(titreFormatted.pointsEtape.geojson4326Perimetre)) {
      throw new Error('Il n’y a pas de périmètre pour ce titre')
    }

    const geojson4326Points: GeojsonFeaturePoint[] = titreFormatted.pointsEtape.geojson4326Points?.features ?? []

    const titreGeojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: [titreFormatted.pointsEtape.geojson4326Perimetre, ...geojson4326Points],

      properties: titreGeojsonPropertiesFormat(communesIndex, titreFormatted),
    }

    return {
      nom: fileNameCreate(titre.id, format),
      format,
      contenu: JSON.stringify(titreGeojson, null, 2),
    }
  }

export const titres =
  (pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof titresValidator> }, user: User) => {
    const params = titresValidator.parse(query)

    const titres = await titresGet(
      {
        ordre: params.ordre,
        colonne: params.colonne,
        typesIds: params.typesIds,
        domainesIds: params.domainesIds,
        statutsIds: params.statutsIds,
        ids: params.titresIds,
        entreprisesIds: params.entreprisesIds,
        substancesIds: params.substancesIds,
        references: params.references,
        communes: params.communes,
        departements: params.departements,
        regions: params.regions,
        facadesMaritimes: params.facadesMaritimes,
        perimetre: params.perimetre,
        demandeEnCours: true,
      },
      { fields: titreFields },
      user
    )

    const titresFormatted = titresFormat(titres)

    let contenu

    switch (params.format) {
      case 'csv':
      case 'xlsx':
      case 'ods':
        contenu = tableConvert('titres', await titresTableFormat(pool, titresFormatted), params.format)
        break
      case 'geojson':
        contenu = JSON.stringify(await titresGeojsonFormat(pool, titresFormatted), null, 2)
        break
      default:
        exhaustiveCheck(params.format)
    }

    return isNotNullNorUndefined(contenu)
      ? {
          nom: fileNameCreate(`titres-${titres.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

export const travaux =
  (pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof demarchesValidator> }, user: User) => {
    const funcDemarche = demarches(pool)

    return funcDemarche({ query: { ...query, travaux: 'true' } }, user)
  }
export const demarches =
  (pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof demarchesValidator> }, user: User) => {
    const params = demarchesValidator.parse(query)

    const titresDemarches = await titresDemarchesGet(
      {
        ordre: params.ordre,
        colonne: params.colonne,
        typesIds: [...(params.demarchesTypesIds ?? []), ...(params.travauxTypesIds ?? [])],
        statutsIds: params.demarchesStatutsIds,
        etapesInclues: isNotNullNorUndefined(params.etapesInclues) ? JSON.parse(params.etapesInclues) : null,
        etapesExclues: isNotNullNorUndefined(params.etapesExclues) ? JSON.parse(params.etapesExclues) : null,
        titresTypesIds: params.typesIds,
        titresDomainesIds: params.domainesIds,
        titresStatutsIds: params.statutsIds,
        titresIds: params.titresIds,
        titresEntreprisesIds: params.entreprisesIds,
        titresSubstancesIds: params.substancesIds,
        titresReferences: params.references,
        travaux: params.travaux,
      },
      {
        fields: {
          titre: {
            id: {},
            titulaires: { id: {} },
            amodiataires: { id: {} },
          },
          etapes: {
            id: {},
          },
        },
      },
      user
    )

    const demarchesFormatted = titresDemarches.map(titreDemarche => titreDemarcheFormat(titreDemarche))

    let contenu

    switch (params.format) {
      case 'csv':
      case 'xlsx':
      case 'ods':
        contenu = tableConvert('demarches', await titresDemarchesFormatTable(pool, demarchesFormatted), params.format)
        break
      default:
        exhaustiveCheck(params.format)
    }

    return isNotNullNorUndefined(contenu)
      ? {
          nom: fileNameCreate(`${params.travaux ? 'travaux' : 'demarches'}-${titresDemarches.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

export const activites =
  (pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof activitesValidator> }, user: User) => {
    const params = activitesValidator.parse(query)

    const titresActivites = await titresActivitesGet(
      {
        ordre: params.ordre,
        colonne: params.colonne,
        typesIds: params.activiteTypesIds,
        statutsIds: params.activiteStatutsIds,
        annees: params.annees,
        titresIds: params.titresIds,
        titresEntreprisesIds: params.entreprisesIds,
        titresSubstancesIds: params.substancesIds,
        titresReferences: params.references,
        titresTypesIds: params.typesIds,
        titresDomainesIds: params.domainesIds,
        titresStatutsIds: params.statutsIds,
      },
      {
        fields: {
          titre: { pointsEtape: { id: {} } },
        },
      },
      user
    )

    const titresActivitesFormatted = titresActivites.map(a => titreActiviteFormat(a))

    let contenu

    switch (params.format) {
      case 'csv':
      case 'xlsx':
      case 'ods':
        contenu = tableConvert('activites', await titresActivitesFormatTable(pool, titresActivitesFormatted), params.format)
        break
      default:
        exhaustiveCheck(params.format)
    }

    return isNotNullNorUndefined(contenu)
      ? {
          nom: fileNameCreate(`activites-${titresActivites.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

export const entreprises =
  (_pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof entreprisesValidator> }, user: User) => {
    const params = entreprisesValidator.parse(query)

    const entreprises = await entreprisesGet({ noms: params.nomsEntreprise }, {}, user)

    const entreprisesFormatted = entreprises.map(entrepriseFormat)

    let contenu

    switch (params.format) {
      case 'csv':
      case 'xlsx':
      case 'ods':
        contenu = tableConvert('entreprises', entreprisesFormatTable(entreprisesFormatted), params.format)
        break
      default:
        exhaustiveCheck(params.format)
    }

    return isNotNullNorUndefined(contenu)
      ? {
          nom: fileNameCreate(`entreprises-${entreprises.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }
