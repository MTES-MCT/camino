import { ITitreColonneId, ITitreDemarcheColonneId, IUtilisateursColonneId, ITitreActiviteColonneId } from '../../types.js'

import { titreGet, titresGet } from '../../database/queries/titres.js'
import { titresDemarchesGet } from '../../database/queries/titres-demarches.js'
import { titresActivitesGet } from '../../database/queries/titres-activites.js'
import { entreprisesGet } from '../../database/queries/entreprises.js'
import { utilisateursGet } from '../../database/queries/utilisateurs.js'

import { titreFormat, titresFormat } from '../_format/titres.js'
import { titreDemarcheFormat } from '../_format/titres-demarches.js'
import { titreActiviteFormat } from '../_format/titres-activites.js'
import { entrepriseFormat } from '../_format/entreprises.js'

import { tableConvert } from './_convert.js'
import { fileNameCreate } from '../../tools/file-name-create.js'

import { titresGeojsonFormat, titreGeojsonFormat, titresTableFormat } from './format/titres.js'
import { titresDemarchesFormatTable } from './format/titres-demarches.js'
import { titresActivitesFormatTable } from './format/titres-activites.js'
import { entreprisesFormatTable } from './format/entreprises.js'

import { matomo } from '../../tools/matomo.js'
import { stringSplit } from '../../database/queries/_utils.js'
import { isRole, User } from 'camino-common/src/roles.js'
import { utilisateursFormatTable } from './format/utilisateurs.js'
import { isDepartementId } from 'camino-common/src/static/departement.js'
import { isRegionId } from 'camino-common/src/static/region.js'
import { isFacade } from 'camino-common/src/static/facades.js'
import { DownloadFormat } from 'camino-common/src/rest.js'
import { Pool } from 'pg'

const formatCheck = (formats: string[], format: string) => {
  if (!formats.includes(format)) {
    throw new Error(`Format « ${format} » non supporté.`)
  }
}

const titreFields = {
  type: { type: { id: {} } },
  substancesEtape: { id: {} },
  titulaires: { id: {} },
  amodiataires: { id: {} },
  surfaceEtape: { id: {} },
  points: { id: {} },
  pointsEtape: { id: {} },
  demarches: {
    type: { etapesTypes: { id: {} } },
    etapes: {
      points: { id: {} },
      type: { id: {} },
    },
  },
}

interface ITitreInput {
  query: { format?: DownloadFormat }
  params: { id?: string | null }
}

export const titre =
  (pool: Pool) =>
  async ({ query: { format = 'json' }, params: { id } }: ITitreInput, user: User) => {
    formatCheck(['geojson', 'json'], format)

    const titre = await titreGet(id!, { fields: titreFields }, user)

    if (!titre) {
      return null
    }

    const titreFormatted = titreFormat(titre)
    let contenu

    if (format === 'geojson') {
      const titreGeojson = await titreGeojsonFormat(pool, titreFormatted)

      contenu = JSON.stringify(titreGeojson, null, 2)
    } else {
      contenu = JSON.stringify(titreFormatted, null, 2)
    }

    return {
      nom: fileNameCreate(titre.id, format),
      format,
      contenu,
    }
  }

interface ITitresQueryInput {
  format?: DownloadFormat
  ordre?: 'asc' | 'desc' | null
  colonne?: ITitreColonneId | null
  domainesIds?: string | null
  typesIds?: string | null
  statutsIds?: string | null
  substancesIds?: string | null
  titresIds?: string | null
  entreprisesIds?: string | null
  references?: string | null
  territoires?: string | null
  communes?: string | null
  departements?: string | null
  regions?: string | null
  facadesMaritimes?: string | null
  perimetre?: number[] | null
}

