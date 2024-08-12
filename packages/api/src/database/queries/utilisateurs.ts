import { IUtilisateurTitre, IUtilisateur } from '../../types'

import options, { FieldsUtilisateur, FieldsUtilisateurTitre } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import Utilisateurs from '../models/utilisateurs'
import UtilisateursTitres from '../models/utilisateurs--titres'

const utilisateurCreate = async (utilisateur: IUtilisateur, { fields }: { fields?: FieldsUtilisateur }): Promise<Utilisateurs> =>
  Utilisateurs.query()
    .insertGraph(utilisateur, options.utilisateurs.update)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateur', fieldsFormat) : options.utilisateurs.graph)
    .first()

const utilisateurUpsert = async (utilisateur: Pick<IUtilisateur, 'id'> & Partial<Omit<IUtilisateur, 'id'>>): Promise<Utilisateurs> =>
  Utilisateurs.query().upsertGraph(utilisateur, options.utilisateurs.update)

const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre): Promise<UtilisateursTitres> => UtilisateursTitres.query().insert(utilisateurTitre)

const utilisateurTitreDelete = async (utilisateurId: string, titreId: string): Promise<number> => UtilisateursTitres.query().deleteById([utilisateurId, titreId])

const utilisateursTitresGet = async (titreId: string, { fields }: { fields?: FieldsUtilisateurTitre }): Promise<UtilisateursTitres[]> =>
  UtilisateursTitres.query()
    .where('titreId', titreId)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateursTitres', fieldsFormat) : options.utilisateursTitres.graph)

export { utilisateurCreate, utilisateurUpsert, utilisateurTitreCreate, utilisateurTitreDelete, utilisateursTitresGet }
