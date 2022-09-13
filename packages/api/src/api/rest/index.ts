import {
  IFormat,
  ITitreColonneId,
  ITitreDemarcheColonneId,
  ITitreActiviteColonneId
} from '../../types'

import { titreGet, titresGet } from '../../database/queries/titres'
import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { titresActivitesGet } from '../../database/queries/titres-activites'
import { entreprisesGet } from '../../database/queries/entreprises'
import { userGet } from '../../database/queries/utilisateurs'

import { titreFormat, titresFormat } from '../_format/titres'
import { titreDemarcheFormat } from '../_format/titres-demarches'
import { titreActiviteFormat } from '../_format/titres-activites'
import { entrepriseFormat } from '../_format/entreprises'

import { tableConvert } from './_convert'
import { fileNameCreate } from '../../tools/file-name-create'

import {
  titresGeojsonFormat,
  titreGeojsonFormat,
  titresTableFormat
} from './format/titres'
import { titresDemarchesFormatTable } from './format/titres-demarches'
import { titresActivitesFormatTable } from './format/titres-activites'
import { entreprisesFormatTable } from './format/entreprises'

import { matomo } from '../../tools/matomo'
import { stringSplit } from '../../database/queries/_utils'

const formatCheck = (formats: string[], format: string) => {
  if (!formats.includes(format)) {
    throw new Error(`Format « ${format} » non supporté.`)
  }
}

const titreFields = {
  type: { type: { id: {} } },
  domaine: { id: {} },
  references: { type: { id: {} } },
  substancesEtape: { id: {} },
  titulaires: { id: {} },
  amodiataires: { id: {} },
  surfaceEtape: { id: {} },
  points: { id: {} },
  communes: { id: {} },
  forets: { id: {} },
  administrationsLocales: { id: {} },
  administrationsGestionnaires: { id: {} }
}

interface ITitreInput {
  query: { format?: IFormat }
  params: { id?: string | null }
}

export const titre = async (
  { query: { format = 'json' }, params: { id } }: ITitreInput,
  userId?: string
) => {
  const user = await userGet(userId)

  formatCheck(['geojson', 'json'], format)

  const titre = await titreGet(id!, { fields: titreFields }, user)

  if (!titre) {
    return null
  }

  const titreFormatted = titreFormat(titre)
  let contenu

  if (format === 'geojson') {
    const titreGeojson = titreGeojsonFormat(titreFormatted)

    contenu = JSON.stringify(titreGeojson, null, 2)
  } else {
    contenu = JSON.stringify(titreFormatted, null, 2)
  }

  return {
    nom: fileNameCreate(titre.id, format),
    format,
    contenu
  }
}

interface ITitresQueryInput {
  format?: IFormat
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
  perimetre?: number[] | null
}

export const titres = async (
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
      perimetre
    }
  }: { query: ITitresQueryInput },
  userId?: string
) => {
  const user = await userGet(userId)

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
      perimetre
    },
    { fields: titreFields },
    user
  )

  const titresFormatted = titresFormat(titres)

  let contenu

  if (format === 'geojson') {
    const elements = titresGeojsonFormat(titresFormatted)

    contenu = JSON.stringify(elements, null, 2)
  } else if (['csv', 'xlsx', 'ods'].includes(format)) {
    const elements = titresTableFormat(titresFormatted)

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
      territoires
    })
      .filter(param => param[1] !== undefined)
      .map(param => param.join('='))
      .join('&')

    matomo.track({
      url: `${process.env.API_MATOMO_URL}/matomo.php?${url}`,
      e_c: 'camino-api',
      e_a: `titres-flux-${format}`
    })
  }

  return contenu
    ? {
        nom: fileNameCreate(`titres-${titres.length}`, format),
        format,
        contenu
      }
    : null
}

interface ITitresDemarchesQueryInput {
  format?: IFormat
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

export const demarches = async (
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
      travaux
    }
  }: { query: ITitresDemarchesQueryInput },
  userId?: string
) => {
  const user = await userGet(userId)

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
      travaux: travaux ? travaux === 'true' : undefined
    },
    {
      fields: {
        type: { etapesTypes: { id: {} } },
        titre: {
          id: {},
          titulaires: { id: {} },
          amodiataires: { id: {} },
          references: { id: {} }
        },
        etapes: {
          forets: { id: {} },
          communes: { id: {} },
          points: { id: {} },
          type: {
            id: {}
          }
        }
      }
    },
    user
  )

  const demarchesFormatted = titresDemarches.map(titreDemarche =>
    titreDemarcheFormat(titreDemarche)
  )

  let contenu

  if (['csv', 'xlsx', 'ods'].includes(format)) {
    const elements = titresDemarchesFormatTable(demarchesFormatted)

    contenu = tableConvert('demarches', elements, format)
  } else {
    contenu = JSON.stringify(demarchesFormatted, null, 2)
  }

  return contenu
    ? {
        nom: fileNameCreate(
          `${travaux === 'true' ? 'travaux' : 'demarches'}-${
            titresDemarches.length
          }`,
          format
        ),
        format,
        contenu
      }
    : null
}

interface ITitresActivitesQueryInput {
  format?: IFormat
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

export const activites = async (
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
      titresStatutsIds
    }
  }: { query: ITitresActivitesQueryInput },
  userId?: string
) => {
  const user = await userGet(userId)

  formatCheck(['json', 'xlsx', 'csv', 'ods'], format)

  const titresActivites = await titresActivitesGet(
    {
      ordre,
      colonne,
      typesIds: typesIds?.split(','),
      statutsIds: statutsIds?.split(','),
      annees: annees?.split(',').map(a => Number(a)),
      titresIds: titresIds?.split(','),
      titresEntreprisesIds: titresEntreprisesIds?.split(','),
      titresSubstancesIds: titresSubstancesIds?.split(','),
      titresReferences,
      titresTerritoires,
      titresTypesIds: titresTypesIds?.split(','),
      titresDomainesIds: titresDomainesIds?.split(','),
      titresStatutsIds: titresStatutsIds?.split(',')
    },
    {
      fields: {
        type: { id: {} },
        statut: { id: {} },
        titre: { id: {} }
      }
    },
    user
  )

  const titresActivitesFormatted = titresActivites.map(a =>
    titreActiviteFormat(a)
  )

  let contenu

  if (['csv', 'xlsx', 'ods'].includes(format)) {
    const elements = titresActivitesFormatTable(titresActivitesFormatted)

    contenu = tableConvert('activites', elements, format)
  } else {
    contenu = JSON.stringify(titresActivitesFormatted, null, 2)
  }

  return contenu
    ? {
        nom: fileNameCreate(`activites-${titresActivites.length}`, format),
        format,
        contenu
      }
    : null
}

interface IEntreprisesQueryInput {
  format?: IFormat
  noms?: string | null
}

export const entreprises = async (
  { query: { format = 'json', noms } }: { query: IEntreprisesQueryInput },
  userId?: string
) => {
  const user = await userGet(userId)

  formatCheck(['json', 'csv', 'xlsx', 'ods'], format)

  const entreprises = await entreprisesGet({ noms }, {}, user)

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
        contenu
      }
    : null
}
