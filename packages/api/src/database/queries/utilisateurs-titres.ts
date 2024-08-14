import { IUtilisateurTitre } from '../../types'

import options, { FieldsUtilisateurTitre } from './_options'
import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'

import UtilisateursTitres from '../models/utilisateurs--titres'

export const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre): Promise<UtilisateursTitres> => UtilisateursTitres.query().insert(utilisateurTitre)

export const utilisateurTitreDelete = async (utilisateurId: string, titreId: string): Promise<number> => UtilisateursTitres.query().deleteById([utilisateurId, titreId])

export const utilisateursTitresGet = async (titreId: string, { fields }: { fields?: FieldsUtilisateurTitre }): Promise<UtilisateursTitres[]> =>
  UtilisateursTitres.query()
    .where('titreId', titreId)
    .withGraphFetched(fields ? graphBuild(fields, 'utilisateursTitres', fieldsFormat) : options.utilisateursTitres.graph)
