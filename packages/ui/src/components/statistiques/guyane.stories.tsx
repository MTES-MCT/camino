import { Meta, StoryFn } from '@storybook/vue3'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date.js'
import { StatistiquesGuyane } from 'camino-common/src/statistiques.js'
import { PureGuyane } from './guyane'

const meta: Meta = {
  title: 'Components/Statistiques/Guyane',
  component: PureGuyane,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const data: Promise<StatistiquesGuyane> = Promise.resolve({
  data: {
    arm: {
      depot: {
        [toCaminoAnnee('2017')]: 10,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      octroiEtProlongation: {
        [toCaminoAnnee('2017')]: 20,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      refusees: {
        [toCaminoAnnee('2017')]: 15,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      surface: {
        [toCaminoAnnee('2017')]: 500,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
    },
    axm: {
      depot: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      octroiEtProlongation: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      refusees: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      surface: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
    },
    prm: {
      depot: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      octroiEtProlongation: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      refusees: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      surface: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
    },
    cxm: {
      depot: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      octroiEtProlongation: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      refusees: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
      surface: {
        [toCaminoAnnee('2017')]: 1,
        [toCaminoAnnee('2018')]: 2,
        [toCaminoAnnee('2019')]: 3,
      },
    },
    surfaceExploration: 88736,
    surfaceExploitation: 57627,
    titresArm: 2,
    titresPrm: 18,
    titresAxm: 77,
    titresCxm: 19,
    annees: [
      {
        annee: toCaminoAnnee('2017'),
        titresArm: {
          quantite: 26,
          surface: 5500,
        },
        titresPrm: {
          quantite: 2,
          surface: 7000,
        },
        titresAxm: {
          quantite: 20,
          surface: 2000,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 1485,
        carburantConventionnel: 8841,
        carburantDetaxe: 0,
        mercure: 0,
        environnementCout: 0,
        effectifs: 391,
        activitesDeposesQuantite: 439,
        activitesDeposesRatio: 100,
      },
      {
        annee: toCaminoAnnee('2018'),
        titresArm: {
          quantite: 44,
          surface: 8600,
        },
        titresPrm: {
          quantite: 4,
          surface: 11011,
        },
        titresAxm: {
          quantite: 23,
          surface: 2300,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 1320,
        carburantConventionnel: 6866,
        carburantDetaxe: 617,
        mercure: 0,
        environnementCout: 2195137,
        effectifs: 361,
        activitesDeposesQuantite: 523,
        activitesDeposesRatio: 79,
      },
      {
        annee: toCaminoAnnee('2019'),
        titresArm: {
          quantite: 44,
          surface: 10200,
        },
        titresPrm: {
          quantite: 4,
          surface: 19458,
        },
        titresAxm: {
          quantite: 15,
          surface: 1500,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 1157,
        carburantConventionnel: 6680,
        carburantDetaxe: 890,
        mercure: 0,
        environnementCout: 2152025,
        effectifs: 394,
        activitesDeposesQuantite: 563,
        activitesDeposesRatio: 93,
      },
      {
        annee: toCaminoAnnee('2020'),
        titresArm: {
          quantite: 37,
          surface: 7300,
        },
        titresPrm: {
          quantite: 0,
          surface: 0,
        },
        titresAxm: {
          quantite: 13,
          surface: 1275,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 1058,
        carburantConventionnel: 6553,
        carburantDetaxe: 813,
        mercure: 0,
        environnementCout: 3578596,
        effectifs: 387,
        activitesDeposesQuantite: 523,
        activitesDeposesRatio: 95,
      },
      {
        annee: toCaminoAnnee('2021'),
        titresArm: {
          quantite: 28,
          surface: 5600,
        },
        titresPrm: {
          quantite: 1,
          surface: 4300,
        },
        titresAxm: {
          quantite: 19,
          surface: 1850,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 1225,
        carburantConventionnel: 6581,
        carburantDetaxe: 1273,
        mercure: 0,
        environnementCout: 4057103,
        effectifs: 473,
        activitesDeposesQuantite: 488,
        activitesDeposesRatio: 92,
      },
      {
        annee: toCaminoAnnee('2022'),
        titresArm: {
          quantite: 15,
          surface: 2499,
        },
        titresPrm: {
          quantite: 1,
          surface: 4748,
        },
        titresAxm: {
          quantite: 22,
          surface: 2030,
        },
        titresCxm: {
          quantite: 0,
          surface: 0,
        },
        orNet: 0,
        carburantConventionnel: 3172,
        carburantDetaxe: 770,
        mercure: 0,
        environnementCout: 1384773,
        effectifs: 240,
        activitesDeposesQuantite: 216,
        activitesDeposesRatio: 68,
      },
    ],
  },
  parAnnee: {
    2017: {
      annee: 2017,
      titresArm: {
        quantite: 26,
        surface: 5500,
      },
      titresPrm: {
        quantite: 2,
        surface: 7000,
      },
      titresAxm: {
        quantite: 20,
        surface: 2000,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1485,
      carburantConventionnel: 8841,
      carburantDetaxe: 0,
      mercure: 0,
      environnementCout: 0,
      effectifs: 391,
      activitesDeposesQuantite: 439,
      activitesDeposesRatio: 100,
    },
    2018: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600,
      },
      titresPrm: {
        quantite: 4,
        surface: 11011,
      },
      titresAxm: {
        quantite: 23,
        surface: 2300,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79,
    },
    2019: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600,
      },
      titresPrm: {
        quantite: 4,
        surface: 11011,
      },
      titresAxm: {
        quantite: 23,
        surface: 2300,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79,
    },
    2020: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600,
      },
      titresPrm: {
        quantite: 4,
        surface: 11011,
      },
      titresAxm: {
        quantite: 23,
        surface: 2300,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79,
    },
    2021: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600,
      },
      titresPrm: {
        quantite: 4,
        surface: 11011,
      },
      titresAxm: {
        quantite: 23,
        surface: 2300,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79,
    },
    2022: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600,
      },
      titresPrm: {
        quantite: 4,
        surface: 11011,
      },
      titresAxm: {
        quantite: 23,
        surface: 2300,
      },
      titresCxm: {
        quantite: 0,
        surface: 0,
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79,
    },
  },
})

export const DefaultNoSnapshot: StoryFn = () => <PureGuyane getStats={() => data} currentDate={toCaminoDate('2023-08-30')} />
export const DateSetTo20220830NoSnapshot: StoryFn = () => <PureGuyane getStats={() => data} currentDate={toCaminoDate('2022-08-30')} />
export const DateSetTo20220902NoSnapshot: StoryFn = () => <PureGuyane getStats={() => data} currentDate={toCaminoDate('2022-09-02')} />
export const Loading: StoryFn = () => <PureGuyane getStats={() => new Promise<any>(_resolve => {})} currentDate={toCaminoDate('2023-09-30')} />
export const WithError: StoryFn = () => <PureGuyane getStats={() => Promise.reject(new Error('because reasons'))} currentDate={toCaminoDate('2023-09-30')} />
