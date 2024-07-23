import { IEntrepriseEtablissement } from '../../types'

import options from './_options'

import EntrepriseEtablissements from '../models/entreprises-etablissements'

export const entreprisesEtablissementsGet = async () => EntrepriseEtablissements.query()

export const entreprisesEtablissementsUpsert = async (entreprisesEtablissements: IEntrepriseEtablissement[]) =>
  EntrepriseEtablissements.query().upsertGraph(entreprisesEtablissements, options.entreprisesEtablissements.update)

export const entreprisesEtablissementsDelete = async (entreprisesEtablissementsIds: string[]) => EntrepriseEtablissements.query().delete().whereIn('id', entreprisesEtablissementsIds)
