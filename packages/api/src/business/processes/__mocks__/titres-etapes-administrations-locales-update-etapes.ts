import Titres from '../../../database/models/titres'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import { ICommune } from '../../../types'
import {
  Administrations,
  Administration
} from 'camino-common/src/static/administrations'

export const administrations: Administration[] = [
  Administrations['ope-onf-973-01'],
  Administrations['dre-centre-val-de-loire-01'],
  Administrations['dre-bretagne-01'],
  Administrations['dea-guyane-01'],
  Administrations['ope-brgm-01'],
  Administrations['ope-cacem-01']
]

export const titresEtapesCommunes = [
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

export const titresEtapesCommunesVides = [
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

export const titresEtapesCommunesMemeCommune = [
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

export const titresEtapesAdministrationLocalesInexistante = [
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

export const titresEtapesAdministrationLocalesExistante = [
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

export const titresArm = [
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

export const titresAxm = [
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
