/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { raw, RawBuilder } from 'objection'

import { IColonne, ITitre, ITitreColonneId } from '../../types'

import options, { FieldsTitre } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'
import { titresFieldsAdd } from './graph/fields-add'

import Titres, { DBTitre } from '../models/titres'
import { titresQueryModify } from './permissions/titres'
import { titresFiltersQueryModify } from './_titres-filters'
import TitresDemarches from '../models/titres-demarches'
import TitresEtapes from '../models/titres-etapes'
import { User } from 'camino-common/src/roles'
import { DepartementId } from 'camino-common/src/static/departement'
import { RegionId } from 'camino-common/src/static/region'
import { FacadesMaritimes } from 'camino-common/src/static/facades'
import { EditableTitre } from 'camino-common/src/titres'
import { TitreId } from 'camino-common/src/validators/titres'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

/**
 * Construit la requête pour récupérer certains champs de titres filtrés
 *
 * @param fields - propriétés demandées sur le titre
 * @param user - utilisateur
 * @param demandeEnCours - charge aussi les demandes en cours
 * @returns la requête
 *
 */
const titresQueryBuild = ({ fields }: { fields?: FieldsTitre }, user: DeepReadonly<User>, demandeEnCours?: boolean | null) => {
  const graph = fields ? graphBuild(titresFieldsAdd(fields), 'titre', fieldsFormat) : options.titres.graph

  const q = Titres.query().withGraphFetched(graph)

  titresQueryModify(q, user, demandeEnCours)

  return q
}

/**
 * Retourne un titre en fonction de son id
 *
 * @param id - id du titre
 * @param fields - propriétés demandées sur le titre
 * @param user - l’utilisateur
 * @returns un titre
 *
 */
export const titreGet = async (id: string, { fields, fetchHeritage }: { fields?: FieldsTitre; fetchHeritage?: boolean }, user: DeepReadonly<User>): Promise<DBTitre | undefined> => {
  const q = titresQueryBuild({ fields }, user)

  q.context({ fetchHeritage })

  return q
    .andWhere(b => {
      b.orWhere('titres.id', id)
      b.orWhere('titres.slug', id)
    })
    .first()
}

const titresColonnes = {
  nom: { id: 'nom' },
  domaine: { id: raw(`right( titres.type_id, 1 )`) },
  type: { id: raw(`left( titres.type_id, 2 )`) },
  statut: { id: 'titreStatutId' },
} as const satisfies Record<ITitreColonneId, IColonne<string | RawBuilder>>

/**
 * Retourne des titres en fonction de filtres
 *
 * @param filters - filtres à appliquer
 * @param fields - propriétés demandées
 * @param user - utilisateur
 * @returns une liste de titres
 *
 */
export const titresGet = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    perimetre,
    ids,
    domainesIds,
    typesIds,
    statutsIds,
    substancesIds,
    entreprisesIds,
    noms,
    references,
    communes,
    departements,
    regions,
    facadesMaritimes,
    slugs,
    demandeEnCours,
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: ITitreColonneId | null
    ordre?: 'asc' | 'desc' | null
    perimetre?: number[] | null
    ids?: string[] | null
    domainesIds?: string[] | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    substancesIds?: string[] | null
    entreprisesIds?: string[] | null
    noms?: string | null
    references?: string | null
    communes?: string | null
    departements?: DepartementId[] | null
    regions?: RegionId[] | null
    facadesMaritimes?: FacadesMaritimes[] | null
    slugs?: string[] | null
    demandeEnCours?: boolean | null
  } = {},
  { fields }: { fields?: FieldsTitre },
  user: DeepReadonly<User>
): Promise<ITitre[]> => {
  const q = titresQueryBuild({ fields }, user, demandeEnCours)

  if (slugs) {
    q.whereIn('titres.slug', slugs)
  }

  titresFiltersQueryModify(
    {
      ids,
      perimetre,
      domainesIds,
      typesIds,
      statutsIds,
      substancesIds,
      entreprisesIds,
      noms,
      references,
      communes,
      departements,
      regions,
      facadesMaritimes,
    },
    q
  )

  if (colonne) {
    q.orderBy(titresColonnes[colonne].id, ordre || 'asc')
  } else {
    if (noms?.length) {
      q.orderByRaw('case when LOWER(titres.nom) LIKE LOWER(?) then 0 else 1 end, titres.nom', [`${noms}%`])
    } else {
      q.orderBy('titres.nom')
    }
  }

  if (page && intervalle) {
    q.offset((page - 1) * intervalle)
  }

  if (intervalle) {
    q.limit(intervalle)
  }

  return q
}

/**
 * Retourne le nombre de titres filtrés
 *
 * @param filters - filtres
 * @param fields - propriétés demandées
 * @param user - utilisateur
 * @returns le nombre de titres
 *
 */
export const titresCount = async (
  {
    ids,
    domainesIds,
    typesIds,
    statutsIds,
    substancesIds,
    entreprisesIds,
    noms,
    references,
    communes,
    departements,
    regions,
    facadesMaritimes,
    demandeEnCours,
  }: {
    ids?: string[] | null
    domainesIds?: string[] | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    substancesIds?: string[] | null
    entreprisesIds?: string[] | null
    noms?: string | null
    references?: string | null
    communes?: string | null
    departements?: DepartementId[] | null
    regions?: RegionId[] | null
    facadesMaritimes?: FacadesMaritimes[] | null
    demandeEnCours?: boolean | null
  } = {},
  { fields }: { fields?: FieldsTitre },
  user: User
) => {
  const q = titresQueryBuild({ fields }, user, demandeEnCours)

  titresFiltersQueryModify(
    {
      ids,
      domainesIds,
      typesIds,
      statutsIds,
      substancesIds,
      entreprisesIds,
      noms,
      references,
      communes,
      departements,
      regions,
      facadesMaritimes,
    },
    q
  )

  return q.resultSize()
}

/**
 * Crée un nouveau titre
 *
 * @param titre - titre à créer
 * @param fields - Non utilisés
 * @param userId - id de l’utilisateur
 * @returns le nouveau titre
 *
 */
export const titreCreate = async (titre: Omit<ITitre, 'id'>, { fields }: { fields?: FieldsTitre }): Promise<DBTitre> => {
  const graph = fields ? graphBuild(titresFieldsAdd(fields), 'titre', fieldsFormat) : options.titres.graph

  return Titres.query().withGraphFetched(graph).insertGraph(titre, options.titres.update)
}

export const titreUpdate = async (id: TitreId, titre: Partial<DBTitre>) => Titres.query().patchAndFetchById(id, { ...titre, id })

export const titreArchive = async (id: TitreId) => {
  // archive le titre
  await titreUpdate(id, { archive: true })

  // archive les démarches du titre
  await TitresDemarches.query().patch({ archive: true }).where('titreId', id)

  // archive les étapes des démarches du titre
  await TitresEtapes.query().patch({ archive: true }).whereIn('titreDemarcheId', TitresDemarches.query().select('id').where('titreId', id))
}

export const titreUpsert = async (titre: EditableTitre) => {
  return Titres.query().upsertGraph(titre, options.titres.update)
}
