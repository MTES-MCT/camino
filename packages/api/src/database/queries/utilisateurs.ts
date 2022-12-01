import { RawBuilder, QueryBuilder } from 'objection'

import {
  IUtilisateur,
  IFields,
  IUtilisateursColonneId,
  IColonne,
  IUtilisateurTitre
} from '../../types.js'

import options from './_options.js'
import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'
import { stringSplit } from './_utils.js'

import Utilisateurs from '../models/utilisateurs.js'
import { utilisateursQueryModify } from './permissions/utilisateurs.js'
import UtilisateursTitres from '../models/utilisateurs--titres.js'
import { Role } from 'camino-common/src/roles.js'

const userGet = async (userId?: string) => {
  if (!userId) return null

  const user = await Utilisateurs.query().findById(userId)

  const q = utilisateursQueryBuild(
    {
      fields: {
        entreprises: { id: {} }
      }
    },
    user
  )

  return q.findById(userId)
}

const utilisateursQueryBuild = (
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'utilisateur', fieldsFormat)
    : options.utilisateurs.graph

  const q = Utilisateurs.query().withGraphFetched(graph)

  utilisateursQueryModify(q, user)

  return q
}

const utilisateursFiltersQueryModify = (
  {
    ids,
    entrepriseIds,
    administrationIds,
    roles,
    noms,
    emails
  }: {
    ids?: string[]
    entrepriseIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  q: QueryBuilder<Utilisateurs, Utilisateurs[]>
) => {
  if (ids) {
    q.whereIn('id', ids)
  }

  if (roles) {
    q.whereIn('role', roles as string[])
  }

  if (administrationIds) {
    q.whereIn('administrationId', administrationIds)
  }

  if (entrepriseIds) {
    q.whereIn('entreprises.id', entrepriseIds).leftJoinRelated('entreprises')
  }

  if (noms) {
    const nomsArray = stringSplit(noms)
    const fields = ['nom', 'prenom']

    nomsArray.forEach(s => {
      q.where(b => {
        fields.forEach(f => {
          b.orWhereRaw(`lower(??) like ?`, [
            `utilisateurs.${f}`,
            `%${s.toLowerCase()}%`
          ])
        })
      })
    })
  }

  if (emails) {
    q.where(b => {
      b.whereRaw(`LOWER(??) LIKE LOWER(?)`, [
        'utilisateurs.email',
        `%${emails}%`
      ])
    })
  }

  return q
}

const userByEmailGet = async (
  email: string,
  { fields }: { fields?: IFields } = {}
) => {
  const graph = fields
    ? graphBuild(fields, 'utilisateur', fieldsFormat)
    : options.utilisateurs.graph

  return Utilisateurs.query()
    .withGraphFetched(graph)
    .where('email', email)
    .first()
}

const userByRefreshTokenGet = async (refreshToken: string) => {
  return Utilisateurs.query().where('refreshToken', refreshToken).first()
}

const utilisateurGet = async (
  id: string,
  { fields }: { fields?: IFields } = {},
  user: IUtilisateur | null | undefined
) => {
  const q = utilisateursQueryBuild({ fields }, user)

  return q.findById(id)
}

// lien = administration ou entreprise(s) en relation avec l'utilisateur :
// on trie sur la concaténation du nom de l'administration
// avec l'aggrégation ordonnée(STRING_AGG) des noms des entreprises
const utilisateursColonnes: Record<
  IUtilisateursColonneId,
  IColonne<string | RawBuilder>
> = {
  nom: { id: 'nom' },
  prenom: { id: 'prenom' },
  email: { id: 'email' },
  role: { id: 'role' }
}
const utilisateursGet = async (
  {
    intervalle,
    page,
    colonne,
    ordre,
    ids,
    entrepriseIds,
    administrationIds,
    roles,
    noms,
    emails
  }: {
    intervalle?: number | null
    page?: number | null
    colonne?: IUtilisateursColonneId | null
    ordre?: 'asc' | 'desc' | null
    ids?: string[]
    entrepriseIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  { fields }: { fields?: IFields } = {},
  user: IUtilisateur | null | undefined
) => {
  const q = utilisateursQueryBuild({ fields }, user)

  utilisateursFiltersQueryModify(
    {
      ids,
      entrepriseIds,
      administrationIds,
      roles,
      noms,
      emails
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
    entrepriseIds,
    administrationIds,
    roles,
    noms,
    emails
  }: {
    ids?: string[]
    entrepriseIds?: string[]
    administrationIds?: string[]
    roles?: Role[]
    noms?: string | null
    emails?: string | null
  },
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const q = utilisateursQueryBuild({ fields }, user)

  utilisateursFiltersQueryModify(
    { ids, entrepriseIds, administrationIds, roles, noms, emails },
    q
  )

  return q.resultSize()
}

const utilisateurCreate = async (
  utilisateur: IUtilisateur,
  { fields }: { fields?: IFields }
) =>
  Utilisateurs.query()
    .insertGraph(utilisateur, options.utilisateurs.update)
    .withGraphFetched(
      fields
        ? graphBuild(fields, 'utilisateur', fieldsFormat)
        : options.utilisateurs.graph
    )
    .first()

const utilisateurUpsert = async (
  utilisateur: IUtilisateur,
  { fields }: { fields?: IFields }
) =>
  Utilisateurs.query()
    .upsertGraphAndFetch(utilisateur, options.utilisateurs.update)
    .withGraphFetched(
      fields
        ? graphBuild(fields, 'utilisateur', fieldsFormat)
        : options.utilisateurs.graph
    )

const utilisateurUpdate = async (
  id: string,
  utilisateur: Partial<IUtilisateur>
) => Utilisateurs.query().patch(utilisateur).findById(id)

const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre) =>
  UtilisateursTitres.query().insert(utilisateurTitre)

const utilisateurTitreDelete = async (utilisateurId: string, titreId: string) =>
  UtilisateursTitres.query().deleteById([utilisateurId, titreId])

const utilisateursTitresGet = async (
  titreId: string,
  { fields }: { fields?: IFields }
) =>
  UtilisateursTitres.query()
    .where('titreId', titreId)
    .withGraphFetched(
      fields
        ? graphBuild(fields, 'utilisateursTitres', fieldsFormat)
        : options.utilisateursTitres.graph
    )

export {
  userGet,
  utilisateurGet,
  userByEmailGet,
  userByRefreshTokenGet,
  utilisateursGet,
  utilisateursCount,
  utilisateurCreate,
  utilisateurUpsert,
  utilisateurUpdate,
  utilisateurTitreCreate,
  utilisateurTitreDelete,
  utilisateursTitresGet
}
