import { IEntrepriseEtablissement } from '../../types'

import options from './_options'

import EntrepriseEtablissements from '../models/entreprises-etablissements'

export const entreprisesEtablissementsGet = async (): Promise<EntrepriseEtablissements[]> => EntrepriseEtablissements.query()

export const entreprisesEtablissementsUpsert = async (entreprisesEtablissements: IEntrepriseEtablissement[]): Promise<EntrepriseEtablissements[]> => {
  // eslint-disable-next-line no-restricted-syntax
  return EntrepriseEtablissements.query().upsertGraph(entreprisesEtablissements, options.entreprisesEtablissements.update)
}

export const entreprisesEtablissementsDelete = async (entreprisesEtablissementsIds: string[]): Promise<number> => EntrepriseEtablissements.query().delete().whereIn('id', entreprisesEtablissementsIds)
