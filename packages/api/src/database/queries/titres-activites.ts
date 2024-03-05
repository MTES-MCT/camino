import { raw, QueryBuilder, RawBuilder } from 'objection'

import { ITitreActivite, ITitreActiviteColonneId, Index, IColonne } from '../../types.js'

import options, { FieldsActivite } from './_options.js'
import { fieldsFormat } from './graph/fields-format.js'
import { fieldsTitreAdd } from './graph/fields-add.js'
import graphBuild from './graph/build.js'

import { titresFiltersQueryModify } from './_titres-filters.js'
import TitresActivites from '../models/titres-activites.js'
import { titresActivitesQueryModify } from './permissions/titres-activites.js'
import { User } from 'camino-common/src/roles.js'
import { DepartementId } from 'camino-common/src/static/departement.js'
import { ActiviteId } from 'camino-common/src/activite.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'

/**
 * Modifie la requête en fonction des paramètres de filtre
 * @param typesIds - tableau de type(s) d'activité
 * @param statutsIds - tableau de statut(s) d'activité
 * @param annees - année de l'activité
 * @param titresIds - chaîne de nom(s) de titre
 * @param titresEntreprisesIds - chaîne de nom(s) d'entreprise titulaire ou amodiataire d'un titre
 * @param titresSubstances - chaîne de substance(s) se rapportant à un titre
 * @param titresReferences - chaîne de référence(s) se rapportant à un titre
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
    titresDepartements,
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresDepartements?: DepartementId[] | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  q: QueryBuilder<TitresActivites, TitresActivites[]>
) => {
  if (isNotNullNorUndefinedNorEmpty(typesIds)) {
    q.whereIn('titresActivites.typeId', typesIds)
  }

  if (isNotNullNorUndefinedNorEmpty(annees)) {
    q.whereIn('titresActivites.annee', annees)
  }

  if (isNotNullNorUndefinedNorEmpty(statutsIds)) {
    q.whereIn('titresActivites.activiteStatutId', statutsIds)
  }

  if (isNotNullNorUndefinedNorEmpty(titresIds)) {
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
      departements: titresDepartements,
    },
    q,
    'titre',
    'titresActivites'
  )
}

const titreActivitesQueryBuild = ({ fields }: { fields?: FieldsActivite }, user: User) => {
  const graph = fields ? graphBuild(fieldsTitreAdd(fields), 'activite', fieldsFormat) : options.titresActivites.graph

  const q = TitresActivites.query().withGraphFetched(graph)

  titresActivitesQueryModify(q, user)

  return q
}

const titreActiviteGet = async (id: string, { fields }: { fields?: FieldsActivite }, user: User) => {
  const q = titreActivitesQueryBuild({ fields }, user)

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
  },
  titreDomaine: { id: 'titre.domaineId', relation: 'titre' },
  titreType: {
    id: raw(`left( titre.type_id, 2 )`),
    relation: 'titre',
  },
  titreStatut: { id: 'titre.titreStatutId', relation: 'titre' },
  annee: { id: 'annee' },
  periode: { id: 'periodeId' },
  statut: { id: 'activiteStatutId' },
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
    titresDepartements,
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
    titresIds,
  }: {
    page?: number | null
    intervalle?: number | null
    ordre?: 'asc' | 'desc' | null
    colonne?: ITitreActiviteColonneId | null
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresDepartements?: DepartementId[] | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
    titresIds?: string[] | null
  },
  { fields }: { fields?: FieldsActivite },
  user: User
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
      titresDepartements,
      titresTypesIds,
      titresDomainesIds,
      titresStatutsIds,
    },
    q
  )

  if (colonne) {
    const relation = titresActivitesColonnes[colonne].relation
    if (isNotNullNorUndefined(relation)) {
      q.leftJoinRelated(relation)
    }
    q.orderBy([{ column: titresActivitesColonnes[colonne].id, order: ordre || 'asc' }, 'titresActivites.annee', 'titresActivites.periode_id', 'titresActivites.id'])
  } else {
    // Il faut ajouter cet orderBy systématiquement. Car on peut trier par le nom de titre, et ce titre peut avoir beaucoup de rapports. Donc la requête peut changer l’ordre pour ne pas être consistant entre ces lignes qui ont le même titre.
    q.orderBy('titresActivites.id')
  }

  if (isNotNullNorUndefined(page) && isNotNullNorUndefined(intervalle) && page > 0 && intervalle > 0) {
    q.offset((page - 1) * intervalle)
  }

  if (isNotNullNorUndefined(intervalle) && intervalle > 0) {
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
    titresTypesIds,
    titresDomainesIds,
    titresStatutsIds,
  }: {
    typesIds?: string[] | null
    statutsIds?: string[] | null
    annees?: string[] | null
    titresIds?: string[] | null
    titresEntreprisesIds?: string[] | null
    titresSubstancesIds?: string[] | null
    titresReferences?: string | null
    titresTypesIds?: string[] | null
    titresDomainesIds?: string[] | null
    titresStatutsIds?: string[] | null
  },
  { fields }: { fields?: FieldsActivite },
  user: User
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
      titresTypesIds,
      titresDomainesIds,
      titresStatutsIds,
    },
    q
  )

  return q.resultSize()
}

const titresActivitesUpsert = async (titreActivites: ITitreActivite[]) =>
  TitresActivites.query().withGraphFetched(options.titresActivites.graph).upsertGraph(titreActivites, options.titresActivites.update)

const titreActiviteUpdate = async (id: ActiviteId, titreActivite: Partial<ITitreActivite>) => TitresActivites.query().patchAndFetchById(id, { ...titreActivite, id })

export { titreActiviteGet, titresActivitesCount, titresActivitesUpsert, titresActivitesGet, titreActiviteUpdate }
