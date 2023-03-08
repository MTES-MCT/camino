import { toCaminoDate } from 'camino-common/src/date.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { newDemarcheId } from '../../../database/models/_format/id-create.js'
import { ITitreDemarche, ITitreEtape, ITitrePhase } from '../../../types.js'

const titreDemarchesOctPointsMut = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1989-oct01',
      titreId: 'h-cx-courdemanges-1989',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1989-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1989-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1989-oct01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1989-oct01',
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1989-mut01',
      titreId: 'h-cx-courdemanges-1989',
      typeId: 'mut',
      statutId: 'acc',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1989-mut01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1989-mut01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
        },
        {
          id: 'h-cx-courdemanges-1989-mut01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1989-mut01',
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
      titreId: 'h-cx-courdemanges-1988',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1988-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [],
        },
        {
          id: 'h-cx-courdemanges-1988-oct01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
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
      titreId: 'h-cx-courdemanges-1986',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1986-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1986-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
        },
        {
          id: 'h-cx-courdemanges-1986-oct01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1986-oct01',
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1986-mut01',
      titreId: 'h-cx-courdemanges-1986',
      typeId: 'mut',
      statutId: 'acc',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1986-mut01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1986-mut01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1986-mut01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1986-mut01',
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctPointsMutInstruction = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1985-mut01',
      titreId: 'h-cx-courdemanges-1985',
      typeId: 'mut',
      statutId: 'ins',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1985-mut01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1985-mut01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1985-mut01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1985-mut01',
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1985-oct01',
      titreId: 'h-cx-courdemanges-1985',
      typeId: 'oct',
      statutId: 'ins',
      etapes: [
        {
          id: 'h-cx-courdemanges-1985-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1985-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1985-oct01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1985-oct01',
          typeId: 'dex',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctAccDpuRej = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1984-oct01',
      titreId: 'h-cx-courdemanges-1984',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1984-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1984-oct01',
          typeId: 'dpu',
          statutId: 'rej',
          ordre: 2,
          points: [1, 2, 3],
        },
        {
          id: 'h-cx-courdemanges-1984-oct01-dex01',
          titreDemarcheId: 'h-cx-courdemanges-1984-oct01',
          typeId: 'dex',
          statutId: 'rej',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctMfrPoints = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: newDemarcheId('h-cx-courdemanges-1983-oct01'),
      titreId: 'h-cx-courdemanges-1983',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1983-oct01-mfr01',
          date: toCaminoDate('1983-01-01'),
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1983-oct01'),
          typeId: 'mfr',
          statutId: 'acc',
          ordre: 1,
          points: [
            {
              id: 'id',
              titreEtapeId: 'h-cx-courdemanges-1983-oct01-mfr01',
              groupe: 1,
              contour: 1,
              point: 1,
              references: [],
              coordonnees: { x: 0, y: 0 },
            },
          ],
        } as ITitreEtape,
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctTitulairesACO = {
  statutId: TitresStatutIds.DemandeInitiale,
  demarches: [
    {
      id: 'h-cx-courdemanges-1982-oct01',
      titreId: 'h-cx-courdemanges-1982',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1982-oct01-mfr01',
          titreDemarcheId: 'h-cx-courdemanges-1982-oct01',
          typeId: 'mfr',
          statutId: 'aco',
          ordre: 1,
          dateFin: '2018-12-31',
          titulaires: [{ id: 'fr-123456789' }],
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctAmodiatairesPassee = {
  statutId: TitresStatutIds.Valide,
  demarches: [
    {
      id: 'h-cx-courdemanges-1982-oct01',
      titreId: 'h-cx-courdemanges-1982',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1982-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1982-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          dateFin: '2018-12-31',
          amodiataires: [{ id: 'fr-123456789' }],
        },
      ],
      phase: { phaseStatutId: 'val' },
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctAmodiatairesValide = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: 'h-cx-courdemanges-1982-amo01',
      titreId: 'h-cx-courdemanges-1982',
      typeId: 'amo',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1982-amo01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1982-amo01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          dateFin: '4018-12-31',
          amodiataires: [{ id: 'fr-123456789' }],
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1982-oct01',
      titreId: 'h-cx-courdemanges-1982',
      typeId: 'oct',
      statutId: 'acc',
      phase: { phaseStatutId: 'val' } as ITitrePhase,
      etapes: [],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesOctAmodiatairesMod = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: 'h-cx-courdemanges-1981-amo01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'amo',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-amo01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-amo01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          amodiataires: [{ id: 'fr-123456789' }],
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1981-pro01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'pro',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-pro01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-pro01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
    {
      id: 'h-cx-courdemanges-1981-oct01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesProPointsModPhaseEch = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: 'h-cx-courdemanges-1981-pro01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'pro',
      statutId: 'ins',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-pro01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-pro01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          points: [1, 2, 3],
        },
      ],
      phase: {
        statutId: 'ech',
      },
    },
    {
      id: 'h-cx-courdemanges-1981-oct01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesProPointsModPhaseVal = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: 'h-cx-courdemanges-1981-pro01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'pro',
      statutId: 'ins',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-pro01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-pro01'),
          date: '1981-01-01',
          typeId: ETAPES_TYPES.publicationDeDecisionAuJORF,
          statutId: ETAPES_STATUTS.ACCEPTE,
          ordre: 1,
        },
      ] as ITitreEtape[],
      phase: {
        phaseStatutId: 'val',
      },
    },
    {
      id: 'h-cx-courdemanges-1981-oct01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesMutPointsMod = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: 'h-cx-courdemanges-1981-mut01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'mut',
      statutId: 'ins',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-mut01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-mut01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          points: [1, 2, 3],
        },
      ],
      phase: {
        statutId: 'val',
      },
    },
    {
      id: 'h-cx-courdemanges-1981-oct01',
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'oct',
      statutId: 'acc',
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-oct01-dpu01',
          titreDemarcheId: 'h-cx-courdemanges-1981-oct01',
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
        },
      ],
    },
  ] as ITitreDemarche[],
}

