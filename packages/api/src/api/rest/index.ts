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
import { User } from 'camino-common/src/roles.js'
import { utilisateursFormatTable } from './format/utilisateurs.js'
import {
  CaminoFiltre,
  caminoFiltres,
  demarchesDownloadFormats,
  demarchesFiltresNames,
  titresFiltresNames,
  titresDownloadFormats,
  activitesFiltresNames,
  activitesDownloadFormats,
  utilisateursFiltresNames,
  utilisateursDownloadFormats,
  entreprisesFiltresNames,
  entreprisesDownloadFormats,
} from 'camino-common/src/filters.js'
import { DownloadFormat } from 'camino-common/src/rest.js'
import { Pool } from 'pg'
import { z, ZodOptional, ZodType } from 'zod'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'

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

type GenericFiltreValidator<T extends Readonly<CaminoFiltre[]>> = { [key in T[number]]: ZodOptional<(typeof caminoFiltres)[key]['validator']> }

const generateFilterValidator = <T extends readonly CaminoFiltre[]>(filtresNames: T) =>
  z.object<GenericFiltreValidator<T>>(
    filtresNames.reduce(
      (acc, filtre) => ({
        ...acc,
        [filtre]: caminoFiltres[filtre].validator.optional(),
      }),
      {} as GenericFiltreValidator<T>
    )
  )
const commonValidator = <T extends Readonly<NonEmptyArray<string>>>(colonnes: T, formats: Readonly<['json', ...DownloadFormat[]]>) =>
  z.object({
    format: z.enum(formats).default('json'),
    ordre: z.enum(['asc', 'desc']).default('asc'),
    colonne: z.enum(colonnes).optional(),
  })

