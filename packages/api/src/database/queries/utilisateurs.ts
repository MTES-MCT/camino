import { IUtilisateurTitre, IUtilisateur, formatUser } from '../../types'

import options, { FieldsUtilisateur, FieldsUtilisateurTitre } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import Utilisateurs from '../models/utilisateurs'
import { utilisateursQueryModify } from './permissions/utilisateurs'
import UtilisateursTitres from '../models/utilisateurs--titres'
import { User } from 'camino-common/src/roles'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'

const userGet = async (userId?: string): Promise<User> => {
  if (isNullOrUndefined(userId)) return null

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

const utilisateursQueryBuild = ({ fields }: { fields?: FieldsUtilisateur }, user: DeepReadonly<User>) => {
  const graph = fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph

  const q = Utilisateurs.query().withGraphFetched(graph)

  utilisateursQueryModify(q, user)

  return q
}

const userByEmailGet = async (email: string | null | undefined): Promise<Utilisateurs | undefined> => {
  if (isNotNullNorUndefinedNorEmpty(email)) {
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

export const userByKeycloakIdGet = async (keycloakId: string | null | undefined): Promise<IUtilisateur | undefined> => {
  if (isNotNullNorUndefinedNorEmpty(keycloakId)) {
    const user: IUtilisateur | undefined = await Utilisateurs.query().withGraphFetched('[entreprises]').where('utilisateurs.keycloakId', keycloakId).first()

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

const utilisateurGet = async (id: string, { fields }: { fields?: FieldsUtilisateur } = {}, user: User) => {
  const q = utilisateursQueryBuild({ fields }, user)

  return q.findById(id)
}

const utilisateurCreate = async (utilisateur: IUtilisateur, { fields }: { fields?: FieldsUtilisateur }) =>
  Utilisateurs.query()
    .insertGraph(utilisateur, options.utilisateurs.update)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph)
    .first()

const utilisateurUpsert = async (utilisateur: Pick<IUtilisateur, 'id'> & Partial<Omit<IUtilisateur, 'id'>>) => Utilisateurs.query().upsertGraph(utilisateur, options.utilisateurs.update)

const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre) => UtilisateursTitres.query().insert(utilisateurTitre)

const utilisateurTitreDelete = async (utilisateurId: string, titreId: string) => UtilisateursTitres.query().deleteById([utilisateurId, titreId])

const utilisateursTitresGet = async (titreId: string, { fields }: { fields?: FieldsUtilisateurTitre }) =>
  UtilisateursTitres.query()
    .where('titreId', titreId)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateursTitres', fieldsFormat) : options.utilisateursTitres.graph)

export { userGet, utilisateurGet, userByEmailGet, utilisateurCreate, utilisateurUpsert, utilisateurTitreCreate, utilisateurTitreDelete, utilisateursTitresGet }
