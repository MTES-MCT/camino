import { raw, QueryBuilder, RawBuilder } from 'objection'

import {
  ITitreActivite,
  IFields,
  IUtilisateur,
  ITitreActiviteColonneId,
  Index,
  IColonne
} from '../../types'

import options from './_options'
import { fieldsFormat } from './graph/fields-format'
import { fieldsTitreAdd } from './graph/fields-add'
import graphBuild from './graph/build'

import { titresFiltersQueryModify } from './_titres-filters'
import TitresActivites from '../models/titres-activites'
import {
  titresActivitesQueryModify,
  titresActivitesPropsQueryModify
} from './permissions/titres-activites'
import {
  isAdministrationAdmin,
  isAdministrationEditeur
} from 'camino-common/src/roles'

/**
 * Modifie la requête en fonction des paramètres de filtre
 * @param typesIds - tableau de type(s) d'activité
 * @param statutsIds - tableau de statut(s) d'activité
 * @param annees - année de l'activité
 * @param titresIds - chaîne de nom(s) de titre
 * @param titresEntreprisesIds - chaîne de nom(s) d'entreprise titulaire ou amodiataire d'un titre
 * @param titresSubstances - chaîne de substance(s) se rapportant à un titre
 * @param titresReferences - chaîne de référence(s) se rapportant à un titre
 * @param titresTerritoires - chaîne de territoire(s) se rapportant à un titre
 * @param titresTypesIds - tableau de type(s) de titre
 * @param titresDomainesIds - tableau de domaine(s)
 * @param titresStatutsIds - tableau de statut(s) de titre
 * @param q
 */

const titresActivitesFiltersQueryModify = (
  {
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
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: number[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTerritoires?: string | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  q: QueryBuilder<TitresActivites, TitresActivites[]>
) => {
  if (typesIds) {
    q.whereIn('titresActivites.typeId', typesIds)
  }

  if (annees) {
    q.whereIn('titresActivites.annee', annees)
  }

  if (statutsIds) {
    q.whereIn('titresActivites.statutId', statutsIds)
  }

  if (titresIds) {
    q.whereIn('titresActivites.titreId', titresIds)
  }

  titresFiltersQueryModify(
    {
      domainesIds: titresDomainesIds,
      typesIds: titresTypesIds,
      statutsIds: titresStatutsIds,
      ids: titresIds,
      entreprisesIds: titresEntreprisesIds,
      substancesIds: titresSubstancesIds,
      references: titresReferences,
      territoires: titresTerritoires
    },
    q,
    'titre',
    'titresActivites'
  )
}

/**
 * Construit le corps de la requête sur les activités (hors paramètres de pagination)
 *
 * @param fields - propriétés demandées
 * @param userId - utilisateur
 * @returns une requête d'activités
 *
 */

const titreActivitesQueryBuild = (
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fieldsTitreAdd(fields), 'activite', fieldsFormat)
    : options.titresActivites.graph

  const q = TitresActivites.query().withGraphFetched(graph)

  titresActivitesQueryModify(q, user)
  titresActivitesPropsQueryModify(q, user)

  // dans titresActivitesPropsQueryModify quand on est une administration on utilise les 3 colonnes suivantes pour une sous requête.
  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    q.groupBy(
      'titresActivites.id',
      'titre.type_id',
      'titre.propsTitreEtapesIds'
    )
  }

  return q
}

/**
 * Retourne une activité
 *
 * @param id - id de l'activité
 * @param fields - propriétés demandées
 * @param userId - utilisateur
 * @returns une activité
 *
 */

const titreActiviteGet = async (
  id: string,
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const q = titreActivitesQueryBuild({ fields }, user)

  if (!q) return undefined

  return q
    .andWhere(b => {
      b.orWhere('titresActivites.id', id)
      b.orWhere('titresActivites.slug', id)
    })
    .first()
}

const titresActivitesColonnes = {
  titre: {
    id: 'titre.nom',
    relation: 'titre',
    groupBy: true
  },
  titreDomaine: { id: 'titre.domaineId', relation: 'titre', groupBy: true },
  titreType: {
    id: 'titre:type:type.nom',
    relation: 'titre.type.type',
    groupBy: true
  },
  titreStatut: { id: 'titre.statutId', relation: 'titre', groupBy: true },
  titulaires: {
    // trie par concaténation des titulaires du titre de l'activité
    id: raw(`STRING_AGG (
    "titre:titulaires"."nom",
    ';'
    order by "titre:titulaires"."nom"
  )`),
    relation: 'titre.titulaires',
    groupBy: false
  },
  annee: { id: 'annee' },
  periode: { id: 'periodeId' },
  statut: { id: 'statutId' }
} as Index<IColonne<string | RawBuilder>>

