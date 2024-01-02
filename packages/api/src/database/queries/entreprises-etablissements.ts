import { IEntrepriseEtablissement } from '../../types.js'

import options from './_options.js'

import EntrepriseEtablissements from '../models/entreprises-etablissements.js'

export const entreprisesEtablissementsGet = async () => EntrepriseEtablissements.query()

export const entreprisesEtablissementsUpsert = async (entreprisesEtablissements: IEntrepriseEtablissement[]) =>
  EntrepriseEtablissements.query().upsertGraph(entreprisesEtablissements, options.entreprisesEtablissements.update)

export const entreprisesEtablissementsDelete = async (entreprisesEtablissementsIds: string[]) => EntrepriseEtablissements.query().delete().whereIn('id', entreprisesEtablissementsIds)
