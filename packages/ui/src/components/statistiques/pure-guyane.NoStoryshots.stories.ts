import { Meta, Story } from '@storybook/vue3'
import { valideAnnee } from 'camino-common/src/date'
import { StatistiquesGuyaneRest } from 'camino-common/src/statistiques'
import PureGuyane from './pure-guyane.vue'

const meta: Meta = {
  title: 'Components/NoStoryshots/Statistiques/Guyane',
  component: PureGuyane,
  argTypes: {}
}
export default meta

type Props = {
  getStats: () => Promise<{
    rest: StatistiquesGuyaneRest
    graphql: any
  }>
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureGuyane },
  setup() {
    return { args }
  },

  template: '<PureGuyane v-bind="args" />'
})

const data = Promise.resolve({
  rest: {
    arm: {
      depot: {
        [valideAnnee('2017')]: 10,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      octroiEtProlongation: {
        [valideAnnee('2017')]: 20,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      refusees: {
        [valideAnnee('2017')]: 15,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      surface: {
        [valideAnnee('2017')]: 500,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      }
    },
    axm: {
      depot: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      octroiEtProlongation: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      refusees: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      surface: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      }
    },
    prm: {
      depot: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      octroiEtProlongation: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      refusees: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      surface: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      }
    },
    cxm: {
      depot: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      octroiEtProlongation: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      refusees: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      },
      surface: {
        [valideAnnee('2017')]: 1,
        [valideAnnee('2018')]: 2,
        [valideAnnee('2019')]: 3
      }
    }
  },
  statistiques: {
    2017: {
      annee: 2017,
      titresArm: {
        quantite: 26,
        surface: 5500
      },
      titresPrm: {
        quantite: 2,
        surface: 7000
      },
      titresAxm: {
        quantite: 20,
        surface: 2000
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1485,
      carburantConventionnel: 8841,
      carburantDetaxe: 0,
      mercure: 0,
      environnementCout: 0,
      effectifs: 391,
      activitesDeposesQuantite: 439,
      activitesDeposesRatio: 100
    },
    2018: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600
      },
      titresPrm: {
        quantite: 4,
        surface: 11011
      },
      titresAxm: {
        quantite: 23,
        surface: 2300
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79
    },
    2019: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600
      },
      titresPrm: {
        quantite: 4,
        surface: 11011
      },
      titresAxm: {
        quantite: 23,
        surface: 2300
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79
    },
    2020: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600
      },
      titresPrm: {
        quantite: 4,
        surface: 11011
      },
      titresAxm: {
        quantite: 23,
        surface: 2300
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79
    },
    2021: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600
      },
      titresPrm: {
        quantite: 4,
        surface: 11011
      },
      titresAxm: {
        quantite: 23,
        surface: 2300
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79
    },
    2022: {
      annee: 2018,
      titresArm: {
        quantite: 44,
        surface: 8600
      },
      titresPrm: {
        quantite: 4,
        surface: 11011
      },
      titresAxm: {
        quantite: 23,
        surface: 2300
      },
      titresCxm: {
        quantite: 0,
        surface: 0
      },
      orNet: 1320,
      carburantConventionnel: 6866,
      carburantDetaxe: 617,
      mercure: 0,
      environnementCout: 2195137,
      effectifs: 361,
      activitesDeposesQuantite: 523,
      activitesDeposesRatio: 79
    }
  },
  graphql: {
    surfaceExploration: 88736,
    surfaceExploitation: 57627,
    titresArm: 2,
    titresPrm: 18,
    titresAxm: 77,
    titresCxm: 19,
    annees: [
      {
        annee: 2017,
        titresArm: {
          quantite: 26,
          surface: 5500
        },
        titresPrm: {
          quantite: 2,
          surface: 7000
        },
        titresAxm: {
          quantite: 20,
          surface: 2000
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 1485,
        carburantConventionnel: 8841,
        carburantDetaxe: 0,
        mercure: 0,
        environnementCout: 0,
        effectifs: 391,
        activitesDeposesQuantite: 439,
        activitesDeposesRatio: 100
      },
      {
        annee: 2018,
        titresArm: {
          quantite: 44,
          surface: 8600
        },
        titresPrm: {
          quantite: 4,
          surface: 11011
        },
        titresAxm: {
          quantite: 23,
          surface: 2300
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 1320,
        carburantConventionnel: 6866,
        carburantDetaxe: 617,
        mercure: 0,
        environnementCout: 2195137,
        effectifs: 361,
        activitesDeposesQuantite: 523,
        activitesDeposesRatio: 79
      },
      {
        annee: 2019,
        titresArm: {
          quantite: 44,
          surface: 10200
        },
        titresPrm: {
          quantite: 4,
          surface: 19458
        },
        titresAxm: {
          quantite: 15,
          surface: 1500
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 1157,
        carburantConventionnel: 6680,
        carburantDetaxe: 890,
        mercure: 0,
        environnementCout: 2152025,
        effectifs: 394,
        activitesDeposesQuantite: 563,
        activitesDeposesRatio: 93
      },
      {
        annee: 2020,
        titresArm: {
          quantite: 37,
          surface: 7300
        },
        titresPrm: {
          quantite: 0,
          surface: 0
        },
        titresAxm: {
          quantite: 13,
          surface: 1275
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 1058,
        carburantConventionnel: 6553,
        carburantDetaxe: 813,
        mercure: 0,
        environnementCout: 3578596,
        effectifs: 387,
        activitesDeposesQuantite: 523,
        activitesDeposesRatio: 95
      },
      {
        annee: 2021,
        titresArm: {
          quantite: 28,
          surface: 5600
        },
        titresPrm: {
          quantite: 1,
          surface: 4300
        },
        titresAxm: {
          quantite: 19,
          surface: 1850
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 1225,
        carburantConventionnel: 6581,
        carburantDetaxe: 1273,
        mercure: 0,
        environnementCout: 4057103,
        effectifs: 473,
        activitesDeposesQuantite: 488,
        activitesDeposesRatio: 92
      },
      {
        annee: 2022,
        titresArm: {
          quantite: 15,
          surface: 2499
        },
        titresPrm: {
          quantite: 1,
          surface: 4748
        },
        titresAxm: {
          quantite: 22,
          surface: 2030
        },
        titresCxm: {
          quantite: 0,
          surface: 0
        },
        orNet: 0,
        carburantConventionnel: 3172,
        carburantDetaxe: 770,
        mercure: 0,
        environnementCout: 1384773,
        effectifs: 240,
        activitesDeposesQuantite: 216,
        activitesDeposesRatio: 68
      }
    ]
  }
})

export const Default = Template.bind(
  {},
  {
    getStats: () => data
  }
)

export const DateSetTo20220830 = Template.bind(
  {},
  {
    getStats: () => data,
    currentDate: '2022-08-30'
  }
)

export const DateSetTo20220902 = Template.bind(
  {},
  {
    getStats: () => data,
    currentDate: '2022-09-02'
  }
)

export const Loading = Template.bind(
  {},
  {
    getStats: () => new Promise<any>(resolve => {})
  }
)

export const WithError = Template.bind(
  {},
  {
    getStats: () => Promise.reject(new Error('because reasons'))
  }
)
