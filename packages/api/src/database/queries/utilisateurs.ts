import { RawBuilder, QueryBuilder } from 'objection'

import { IFields, IUtilisateursColonneId, IColonne, IUtilisateurTitre, IUtilisateur, formatUser } from '../../types.js'

import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'
import { stringSplit } from './_utils.js'

import Utilisateurs from '../models/utilisateurs.js'
import { utilisateursQueryModify } from './permissions/utilisateurs.js'
import UtilisateursTitres from '../models/utilisateurs--titres.js'
import { Role, User } from 'camino-common/src/roles.js'

const userGet = async (userId?: string): Promise<User> => {
  if (!userId) return null

  const user = await Utilisateurs.query().withGraphFetched('[entreprises]').findById(userId)
  if (user) {
    const q = utilisateursQueryBuild(
      {
        fields: {
          entreprises: { id: {} },
        },
      },
      formatUser(user)
    )

    const userBdd: IUtilisateur | undefined = await q.findById(userId)
    if (userBdd) {
      return formatUser(userBdd)
    }
  }

  return undefined
}

const utilisateursQueryBuild = ({ fields }: { fields?: IFields }, user: User) => {
  const graph = fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph

  const q = Utilisateurs.query().withGraphFetched(graph)

  utilisateursQueryModify(q, user)

  return q
}

const utilisateursFiltersQueryModify = (
  {
    ids,
    entreprisesIds,
    administrationIds,
    roles,
    noms,
    emails,
  }: {
    ids?: string[]
    entreprisesIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  q: QueryBuilder<Utilisateurs, Utilisateurs[]>
) => {
  if (ids && ids.length > 0) {
    q.whereIn('id', ids)
  }

  if (roles && roles.length > 0) {
    q.whereIn('role', roles as string[])
  }

  if (administrationIds && administrationIds.length > 0) {
    q.whereIn('administrationId', administrationIds)
  }

  if (entreprisesIds && entreprisesIds.length > 0) {
    q.whereIn('entreprises.id', entreprisesIds).leftJoinRelated('entreprises')
  }

  if (noms && noms !== '') {
    const nomsArray = stringSplit(noms)
    const fields = ['nom', 'prenom']

    nomsArray.forEach(s => {
      q.where(b => {
        fields.forEach(f => {
          b.orWhereRaw(`lower(??) like ?`, [`utilisateurs.${f}`, `%${s.toLowerCase()}%`])
        })
      })
    })
  }

  if (emails && emails !== '') {
    q.where(b => {
      b.whereRaw(`LOWER(??) LIKE LOWER(?)`, ['utilisateurs.email', `%${emails}%`])
    })
  }

  return q
}

const userByEmailGet = async (email: string | null | undefined) => {
  if (email) {
    const user: IUtilisateur | undefined = await Utilisateurs.query().withGraphFetched('[entreprises]').where('utilisateurs.email', email).first()

    if (user) {
      const q = utilisateursQueryBuild(
        {
          fields: {
            entreprises: { id: {} },
          },
        },
        formatUser(user)
      )

      return q.findById(user.id)
    }
  }

  return undefined
}

const utilisateurGet = async (id: string, { fields }: { fields?: IFields } = {}, user: User) => {
  const q = utilisateursQueryBuild({ fields }, user)

  return q.findById(id)
}

// lien = administration ou entreprise(s) en relation avec l'utilisateur :
// on trie sur la concaténation du nom de l'administration
// avec l'aggrégation ordonnée(STRING_AGG) des noms des entreprises
const utilisateursColonnes: Record<IUtilisateursColonneId, IColonne<string | RawBuilder>> = {
  nom: { id: 'nom' },
  prenom: { id: 'prenom' },
  email: { id: 'email' },
  role: { id: 'role' },
}
const utilisateursGet = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    ids,
    entreprisesIds,
    administrationIds,
    roles,
    noms,
    emails,
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: IUtilisateursColonneId | null
    ordre?: 'asc' | 'desc' | null
    ids?: string[]
    entreprisesIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  { fields }: { fields?: IFields } = {},
  user: User
) => {
  const q = utilisateursQueryBuild({ fields }, user)

  utilisateursFiltersQueryModify(
    {
      ids,
      entreprisesIds,
      administrationIds,
      roles,
      noms,
      emails,
    },
    q
  )

  if (colonne) {
    q.orderBy(utilisateursColonnes[colonne].id, ordre || 'asc')
  } else {
    q.orderBy('utilisateurs.nom', 'asc')
  }

  if (page && intervalle) {
    q.offset((page - 1) * intervalle)
  }

  if (intervalle) {
    q.limit(intervalle)
  }

  return q
}

const utilisateursCount = async (
  {
    ids,
    entreprisesIds,
    administrationIds,
    roles,
    noms,
    emails,
  }: {
    ids?: string[]
    entreprisesIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  { fields }: { fields?: IFields },
  user: User
) => {
  const q = utilisateursQueryBuild({ fields }, user)

  utilisateursFiltersQueryModify({ ids, entreprisesIds, administrationIds, roles, noms, emails }, q)

  return q.resultSize()
}

const utilisateurCreate = async (utilisateur: IUtilisateur, { fields }: { fields?: IFields }) =>
  Utilisateurs.query()
    .insertGraph(utilisateur, options.utilisateurs.update)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph)
    .first()

const utilisateurUpsert = async (utilisateur: Pick<IUtilisateur, 'id'> & Partial<Omit<IUtilisateur, 'id'>>) => Utilisateurs.query().upsertGraph(utilisateur, options.utilisateurs.update)

const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre) => UtilisateursTitres.query().insert(utilisateurTitre)

const utilisateurTitreDelete = async (utilisateurId: string, titreId: string) => UtilisateursTitres.query().deleteById([utilisateurId, titreId])

const utilisateursTitresGet = async (titreId: string, { fields }: { fields?: IFields }) =>
  UtilisateursTitres.query()
    .where('titreId', titreId)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateursTitres', fieldsFormat) : options.utilisateursTitres.graph)

export { userGet, utilisateurGet, userByEmailGet, utilisateursGet, utilisateursCount, utilisateurCreate, utilisateurUpsert, utilisateurTitreCreate, utilisateurTitreDelete, utilisateursTitresGet }
