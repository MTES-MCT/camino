import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { administration } from '@/api/administrations.js'

export type AdministrationMetas = {
  titresTypesTitresStatuts: {
    titreType: {
      id: TitreTypeId
    }
    titreStatutId: TitreStatutId
    titresModificationInterdit: boolean
    etapesModificationInterdit: boolean
    demarchesModificationInterdit: boolean
  }[]
  activitesTypes: {
    id: ActivitesTypesId
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
  titresTypesEtapesTypes: {
    etapeType: {
      id: EtapeTypeId
    }
    titreType: {
      id: TitreTypeId
    }
    titreStatutId: TitreStatutId
    creationInterdit: boolean
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
}

export interface AdministrationApiClient {
  administrationMetas: (
    administrationId: AdministrationId
  ) => Promise<AdministrationMetas>
}

export const administrationApiClient: AdministrationApiClient = {
  administrationMetas: async (administrationId: AdministrationId) =>
    await administration({ id: administrationId })
}