const titreDemarchesProModPhaseEch = {
  statutId: TitresStatutIds.ModificationEnInstance,
  demarches: [
    {
      id: newDemarcheId('h-cx-courdemanges-1981-pro01'),
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'pro',
      statutId: 'ins',
      ordre: 2,
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-pro01-dpu01',
          date: '1981-01-01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-pro01'),
          typeId: 'eee',
          statutId: 'acc',
          ordre: 1,
          points: [1, 2, 3],
          surface: 3.2,
          substances: ['auru'],
          communes: ['paris'],
          titulaires: ['titulaire2'],
          amodiataires: ['amodiataire2'],
          administrations: ['administration2'],
        } as unknown as ITitreEtape,
      ],
      phase: {
        phaseStatutId: 'ech',
      },
    },
    {
      id: newDemarcheId('h-cx-courdemanges-1981-oct01'),
      titreId: 'h-cx-courdemanges-1981',
      typeId: 'oct',
      statutId: 'acc',
      ordre: 1,
      etapes: [
        {
          id: 'h-cx-courdemanges-1981-oct01-dpu01',
          titreDemarcheId: newDemarcheId('h-cx-courdemanges-1981-oct01'),
          typeId: 'dpu',
          statutId: 'acc',
          ordre: 1,
          points: [1, 2],
          surface: 3,
          substances: ['arge'],
          communes: ['tours'],
          titulaires: ['titulaire1'],
          amodiataires: ['amodiataire1'],
          administrations: ['administration1'],
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
  titreDemarchesOctAmodiatairesMod,
  titreDemarchesProPointsModPhaseEch,
  titreDemarchesProPointsModPhaseVal,
  titreDemarchesMutPointsMod,
  titreDemarchesProModPhaseEch,
}
