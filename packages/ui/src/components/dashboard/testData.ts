import { toCaminoDate, valideAnnee } from 'camino-common/src/date'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CommonTitreDREAL } from 'camino-common/src/titres'

export const titresDreal: CommonTitreDREAL[] = [
  {
    id: 'firstId',
    slug: 'first-id-slug',
    nom: 'first-name',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 0,
    enAttenteDeDREAL: false,
    prochainesEtapes: [],
    derniereEtape: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mcr' }
  },
  {
    id: 'secondId',
    slug: 'second-slug',
    nom: 'Second Nom de titre',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'ptm'
      },
      { nom: '2010-000', referenceTypeId: 'ptm' }
    ],
    titulaires: [
      {
        nom: 'Titulaire3'
      }
    ],
    activitesEnConstruction: 2,
    activitesAbsentes: 0,
    enAttenteDeDREAL: true,
    prochainesEtapes: [ETAPES_TYPES.depotDeLaDemande],
    derniereEtape: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mcr' }
  },
  {
    id: 'thirdId',
    slug: 'third-id-slug',
    nom: 'third-name',
    domaineId: 'm',
    typeId: 'pr',
    titreStatutId: 'dmi',
    references: [],
    titulaires: [
      {
        nom: 'Titulaire1'
      }
    ],
    activitesAbsentes: 0,
    activitesEnConstruction: 3,
    enAttenteDeDREAL: false,
    prochainesEtapes: [],
    derniereEtape: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mcr' }
  },
  {
    id: 'fourthId',
    slug: 'fourth-slug',
    nom: 'Quatrième Nom de titre',
    domaineId: 'c',
    typeId: 'ar',
    titreStatutId: 'dmi',
    references: [
      {
        nom: '2010-001',
        referenceTypeId: 'ptm'
      },
      { nom: '2010-000', referenceTypeId: 'ptm' }
    ],
    titulaires: [
      {
        nom: 'Titulaire 8'
      }
    ],
    activitesEnConstruction: 8,
    activitesAbsentes: 2,
    enAttenteDeDREAL: false,
    prochainesEtapes: [],
    derniereEtape: { date: toCaminoDate('2022-01-01'), etapeTypeId: 'mcr' }
  }
]

export const statistiquesDGTMFake: StatistiquesDGTM = {
  depotEtInstructions: {
    [valideAnnee('2015')]: {
      totalAXMDeposees: 11,
      totalAXMOctroyees: 22,
      totalTitresDeposes: 28,
      totalTitresOctroyes: 89
    },
    [valideAnnee('2016')]: {
      totalAXMDeposees: 14,
      totalAXMOctroyees: 35,
      totalTitresDeposes: 46,
      totalTitresOctroyes: 111
    },
    [valideAnnee('2017')]: {
      totalAXMDeposees: 9,
      totalAXMOctroyees: 20,
      totalTitresDeposes: 34,
      totalTitresOctroyes: 50
    },
    [valideAnnee('2018')]: {
      totalAXMDeposees: 9,
      totalAXMOctroyees: 23,
      totalTitresDeposes: 22,
      totalTitresOctroyes: 73
    },
    [valideAnnee('2019')]: {
      totalAXMDeposees: 14,
      totalAXMOctroyees: 15,
      totalTitresDeposes: 77,
      totalTitresOctroyes: 64
    },
    [valideAnnee('2020')]: {
      totalAXMDeposees: 33,
      totalAXMOctroyees: 13,
      totalTitresDeposes: 95,
      totalTitresOctroyes: 50
    },
    [valideAnnee('2021')]: {
      totalAXMDeposees: 27,
      totalAXMOctroyees: 19,
      totalTitresDeposes: 73,
      totalTitresOctroyes: 48
    },
    [valideAnnee('2022')]: {
      totalAXMDeposees: 12,
      totalAXMOctroyees: 19,
      totalTitresDeposes: 39,
      totalTitresOctroyes: 34
    }
  },
  sdom: {
    [valideAnnee('2015')]: {
      '0': { depose: 0, octroye: 4 },
      '0_potentielle': { depose: 0, octroye: 1 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 26 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2016')]: {
      '0': { depose: 0, octroye: 4 },
      '0_potentielle': { depose: 0, octroye: 4 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 43 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2017')]: {
      '0': { depose: 0, octroye: 2 },
      '0_potentielle': { depose: 0, octroye: 2 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 14 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2018')]: {
      '0': { depose: 0, octroye: 1 },
      '0_potentielle': { depose: 0, octroye: 1 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 30 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2019')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 1 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 19 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2020')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 11 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2021')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 19 },
      '3': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2022')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 9 },
      '3': { depose: 0, octroye: 26 }
    }
  },
  delais: {
    [valideAnnee('2015')]: {
      delaiCommissionDepartementaleEnJours: [591],
      delaiInstructionEnJours: [1341, 496, 1327, 633, 607, 1044],
      delaiDecisionPrefetEnJours: [127]
    },
    [valideAnnee('2017')]: {
      delaiCommissionDepartementaleEnJours: [401, 568, 758, 167],
      delaiInstructionEnJours: [698, 821, 1449, 1823],
      delaiDecisionPrefetEnJours: [12]
    },
    [valideAnnee('2018')]: {
      delaiCommissionDepartementaleEnJours: [387, 273, 100],
      delaiInstructionEnJours: [618],
      delaiDecisionPrefetEnJours: [523]
    },
    [valideAnnee('2019')]: {
      delaiCommissionDepartementaleEnJours: [223, 125, 281],
      delaiInstructionEnJours: [276, 970, 303],
      delaiDecisionPrefetEnJours: [123]
    },
    [valideAnnee('2020')]: {
      delaiCommissionDepartementaleEnJours: [
        546, 415, 85, 85, 49, 49, 55, 72, 86, 55, 319, 284, 140, 56, 72, 181, 68
      ],
      delaiInstructionEnJours: [
        571, 108, 97, 97, 61, 61, 74, 91, 95, 68, 366, 364, 101, 189, 115, 83,
        84, 230, 117
      ],
      delaiDecisionPrefetEnJours: [87]
    },
    [valideAnnee('2021')]: {
      delaiCommissionDepartementaleEnJours: [
        74, 83, 121, 121, 65, 65, 74, 58, 58, 101, 115, 115, 96, 115, 121, 141,
        108, 108, 202, 157, 143, 184, 183, 67
      ],
      delaiInstructionEnJours: [
        87, 117, 166, 166, 90, 90, 87, 83, 83, 113, 160, 160, 110, 160, 166,
        153, 186, 133, 133, 214, 171, 157, 198, 197, 77
      ],
      delaiDecisionPrefetEnJours: [1]
    },
    [valideAnnee('2022')]: {
      delaiCommissionDepartementaleEnJours: [
        64, 64, 58, 53, 52, 52, 114, 99, 61
      ],
      delaiInstructionEnJours: [78, 70, 73, 66, 66, 128, 111, 73],
      delaiDecisionPrefetEnJours: [8]
    }
  }
}
