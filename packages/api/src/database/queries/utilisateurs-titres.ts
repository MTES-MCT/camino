import { UtilisateurId } from 'camino-common/src/roles'
import { IUtilisateurTitre } from '../../types'

import UtilisateursTitres from '../models/utilisateurs--titres'
import { TitreId } from 'camino-common/src/validators/titres'

export const utilisateurTitreCreate = async (utilisateurTitre: IUtilisateurTitre): Promise<UtilisateursTitres> => UtilisateursTitres.query().insert(utilisateurTitre)

export const utilisateurTitreDelete = async (utilisateurId: UtilisateurId, titreId: TitreId): Promise<number> => UtilisateursTitres.query().deleteById([utilisateurId, titreId])
