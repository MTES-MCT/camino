import { ApiClient } from '@/api/api-client'

export const administrationMetas: ApiClient['administrationMetas'] = () =>
  Promise.resolve({
    activitesTypes: [
      {
        id: 'gra',
        modificationInterdit: true,
        lectureInterdit: false,
      },
    ],
  })
