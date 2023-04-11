import { toCaminoDate } from 'camino-common/src/date.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { newDemarcheId } from '../../../database/models/_format/id-create.js'
import { ITitreDemarche, ITitreEtape } from '../../../types.js'

const titreDemarchesOctPointsMut = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1989-oct01',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1989-oct01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-oct01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1989-oct01-dex01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-oct01'),
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1989-mut01',
      typeId: 'mut',
      statutId: 'acc',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1989-mut01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-mut01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
        },
        {
          id: 'h-cx-courdemanges-1989-mut01-dex01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1989-mut01'),
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctPointsVides = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1988-oct01',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1988-oct01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [],
        },
        {
          id: 'h-cx-courdemanges-1988-oct01-dex01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctMutPoints = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1986-oct01',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1986-oct01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
        },
        {
          id: 'h-cx-courdemanges-1986-oct01-dex01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-oct01'),
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1986-mut01',
      typeId: 'mut',
      statutId: 'acc',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1986-mut01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1986-mut01-dex01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1986-mut01'),
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}











export {
  titreDemarchesOctPointsMut,
  titreDemarchesOctPointsVides,
  titreDemarchesOctMutPoints,
  titreDemarchesOctPointsMutInstruction,
  titreDemarchesOctAccDpuRej,
  titreDemarchesOctMfrPoints,
  titreDemarchesOctTitulairesACO,
  titreDemarchesOctAmodiatairesPassee,
  titreDemarchesOctAmodiatairesValide,
  titreDemarchesProPointsModPhaseEch,
  titreDemarchesProPointsModPhaseVal,
  titreDemarchesMutPointsMod,
  titreDemarchesProModPhaseEch,
}
