import { valideAnnee } from 'camino-common/src/date'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'

export const statistiquesDGTMFake: StatistiquesDGTM = {
  depotEtInstructions: {
    [valideAnnee('2015')]: {
      totalAXMDeposees: 11,
      totalAXMOctroyees: 22,
      totalTitresDeposes: 32,
      totalTitresOctroyes: 99
    },
    [valideAnnee('2016')]: {
      totalAXMDeposees: 14,
      totalAXMOctroyees: 32,
      totalTitresDeposes: 50,
      totalTitresOctroyes: 112
    },
    [valideAnnee('2017')]: {
      totalAXMDeposees: 9,
      totalAXMOctroyees: 20,
      totalTitresDeposes: 38,
      totalTitresOctroyes: 56
    },
    [valideAnnee('2018')]: {
      totalAXMDeposees: 9,
      totalAXMOctroyees: 23,
      totalTitresDeposes: 25,
      totalTitresOctroyes: 77
    },
    [valideAnnee('2019')]: {
      totalAXMDeposees: 14,
      totalAXMOctroyees: 15,
      totalTitresDeposes: 85,
      totalTitresOctroyes: 65
    },
    [valideAnnee('2020')]: {
      totalAXMDeposees: 33,
      totalAXMOctroyees: 13,
      totalTitresDeposes: 104,
      totalTitresOctroyes: 50
    },
    [valideAnnee('2021')]: {
      totalAXMDeposees: 27,
      totalAXMOctroyees: 19,
      totalTitresDeposes: 77,
      totalTitresOctroyes: 50
    },
    [valideAnnee('2022')]: {
      totalAXMDeposees: 11,
      totalAXMOctroyees: 19,
      totalTitresDeposes: 42,
      totalTitresOctroyes: 37
    }
  }
}
