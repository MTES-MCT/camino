import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import TitresEtapes from '../../../database/models/titres-etapes'
import { ICommune } from '../../../types'

export const titresEtapesCommunes = [
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
] as unknown as TitresEtapes[]

export const titresEtapesCommunesVides = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
    typeId: 'dpu',
    statutId: 'acc',
    ordre: 2,
    date: '1988-03-11',
    communes: []
  }
] as unknown as TitresEtapes[]

export const titresEtapesCommunesMemeCommune = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
    typeId: 'dpu',
    statutId: 'acc',
    ordre: 2,
    date: '1988-03-11',
    communes: [{ departementId: '29' }, { departementId: '29' }]
  }
] as unknown as TitresEtapes[]

export const titresEtapesAdministrationLocalesInexistante = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
    typeId: 'dpu',
    communes: [] as ICommune[],
    administrations: [{ id: 'ope-cacem-01', associee: null }]
  }
] as unknown as TitresEtapes[]

export const titresEtapesAdministrationLocalesExistante = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    typeId: 'dpu',
    communes: [{ departementId: '29' }],
    administrationsLocale: [ADMINISTRATION_IDS['DREAL - BRETAGNE']]
  }
] as unknown as TitresEtapes[]
