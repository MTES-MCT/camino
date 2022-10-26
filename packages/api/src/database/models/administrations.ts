import { Model } from 'objection'

import { IAdministration } from '../../types'

import AdministrationsTitresTypesEtapesTypes from './administrations-titres-types-etapes-types'
import AdministrationsTitresTypesTitresStatuts from './administrations-titres-types-titres-statuts'
import Utilisateurs from './utilisateurs'
import Titres from './titres'
import ActivitesTypes from './activites-types'

interface Administrations extends IAdministration {}

class Administrations extends Model {
  public static tableName = 'administrations'

  public static jsonSchema = {
    type: 'object',
    required: ['id'],

    properties: {
      id: { type: 'string', maxLength: 64 }
    }
  }

  static relationMappings = () => ({
    titresTypesTitresStatuts: {
      relation: Model.HasManyRelation,
      modelClass: AdministrationsTitresTypesTitresStatuts,
      join: {
        from: 'administrations.id',
        to: 'administrations__titresTypes__titresStatuts.administrationId'
      }
    },

    titresTypesEtapesTypes: {
      relation: Model.HasManyRelation,
      modelClass: AdministrationsTitresTypesEtapesTypes,
      join: {
        from: 'administrations.id',
        to: 'administrations__titresTypes__etapesTypes.administrationId'
      }
    },

    utilisateurs: {
      relation: Model.HasManyRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'administrations.id',
        to: 'utilisateurs.administrationId'
      }
    },

    gestionnaireTitres: {
      relation: Model.ManyToManyRelation,
      modelClass: Titres,
      join: {
        from: 'administrations.id',
        through: {
          from: 'titresAdministrationsGestionnaires.administrationId',
          to: 'titresAdministrationsGestionnaires.titreId'
        },
        to: 'titres.id'
      }
    },

    activitesTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: ActivitesTypes,
      join: {
        from: 'administrations.id',
        through: {
          from: 'administrations__activitesTypes.administrationId',
          to: 'administrations__activitesTypes.activiteTypeId',
          extra: ['modificationInterdit', 'lectureInterdit']
        },
        to: 'activitesTypes.id'
      }
    },

    activitesTypesEmails: {
      relation: Model.ManyToManyRelation,
      modelClass: ActivitesTypes,
      join: {
        from: 'administrations.id',
        through: {
          from: 'administrations__activitesTypes__emails.administrationId',
          to: 'administrations__activitesTypes__emails.activiteTypeId',
          extra: ['email']
        },
        to: 'activitesTypes.id'
      }
    }
  })
}

export default Administrations