/**
 * Retourne les activités
 *
 * @param page - numéro de page
 * @param intervalle - nombre d'éléments par page
 * @param ordre - ordre de tri
 * @param colonne - colonne de tri
 * @param typesIds - tableau de type(s) d'activité
 * @param statutsIds - tableau de statut(s) d'activité
 * @param annees - année de l'activité
 * @param titresIds - chaîne de nom(s) de titre
 * @param titresEntreprisesIds - chaîne de nom(s) d'entreprise titulaire ou amodiataire d'un titre
 * @param titresSubstances - chaîne de substance(s) se rapportant à un titre
 * @param titresReferences - chaîne de référence(s) se rapportant à un titre
 * @param titresTerritoires - chaîne de territoire(s) se rapportant à un titre
 * @param titresTypesIds - tableau de type(s) de titre
 * @param titresDomainesIds - tableau de domaine(s)
 * @param titresStatutsIds - tableau de statut(s) de titre
 * @param fields - propriétés demandées
 * @param user - utilisateur
 * @returns une liste d'activités
 *
 */

const titresActivitesGet = async (
  {
    page,
    intervalle,
    ordre,
    colonne,
    typesIds,
    statutsIds,
    annees,
    titresEntreprisesIds,
    titresSubstancesIds,
    titresReferences,
    titresTerritoires,
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
    titresIds
  }: {
    page?: number | null
    intervalle?: number | null
    ordre?: 'asc' | 'desc' | null
    colonne?: ITitreActiviteColonneId | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: number[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTerritoires?: string | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
  },
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const q = titreActivitesQueryBuild({ fields }, user)

  titresActivitesFiltersQueryModify(
    {
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
    },
    q
  )

  if (!q) return []

  if (colonne) {
    if (titresActivitesColonnes[colonne].relation) {
      q.leftJoinRelated(titresActivitesColonnes[colonne].relation!)
      q.groupBy('titresActivites.id')

      if (titresActivitesColonnes[colonne].groupBy) {
        q.groupBy(titresActivitesColonnes[colonne].id)
      }
    }
    q.orderBy(titresActivitesColonnes[colonne].id, ordre || 'asc')
  } else {
    q.orderBy('titresActivites.titreId')
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
 * Retourne un total d'activités
 *
 * @param typesIds - tableau de type(s) d'activité
 * @param statutsIds - tableau de statut(s) d'activité
 * @param annees - année de l'activité
 * @param titresIds - chaîne de nom(s) de titre
 * @param titresEntreprisesIds - chaîne de nom(s) d'entreprise titulaire ou amodiataire d'un titre
 * @param titresSubstances - chaîne de substance(s) se rapportant à un titre
 * @param titresReferences - chaîne de référence(s) se rapportant à un titre
 * @param titresTerritoires - chaîne de territoire(s) se rapportant à un titre
 * @param titresTypesIds - tableau de type(s) de titre
 * @param titresDomainesIds - tableau de domaine(s)
 * @param titresStatutsIds - tableau de statut(s) de titre
 * @param fields - propriétés demandées
 * @param user - utilisateur
 * @returns un entier
 *
 */

const titresActivitesCount = async (
  {
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
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: number[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTerritoires?: string | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const q = titreActivitesQueryBuild({ fields }, user)

  titresActivitesFiltersQueryModify(
    {
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
    },
    q
  )

  if (!q) return 0

  return q.resultSize()
}

const titresActivitesUpsert = async (titreActivites: ITitreActivite[]) =>
  TitresActivites.query()
    .withGraphFetched(options.titresActivites.graph)
    .upsertGraph(titreActivites, options.titresActivites.update)

const titreActiviteUpdate = async (
  id: string,
  titreActivite: Partial<ITitreActivite>
) => TitresActivites.query().patchAndFetchById(id, { ...titreActivite, id })

const titreActiviteDelete = async (
  id: string,
  { fields }: { fields?: IFields }
) => {
  const graph = fields
    ? graphBuild(fieldsTitreAdd(fields), 'activite', fieldsFormat)
    : options.titresActivites.graph

  return TitresActivites.query()
    .withGraphFetched(graph)
    .deleteById(id)
    .returning('*')
}

export {
  titreActiviteGet,
  titresActivitesCount,
  titresActivitesUpsert,
  titresActivitesGet,
  titreActiviteUpdate,
  titreActiviteDelete
}
