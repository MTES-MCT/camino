import { newDemarcheId } from '../../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date'
import { TitreDemarchePhaseFind } from '../titre-phases-find.js'

export const titreDemarcheOctDpuAcc: TitreDemarchePhaseFind = {
  titreId: 'titreid',
  id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
  typeId: 'oct',
  statutId: 'acc',
  etapes: [
    {
      typeId: 'dpu',
      statutId: 'acc',
      ordre: 2,
      date: toCaminoDate('2200-01-01'),
      duree: 2 * 12,
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    },
    {
      typeId: 'dex',
      statutId: 'acc',
      ordre: 1,
      date: toCaminoDate('2200-01-01'),
      duree: 2 * 12,
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    },
  ],
}

export const titreDemarcheOctDpuInexistante: TitreDemarchePhaseFind = {
  titreId: 'titreId',
  id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
  typeId: 'oct',
  statutId: 'acc',
  etapes: [],
}

export const titreAxmDemarcheOctDexAcc: TitreDemarchePhaseFind = {
  titreId: 'titreId',
  id: newDemarcheId('h-ax-courdemanges-1988-oct01'),
  typeId: 'oct',
  statutId: 'acc',
  etapes: [
    {
      typeId: 'dex',
      statutId: 'acc',
      ordre: 1,
      date: toCaminoDate('2200-01-01'),
      duree: 2 * 12,
      titreDemarcheId: newDemarcheId('h-ax-courdemanges-1988-oct01'),
    },
  ],
}

export const titrePrmDemarcheOctRpuAcc: TitreDemarchePhaseFind = {
  titreId: 'titreId',
  id: newDemarcheId('m-pr-courdemanges-1988-oct01'),
  typeId: 'oct',
  statutId: 'acc',
  etapes: [
    {
      typeId: 'rpu',
      statutId: 'acc',
      ordre: 1,
      date: toCaminoDate('2200-01-01'),
      dateFin: toCaminoDate('2200-01-02'),
      titreDemarcheId: newDemarcheId('m-pr-courdemanges-1988-oct01'),
    },
  ],
}

export const titreDemarcheOctDpuDateDebut: TitreDemarchePhaseFind = {
  titreId: 'titreId',
  id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
  typeId: 'oct',
  statutId: 'acc',
  etapes: [
    {
      typeId: 'dpu',
      statutId: 'acc',
      ordre: 2,
      date: toCaminoDate('2200-01-01'),
      dateDebut: toCaminoDate('2200-01-02'),
      duree: 2 * 12,
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    },
    {
      typeId: 'dex',
      statutId: 'acc',
      ordre: 1,
      date: toCaminoDate('2200-01-01'),
      dateDebut: toCaminoDate('2200-01-02'),
      duree: 2 * 12,
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    },
  ],
}

export const titreDemarchesOctProlongation: TitreDemarchePhaseFind[] = [
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2200-01-01'),
        dateFin: toCaminoDate('2500-01-01'),
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2200-01-01'),
        dateFin: toCaminoDate('2500-01-01'),
      },
    ],
  },
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-pro01'),
    typeId: 'pro',
    statutId: 'acc',
    ordre: 2,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2300-01-02'),
        dateFin: toCaminoDate('3000-01-01'),
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2300-01-02'),
        dateFin: toCaminoDate('3000-01-01'),
      },
    ],
  },
]

export const titreDemarchesOctAnnulation: TitreDemarchePhaseFind[] = [
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2000-01-02'),
        duree: 20 * 12,
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2000-01-01'),
        duree: 20 * 12,
      },
    ],
  },
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
    typeId: 'ren',
    statutId: 'acc',
    ordre: 2,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2019-01-03'),
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2019-01-02'),
      },
    ],
  },
]

export const titreDemarchesOctAnnulationSansPoints: TitreDemarchePhaseFind[] = [
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
    typeId: 'oct',
    statutId: 'acc',
    ordre: 1,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2000-01-02'),
        duree: 20 * 12,
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2000-01-01'),
        duree: 20 * 12,
      },
    ],
  },
  {
    titreId: 'titreId',
    id: newDemarcheId('h-cx-courdemanges-1988-ren01'),
    typeId: 'ren',
    statutId: 'acc',
    ordre: 2,
    etapes: [
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('2019-01-03'),
      },
      {
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-ren01'),
        typeId: 'dex',
        statutId: 'acc',
        ordre: 1,
        date: toCaminoDate('2019-01-02'),
        points: [{ id: 'point' }],
      },
    ],
  },
]