export const titres =
  (pool: Pool) =>
  async (
    {
      query: {
        format = 'json',
        ordre,
        colonne,
        typesIds,
        domainesIds,
        statutsIds,
        substancesIds,
        titresIds,
        entreprisesIds,
        references,
        territoires,
        communes,
        departements,
        regions,
        facadesMaritimes,
        perimetre,
      },
    }: { query: ITitresQueryInput },
    user: User
  ) => {
    formatCheck(['json', 'xlsx', 'csv', 'ods', 'geojson'], format)

    const titres = await titresGet(
      {
        ordre,
        colonne,
        typesIds: typesIds?.split(','),
        domainesIds: domainesIds?.split(','),
        statutsIds: statutsIds?.split(','),
        ids: titresIds ? stringSplit(titresIds) : null,
        entreprisesIds: entreprisesIds ? stringSplit(entreprisesIds) : null,
        substancesIds: substancesIds ? stringSplit(substancesIds) : null,
        references,
        territoires,
        communes,
        departements: departements?.split(',').filter(isDepartementId),
        regions: regions?.split(',').filter(isRegionId),
        facadesMaritimes: facadesMaritimes?.split(',').filter(isFacade),
        perimetre,
        demandeEnCours: true,
      },
      { fields: titreFields },
      user
    )

    const titresFormatted = titresFormat(titres)

    let contenu

    if (format === 'geojson') {
      const elements = await titresGeojsonFormat(pool, titresFormatted)

      contenu = JSON.stringify(elements, null, 2)
    } else if (['csv', 'xlsx', 'ods'].includes(format)) {
      const elements = await titresTableFormat(pool, titresFormatted)

      contenu = tableConvert('titres', elements, format)
    } else {
      contenu = JSON.stringify(titresFormatted, null, 2)
    }

    if (matomo) {
      const url = Object.entries({
        format,
        ordre,
        colonne,
        typesIds,
        domainesIds,
        statutsIds,
        substancesIds,
        titresIds,
        entreprisesIds,
        references,
        territoires,
      })
        .filter(param => param[1] !== undefined)
        .map(param => param.join('='))
        .join('&')

      matomo.track({
        url: `${process.env.API_MATOMO_URL}/matomo.php?${url}`,
        e_c: 'camino-api',
        e_a: `titres-flux-${format}`,
      })
    }

    return contenu
      ? {
          nom: fileNameCreate(`titres-${titres.length}`, format),
          format,
          contenu,
        }
      : null
  }

interface ITitresDemarchesQueryInput {
  format?: DownloadFormat
  ordre?: 'asc' | 'desc' | null
  colonne?: ITitreDemarcheColonneId | null
  typesIds?: string | null
  statutsIds?: string | null
  etapesInclues?: string | null
  etapesExclues?: string | null
  titresTypesIds?: string | null
  titresDomainesIds?: string | null
  titresStatutsIds?: string | null
  titresIds?: string | null
  titresEntreprisesIds?: string | null
  titresSubstancesIds?: string | null
  titresReferences?: string | null
  titresTerritoires?: string | null
  travaux?: string | null
}

export const demarches =
  (pool: Pool) =>
  async (
    {
      query: {
        format = 'json',
        ordre,
        colonne,
        typesIds,
        statutsIds,
        etapesInclues,
        etapesExclues,
        titresTypesIds,
        titresDomainesIds,
        titresStatutsIds,
        titresIds,
        titresEntreprisesIds,
        titresSubstancesIds,
        titresReferences,
        titresTerritoires,
        travaux,
      },
    }: { query: ITitresDemarchesQueryInput },
    user: User
  ) => {
    formatCheck(['json', 'csv', 'ods', 'xlsx'], format)

    const titresDemarches = await titresDemarchesGet(
      {
        ordre,
        colonne,
        typesIds: typesIds?.split(','),
        statutsIds: statutsIds?.split(','),
        etapesInclues: etapesInclues ? JSON.parse(etapesInclues) : null,
        etapesExclues: etapesExclues ? JSON.parse(etapesExclues) : null,
        titresTypesIds: titresTypesIds?.split(','),
        titresDomainesIds: titresDomainesIds?.split(','),
        titresStatutsIds: titresStatutsIds?.split(','),
        titresIds: titresIds?.split(','),
        titresEntreprisesIds: titresEntreprisesIds?.split(','),
        titresSubstancesIds: titresSubstancesIds?.split(','),
        titresReferences,
        titresTerritoires,
        travaux: travaux ? travaux === 'true' : false,
      },
      {
        fields: {
          type: { etapesTypes: { id: {} } },
          titre: {
            id: {},
            titulaires: { id: {} },
            amodiataires: { id: {} },
          },
          etapes: {
            points: { id: {} },
            type: {
              id: {},
            },
          },
        },
      },
      user
    )

    const demarchesFormatted = titresDemarches.map(titreDemarche => titreDemarcheFormat(titreDemarche))

    let contenu

    if (['csv', 'xlsx', 'ods'].includes(format)) {
      const elements = await titresDemarchesFormatTable(pool, demarchesFormatted)

      contenu = tableConvert('demarches', elements, format)
    } else {
      contenu = JSON.stringify(demarchesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`${travaux === 'true' ? 'travaux' : 'demarches'}-${titresDemarches.length}`, format),
          format,
          contenu,
        }
      : null
  }

