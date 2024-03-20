import {
  CaminoFiltre,
  activitesDownloadFormats,
  activitesFiltresNames,
  caminoFiltres,
  demarchesDownloadFormats,
  demarchesFiltresNames,
  entreprisesDownloadFormats,
  entreprisesFiltresNames,
  titresDownloadFormats,
  titresFiltresNames,
} from 'camino-common/src/filters.js'
import { DownloadFormat } from 'camino-common/src/rest.js'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'
import { ZodOptional, z } from 'zod'

type GenericFiltreValidator<T extends Readonly<CaminoFiltre[]>> = { [key in T[number]]: ZodOptional<(typeof caminoFiltres)[key]['validator']> }

const generateFilterValidator = <T extends readonly CaminoFiltre[]>(filtresNames: T) =>
  z.object<GenericFiltreValidator<T>>(
    filtresNames.reduce((acc, filtre) => {
      const validator = caminoFiltres[filtre].validator

      // Ceci est un hack pour le plugin camino QGIS, car la requête générée par le plugin ne respecte pas le "standard" pour les tableaux
      if (validator._def.typeName === 'ZodArray') {
        return {
          ...acc,
          [filtre]: validator
            .or(
              z
                .string()
                .transform(val => val.split(','))
                .pipe(validator)
            )
            .optional(),
        }
      }

      return {
        ...acc,
        [filtre]: validator.optional(),
      }
    }, {} as GenericFiltreValidator<T>)
  )

const commonValidator = <T extends Readonly<NonEmptyArray<string>>, D extends DownloadFormat = DownloadFormat>(colonnes: T, formats: Readonly<NonEmptyArray<D>>) => {
  return z.object({
    format: z
      .enum(formats)
      // @ts-ignore ici formats[0] est un string, on est sûr de sa valeur vu qu'on est sur un nonemptyarray
      .default(formats[0]),
    ordre: z.enum(['asc', 'desc']).default('asc'),
    colonne: z.enum(colonnes).optional(),
  })
}

const generateValidator = <T extends readonly CaminoFiltre[], U extends Readonly<NonEmptyArray<string>>, D extends DownloadFormat = DownloadFormat>(
  filtresNames: T,
  colonnes: U,
  formats: Readonly<NonEmptyArray<D>>
) => {
  return generateFilterValidator(filtresNames).merge(commonValidator(colonnes, formats))
}

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const activitesColonnes = ['titre', 'titreDomaine', 'titreType', 'titreStatut', 'titulaires', 'annee', 'periode', 'statut'] as const
export const activitesValidator = generateValidator(activitesFiltresNames, activitesColonnes, activitesDownloadFormats)

export type GetActivitesInput = z.infer<typeof activitesValidator>

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const titresColonnes = ['nom', 'domaine', 'type', 'statut'] as const
export const titresValidator = generateValidator(titresFiltresNames, titresColonnes, titresDownloadFormats).extend({
  // pour gérer les téléchargement quand on est sur la carte
  perimetre: z.array(z.coerce.number()).optional(),
})

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const demarchesColonnes = ['titreNom', 'titreDomaine', 'titreType', 'titreStatut', 'type', 'statut'] as const
export const demarchesValidator = generateValidator(demarchesFiltresNames, demarchesColonnes, demarchesDownloadFormats).extend({ travaux: z.coerce.boolean().default(false) })

// TODO 2023-08-22 merger ça avec le front (gestion des colonnes du tableau et le back)
const entreprisesColonnes = ['siren'] as const
export const entreprisesValidator = generateValidator(entreprisesFiltresNames, entreprisesColonnes, entreprisesDownloadFormats)