const generateValidator = <T extends readonly CaminoFiltre[], U extends Readonly<NonEmptyArray<string>>>(filtresNames: T, colonnes: U, formats: Readonly<['json', ...DownloadFormat[]]>) => {
  return generateFilterValidator(filtresNames).merge(commonValidator(colonnes, formats))
}
type GenericQueryInput<T extends ZodType> = { [key in keyof z.infer<T>]: null | string }

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

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const titresColonnes = ['nom', 'domaine', 'coordonnees', 'type', 'statut', 'activites', 'titulaires'] as const
const titresValidator = generateValidator(titresFiltresNames, titresColonnes, titresDownloadFormats).extend({
  // legacy pour le plugin qgis camino
  territoires: z.string().optional(),
  // pour gérer les téléchargement quand on est sur la carte
  perimetre: z.array(z.coerce.number()).optional(),
})

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
        territoires: params.territoires,
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

    if (params.format === 'geojson') {
      const elements = await titresGeojsonFormat(pool, titresFormatted)

      contenu = JSON.stringify(elements, null, 2)
    } else if (['csv', 'xlsx', 'ods'].includes(params.format)) {
      const elements = await titresTableFormat(pool, titresFormatted)

      contenu = tableConvert('titres', elements, params.format)
    } else {
      contenu = JSON.stringify(titresFormatted, null, 2)
    }

    if (matomo) {
      const url = Object.entries({
        format: params.format,
        ordre: params.ordre,
        colonne: params.colonne,
        typesIds: params.typesIds,
        domainesIds: params.domainesIds,
        statutsIds: params.statutsIds,
        substancesIds: params.substancesIds,
        titresIds: params.titresIds,
        entreprisesIds: params.entreprisesIds,
        references: params.references,
        territoires: params.territoires,
      })
        .filter(param => param[1] !== undefined)
        .map(param => param.join('='))
        .join('&')

      matomo.track({
        url: `${process.env.API_MATOMO_URL}/matomo.php?${url}`,
        e_c: 'camino-api',
        e_a: `titres-flux-${params.format}`,
      })
    }

    return contenu
      ? {
          nom: fileNameCreate(`titres-${titres.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const demarchesColonnes = ['titreNom', 'titreDomaine', 'titreType', 'titreStatut', 'type', 'statut'] as const
const demarchesValidator = generateValidator(demarchesFiltresNames, demarchesColonnes, demarchesDownloadFormats).extend({ travaux: z.coerce.boolean().default(false) })

export const demarches =
  (pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof demarchesValidator> }, user: User) => {
    const params = demarchesValidator.parse(query)

    const titresDemarches = await titresDemarchesGet(
      {
        ordre: params.ordre,
        colonne: params.colonne,
        typesIds: params.demarchesTypesIds,
        statutsIds: params.demarchesStatutsIds,
        etapesInclues: params.etapesInclues ? JSON.parse(params.etapesInclues) : null,
        etapesExclues: params.etapesExclues ? JSON.parse(params.etapesExclues) : null,
        titresTypesIds: params.typesIds,
        titresDomainesIds: params.domainesIds,
        titresStatutsIds: params.statutsIds,
        titresIds: params.titresIds,
        titresEntreprisesIds: params.entreprisesIds,
        titresSubstancesIds: params.substancesIds,
        titresReferences: params.references,
        titresTerritoires: params.titresTerritoires,
        travaux: params.travaux,
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

    if (['csv', 'xlsx', 'ods'].includes(params.format)) {
      const elements = await titresDemarchesFormatTable(pool, demarchesFormatted)

      contenu = tableConvert('demarches', elements, params.format)
    } else {
      contenu = JSON.stringify(demarchesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`${params.travaux ? 'travaux' : 'demarches'}-${titresDemarches.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const activitesColonnes = ['titre', 'titreDomaine', 'titreType', 'titreStatut', 'titulaires', 'annee', 'periode', 'statut'] as const
const activitesValidator = generateValidator(activitesFiltresNames, activitesColonnes, activitesDownloadFormats)

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
        titresTerritoires: params.titresTerritoires,
        titresTypesIds: params.typesIds,
        titresDomainesIds: params.domainesIds,
        titresStatutsIds: params.statutsIds,
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

    if (['csv', 'xlsx', 'ods'].includes(params.format)) {
      const elements = await titresActivitesFormatTable(pool, titresActivitesFormatted)

      contenu = tableConvert('activites', elements, params.format)
    } else {
      contenu = JSON.stringify(titresActivitesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`activites-${titresActivites.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const utilisateursColonnes = ['nom', 'prenom', 'email', 'role'] as const
const utilisateursValidator = generateValidator(utilisateursFiltresNames, utilisateursColonnes, utilisateursDownloadFormats)

export const utilisateurs = async ({ query }: { query: GenericQueryInput<typeof utilisateursValidator> }, user: User) => {
  const params = utilisateursValidator.parse(query)

  const utilisateurs = await utilisateursGet(
    {
      colonne: params.colonne,
      ordre: params.ordre,
      entreprisesIds: params.entreprisesIds,
      administrationIds: params.administrationIds,
      roles: params.roles,
      noms: params.nomsUtilisateurs,
      emails: params.emails,
    },
    {},
    user
  )

  let contenu

  if (['csv', 'xlsx', 'ods'].includes(params.format)) {
    const elements = utilisateursFormatTable(utilisateurs)

    contenu = tableConvert('utilisateurs', elements, params.format)
  } else {
    contenu = JSON.stringify(utilisateurs, null, 2)
  }

  return contenu
    ? {
        nom: fileNameCreate(`utilisateurs-${utilisateurs.length}`, params.format),
        format: params.format,
        contenu,
      }
    : null
}

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const entreprisesColonnes = ['siren'] as const
const entreprisesValidator = generateValidator(entreprisesFiltresNames, entreprisesColonnes, entreprisesDownloadFormats)

export const entreprises =
  (_pool: Pool) =>
  async ({ query }: { query: GenericQueryInput<typeof entreprisesValidator> }, user: User) => {
    const params = entreprisesValidator.parse(query)

    const entreprises = await entreprisesGet({ noms: params.nomsEntreprise }, {}, user)

    const entreprisesFormatted = entreprises.map(entrepriseFormat)

    let contenu

    if (['csv', 'xlsx', 'ods'].includes(params.format)) {
      const elements = entreprisesFormatTable(entreprisesFormatted)

      contenu = tableConvert('entreprises', elements, params.format)
    } else {
      contenu = JSON.stringify(entreprisesFormatted, null, 2)
    }

    return contenu
      ? {
          nom: fileNameCreate(`entreprises-${entreprises.length}`, params.format),
          format: params.format,
          contenu,
        }
      : null
  }