interface ITitresActivitesQueryInput {
  format?: DownloadFormat
  ordre?: 'asc' | 'desc' | null
  colonne?: ITitreActiviteColonneId | null
  typesIds?: string | null
  statutsIds?: string | null
  annees?: string | null
  titresIds?: string | null
  titresEntreprisesIds?: string | null
  titresSubstancesIds?: string | null
  titresReferences?: string | null
  titresTerritoires?: string | null
  titresTypesIds?: string | null
  titresDomainesIds?: string | null
  titresStatutsIds?: string | null
}

export const activites =
  (pool: Pool) =>
  async (
    {
      query: {
        format = 'json',
        ordre,
        colonne,
        typesIds,
        statutsIds,
        annees,
        titresIds,
        titresEntreprisesIds,
        titresSubstancesIds,
        titresReferences,
        titresTerritoires,
        titresTypesIds,
        titresDomainesIds,
        titresStatutsIds,
      },
    }: { query: ITitresActivitesQueryInput },
    user: User
  ) => {
    formatCheck(['json', 'xlsx', 'csv', 'ods'], format)

    const titresActivites = await titresActivitesGet(
      {
        ordre,
        colonne,
        typesIds: typesIds?.split(','),
        statutsIds: statutsIds?.split(','),
        annees: annees?.split(','),
        titresIds: titresIds?.split(','),
        titresEntreprisesIds: titresEntreprisesIds?.split(','),
        titresSubstancesIds: titresSubstancesIds?.split(','),
        titresReferences,
        titresTerritoires,
        titresTypesIds: titresTypesIds?.split(','),
        titresDomainesIds: titresDomainesIds?.split(','),
        titresStatutsIds: titresStatutsIds?.split(','),
      },
      {
        fields: {
          type: { id: {} },
          titre: { pointsEtape: { id: {} } },
        },
      },
      user
    )

    const titresActivitesFormatted = titresActivites.map(a => titreActiviteFormat(a))

    let contenu

    if (['csv', 'xlsx', 'ods'].includes(format)) {
      const elements = await titresActivitesFormatTable(pool, titresActivitesFormatted)

      contenu = tableConvert('activites', elements, format)
    } else {
      contenu = JSON.stringify(titresActivitesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`activites-${titresActivites.length}`, format),
          format,
          contenu,
        }
      : null
  }

interface IUtilisateursQueryInput {
  format?: DownloadFormat
  colonne?: IUtilisateursColonneId | null
  ordre?: 'asc' | 'desc' | null
  entrepriseIds?: string
  administrationIds?: string
  //  TODO 2022-06-14: utiliser un tableau de string plutôt qu'une chaine séparée par des ','
  roles?: string
  noms?: string | null
  emails?: string | null
}

export const utilisateurs = async ({ query: { format = 'json', colonne, ordre, entrepriseIds, administrationIds, roles, noms, emails } }: { query: IUtilisateursQueryInput }, user: User) => {
  formatCheck(['json', 'csv', 'ods', 'xlsx'], format)

  const utilisateurs = await utilisateursGet(
    {
      colonne,
      ordre,
      entreprisesIds: entrepriseIds?.split(','),
      administrationIds: administrationIds?.split(','),
      roles: roles?.split(',').filter(isRole) ?? [],
      noms,
      emails,
    },
    {},
    user
  )

  let contenu

  if (['csv', 'xlsx', 'ods'].includes(format)) {
    const elements = utilisateursFormatTable(utilisateurs)

    contenu = tableConvert('utilisateurs', elements, format)
  } else {
    contenu = JSON.stringify(utilisateurs, null, 2)
  }

  return contenu
    ? {
        nom: fileNameCreate(`utilisateurs-${utilisateurs.length}`, format),
        format,
        contenu,
      }
    : null
}

interface IEntreprisesQueryInput {
  format?: DownloadFormat
  noms?: string | null
  nomsEntreprise?: string | null
}

export const entreprises =
  (_pool: Pool) =>
  async ({ query: { format = 'json', noms, nomsEntreprise } }: { query: IEntreprisesQueryInput }, user: User) => {
    formatCheck(['json', 'csv', 'xlsx', 'ods'], format)

    const entreprises = await entreprisesGet({ noms: noms || nomsEntreprise }, {}, user)

    const entreprisesFormatted = entreprises.map(entrepriseFormat)

    let contenu

    if (['csv', 'xlsx', 'ods'].includes(format)) {
      const elements = entreprisesFormatTable(entreprisesFormatted)

      contenu = tableConvert('entreprises', elements, format)
    } else {
      contenu = JSON.stringify(entreprisesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`entreprises-${entreprises.length}`, format),
          format,
          contenu,
        }
      : null
  }
