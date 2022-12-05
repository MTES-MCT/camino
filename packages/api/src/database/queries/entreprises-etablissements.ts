import { IEntrepriseEtablissement } from '../../types.js'

import options from './_options.js'

import EntrepriseEtablissements from '../models/entreprises-etablissements.js'

const entrepriseEtablissementGet = async (id: string) =>
  EntrepriseEtablissements.query().findById(id)

const entreprisesEtablissementsGet = async () =>
  EntrepriseEtablissements.query()

const entreprisesEtablissementsUpsert = async (
  entreprisesEtablissements: IEntrepriseEtablissement[]
) =>
  EntrepriseEtablissements.query().upsertGraph(
    entreprisesEtablissements,
    options.entreprisesEtablissements.update
  )

const entreprisesEtablissementsDelete = async (
  entreprisesEtablissementsIds: string[]
) =>
  EntrepriseEtablissements.query()
    .delete()
    .whereIn('id', entreprisesEtablissementsIds)

export {
  entrepriseEtablissementGet,
  entreprisesEtablissementsGet,
  entreprisesEtablissementsUpsert,
  entreprisesEtablissementsDelete
}
