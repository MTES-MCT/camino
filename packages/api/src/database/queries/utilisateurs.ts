import { IUtilisateurTitre, IUtilisateur, formatUser } from '../../types'

import options, { FieldsUtilisateur, FieldsUtilisateurTitre } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import Utilisateurs from '../models/utilisateurs'
import { utilisateursQueryModify } from './permissions/utilisateurs'
import UtilisateursTitres from '../models/utilisateurs--titres'
import { User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

const utilisateursQueryBuild = ({ fields }: { fields?: FieldsUtilisateur }, user: DeepReadonly<User>) => {
  const graph = fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph

  const q = Utilisateurs.query().withGraphFetched(graph)

  utilisateursQueryModify(q, user)

  return q
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

export { utilisateurGet, utilisateurCreate, utilisateurUpsert, utilisateurTitreCreate, utilisateurTitreDelete, utilisateursTitresGet }
