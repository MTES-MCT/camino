import TitresEtapes from '../../../database/models/titres-etapes.js'

export const titresEtapesCommunesVides = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
    typeId: 'dpu',
    statutId: 'acc',
    ordre: 2,
    date: '1988-03-11',
    communes: [],
  },
] as unknown as TitresEtapes[]

export const titresEtapesCommunesMemeCommune = [
  {
    id: 'h-cx-courdemanges-1988-oct01-dpu01',
    titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
    typeId: 'dpu',
    statutId: 'acc',
    ordre: 2,
    date: '1988-03-11',
    communes: [{ departementId: '29' }, { departementId: '29' }],
  },
] as unknown as TitresEtapes[]
