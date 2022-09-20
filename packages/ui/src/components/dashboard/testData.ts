import { valideAnnee } from 'camino-common/src/date'
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
    enAttenteDeDREAL: false
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
        type: { nom: 'PTMG' }
      },
      { nom: '2010-000', type: { nom: 'PTMG' } }
    ],
    titulaires: [
      {
        nom: 'Titulaire3'
      }
    ],
    activitesEnConstruction: 2,
    activitesAbsentes: 0,
    enAttenteDeDREAL: true
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
    enAttenteDeDREAL: false
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
        type: { nom: 'PTMG' }
      },
      { nom: '2010-000', type: { nom: 'PTMG' } }
    ],
    titulaires: [
      {
        nom: 'Titulaire 8'
      }
    ],
    activitesEnConstruction: 8,
    activitesAbsentes: 2,
    enAttenteDeDREAL: false
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
      '2': { depose: 0, octroye: 26 }
    },
    [valideAnnee('2016')]: {
      '0': { depose: 0, octroye: 4 },
      '0_potentielle': { depose: 0, octroye: 4 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 43 }
    },
    [valideAnnee('2017')]: {
      '0': { depose: 0, octroye: 2 },
      '0_potentielle': { depose: 0, octroye: 2 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 14 }
    },
    [valideAnnee('2018')]: {
      '0': { depose: 0, octroye: 1 },
      '0_potentielle': { depose: 0, octroye: 1 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 30 }
    },
    [valideAnnee('2019')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 1 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 19 }
    },
    [valideAnnee('2020')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 11 }
    },
    [valideAnnee('2021')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 19 }
    },
    [valideAnnee('2022')]: {
      '0': { depose: 0, octroye: 0 },
      '0_potentielle': { depose: 0, octroye: 0 },
      '1': { depose: 0, octroye: 0 },
      '2': { depose: 0, octroye: 9 }
    }
  }
}
