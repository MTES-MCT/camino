import { ApiClient } from '@/api/api-client'

export const administrationMetas: ApiClient['administrationMetas'] = () =>
  Promise.resolve({
    titresTypesTitresStatuts: [
      {
        titreType: {
          id: 'axm'
        },
        titreStatutId: 'val',
        titresModificationInterdit: true,
        etapesModificationInterdit: false,
        demarchesModificationInterdit: true
      }
    ],
    activitesTypes: [
      {
        id: 'gra',
        modificationInterdit: true,
        lectureInterdit: false
      }
    ],
    titresTypesEtapesTypes: [
      {
        etapeType: {
          id: 'dpu'
        },
        titreType: {
          id: 'axm'
        },
        titreStatutId: 'val',
        creationInterdit: true,
        modificationInterdit: false,
        lectureInterdit: true
      }
    ]
  })
