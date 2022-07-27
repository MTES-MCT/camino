import Titres from '../../../database/models/titres'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import {
  IAdministration,
  IAdministrationTitreType,
  ICommune,
  ITitreType
} from '../../../types'

const administrations: Pick<IAdministration, 'id' | 'titresTypes'>[] = [
  { id: 'ope-onf-973-01', titresTypes: [] },
  { id: 'dre-centre-val-de-loire-01', titresTypes: [] },
  { id: 'dre-bretagne-01', titresTypes: [] },
  {
    id: 'dea-guyane-01',
    titresTypes: [
      { id: 'arm', associee: true } as ITitreType & IAdministrationTitreType
    ]
  },
  {
    id: 'ope-brgm-01',
    titresTypes: []
  },
  { id: 'ope-cacem-01', titresTypes: [] }
]

const titresEtapesCommunes = [
  {
    id: 'titre-id',
    domaineId: 'h',
    demarches: [
      {
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dpu01',
            typeId: 'dpu',
            communes: [
              {
                id: 'paris',
                departementId: '973'
              },
              {
                id: 'issy',
                departementId: '973'
              },
              {
                id: 'ivry',
                departementId: '973'
              },
              {
                id: 'evry',
                departementId: '973'
              }
            ]
          },
          {
            typeId: 'chh',
            communes: [{}]
          }
        ]
      }
    ]
  }
] as Titres[]

const titresEtapesCommunesVides = [
  {
    id: 'titre-id',
    demarches: [
      {
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dpu01',
            titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: '1988-03-11',
            communes: []
          }
        ]
      }
    ]
  }
] as unknown as Titres[]

const titresEtapesCommunesMemeCommune = [
  {
    id: 'titre-id',
    demarches: [
      {
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dpu01',
            titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: '1988-03-11',
            communes: [{ departementId: '29' }, { departementId: '29' }]
          }
        ]
      }
    ]
  }
] as Titres[]

const titresEtapesAdministrationLocalesInexistante = [
  {
    id: 'titre-id',
    demarches: [
      {
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dpu01',
            titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
            typeId: 'dpu',
            communes: [] as ICommune[],
            administrations: [{ id: 'ope-cacem-01', associee: null }]
          }
        ]
      }
    ]
  }
] as Titres[]

const titresEtapesAdministrationLocalesExistante = [
  {
    id: 'titre-id',
    domaineId: 'h',
    demarches: [
      {
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dpu01',
            typeId: 'dpu',
            communes: [{ departementId: '29' }],
            administrations: [{ id: 'dre-bretagne-01', associee: null }]
          }
        ]
      }
    ]
  }
] as Titres[]

const titresArm = [
  {
    id: 'titre-id',
    typeId: 'arm',
    domaineId: 'm',
    demarches: [
      {
        etapes: [
          {
            id: 'm-arm-crique-saint-doux-oct01-men01',
            titreDemarcheId: 'm-arm-crique-saint-doux-oct01',
            typeId: 'men',
            statutId: 'acc',
            ordre: 2,
            date: '1988-03-11',
            communes: [{ departementId: DEPARTEMENT_IDS.Guyane }]
          }
        ]
      }
    ]
  }
] as Titres[]

const titresAxm = [
  {
    id: 'titre-id',
    typeId: 'axm',
    domaineId: 'm',
    demarches: [
      {
        etapes: [
          {
            id: 'm-ax-crique-saint-doux-oct01-men01',
            titreDemarcheId: 'm-ax-crique-saint-doux-oct01',
            typeId: 'men',
            statutId: 'acc',
            ordre: 2,
            date: '1988-03-11',
            communes: [{ departementId: DEPARTEMENT_IDS.Guyane }]
          }
        ]
      }
    ]
  }
] as Titres[]

export {
  administrations,
  titresEtapesCommunes,
  titresEtapesCommunesVides,
  titresEtapesCommunesMemeCommune,
  titresEtapesAdministrationLocalesInexistante,
  titresEtapesAdministrationLocalesExistante,
  titresArm,
  titresAxm
}
