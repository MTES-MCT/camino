import { Model, Modifiers } from 'objection'

import { IEntrepriseEtablissement } from '../../types'

interface EntreprisesEtablissements extends IEntrepriseEtablissement {}

class EntreprisesEtablissements extends Model {
  public static override tableName = 'entreprisesEtablissements'

  public static override jsonSchema = {
    type: 'object',
    required: ['id', 'entrepriseId', 'dateDebut'],

    properties: {
      id: { type: 'string', maxLength: 64 },
      entrepriseId: { type: 'string', maxLength: 64 },
      nom: { type: ['string', 'null'] },
      legalSiret: { type: ['string', 'null'] },
      dateDebut: { type: 'string' },
      dateFin: { type: ['string', 'null'] },
    },
  }

  public static override modifiers: Modifiers = {
    orderDesc: builder => {
      builder.orderBy('dateDebut', 'desc')
    },
  }
}

export default EntreprisesEtablissements
