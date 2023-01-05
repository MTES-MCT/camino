import PureMinerauxMetauxMetropole from './pure-mineraux-metaux-metropole.vue'
import { Meta, Story } from '@storybook/vue3'
import { StatistiquesMinerauxMetauxMetropole } from 'camino-common/src/statistiques'
import { toCaminoAnnee } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Statistiques/MinerauxMetauxMetropole',
  component: PureMinerauxMetauxMetropole,
  argTypes: {}
}
export default meta

type Props = { getStats: () => Promise<StatistiquesMinerauxMetauxMetropole> }

const Template: Story<Props> = (args: Props) => ({
  components: { PureMinerauxMetauxMetropole },
  setup() {
    return { args }
  },

  template: '<PureMinerauxMetauxMetropole v-bind="args" />'
})

export const DefaultNoSnapshot = Template.bind(
  {},
  {
    getStats: () =>
      Promise.resolve({
        substances: {
          aloh: {
            [toCaminoAnnee('2009')]: 178.7,
            [toCaminoAnnee('2010')]: 132.302,
            [toCaminoAnnee('2011')]: 117.7,
            [toCaminoAnnee('2012')]: 65.336,
            [toCaminoAnnee('2013')]: 109.602,
            [toCaminoAnnee('2014')]: 71.07,
            [toCaminoAnnee('2015')]: 80.578,
            [toCaminoAnnee('2016')]: 112.445,
            [toCaminoAnnee('2017')]: 131.012,
            [toCaminoAnnee('2018')]: 138.8,
            [toCaminoAnnee('2019')]: 120.76,
            [toCaminoAnnee('2020')]: 123.49600000000001,
            [toCaminoAnnee('2021')]: 142.764
          },
          naca: {
            [toCaminoAnnee('2009')]: {
              '27': 7.684,
              '44': 2692.7,
              '75': 48.724,
              '76': 867.001,
              '84': 635.592,
              '93': 274.732
            },
            [toCaminoAnnee('2010')]: {
              '27': 11.645,
              '44': 2995.599,
              '75': 37.23,
              '76': 990.091,
              '84': 579.385,
              '93': 500.564
            },
            [toCaminoAnnee('2011')]: {
              '27': 0,
              '44': 2959.7,
              '75': 32.425,
              '76': 958.849,
              '84': 959.442,
              '93': 421.48
            },
            [toCaminoAnnee('2012')]: {
              '27': 0,
              '44': 2426.62,
              '75': 35.97,
              '76': 797.099,
              '84': 936.78,
              '93': 1042.67
            },
            [toCaminoAnnee('2013')]: {
              '27': 0,
              '44': 2703.049,
              '75': 37.79,
              '76': 1010.892,
              '84': 907.994,
              '93': 1300.854
            },
            [toCaminoAnnee('2014')]: {
              '27': 0,
              '44': 1552.197,
              '75': 34.285,
              '76': 1062.216,
              '84': 763.55,
              '93': 843.83
            },
            [toCaminoAnnee('2015')]: {
              '27': 0,
              '44': 2444.74,
              '75': 37.303,
              '76': 1007.542,
              '84': 799.949,
              '93': 135.02
            },
            [toCaminoAnnee('2016')]: {
              '27': 0,
              '44': 2377.175,
              '75': 35.841,
              '76': 926.388,
              '84': 830.577,
              '93': 95.859
            },
            [toCaminoAnnee('2017')]: {
              '27': 0,
              '44': 2585.934,
              '75': 34.219,
              '76': 1082.021,
              '84': 869.676,
              '93': 91.718
            },
            [toCaminoAnnee('2018')]: {
              '27': 0,
              '44': 2481.271,
              '75': 31.71,
              '76': 997.862,
              '84': 870.718,
              '93': 150.524
            },
            [toCaminoAnnee('2019')]: {
              '27': 0,
              '44': 2537.412,
              '75': 36.357,
              '76': 997.862,
              '84': 792.394,
              '93': 196.828
            },
            [toCaminoAnnee('2020')]: {
              '44': 0,
              '75': 0,
              '76': 0,
              '84': 0,
              '93': 0
            },
            [toCaminoAnnee('2021')]: {
              '44': 0,
              '75': 0,
              '76': 0,
              '84': 0,
              '93': 0
            }
          },
          nacb: {
            [toCaminoAnnee('2020')]: {
              '44': 0,
              '75': 1.0224,
              '76': 1089.707,
              '84': 0,
              '93': 0
            },
            [toCaminoAnnee('2021')]: {
              '44': 0,
              '75': 1.8883,
              '76': 0,
              '84': 0,
              '93': 0
            }
          },
          nacc: {
            [toCaminoAnnee('2020')]: {
              '44': 0,
              '75': 0,
              '76': 0,
              '84': 470.054,
              '93': 215.397
            },
            [toCaminoAnnee('2021')]: {
              '44': 0,
              '75': 0,
              '76': 1212.682,
              '84': 430.545,
              '93': 194.664
            }
          }
        },
        surfaceExploitation: 21050,
        surfaceExploration: 297966,
        titres: {
          instructionExploitation: 2,
          instructionExploration: 11,
          valCxm: 19,
          valPrm: 3
        },
        fiscaliteParSubstanceParAnnee: {
          aloh: {
            [toCaminoAnnee('2021')]: 1_224_000,
            [toCaminoAnnee('2022')]: 1_250_000
          },
          naca: {
            [toCaminoAnnee('2021')]: 1_224_000,
            [toCaminoAnnee('2022')]: 1_250_000
          },
          nacb: {
            [toCaminoAnnee('2021')]: 1_225_000,
            [toCaminoAnnee('2022')]: 700
          },
          nacc: {
            [toCaminoAnnee('2021')]: 800,
            [toCaminoAnnee('2022')]: 2_000
          }
        },
        prm: {
          depot: {
            2017: 0,
            2018: 2,
            2019: 0,
            2020: 4,
            2021: 0
          },
          octroiEtProlongation: {
            2017: 0,
            2018: 1,
            2019: 3,
            2020: 4,
            2021: 0
          },
          refusees: {
            2017: 0,
            2018: 1,
            2019: 0,
            2020: 0,
            2021: 1
          },
          surface: {
            2017: 0,
            2018: 3000,
            2019: 0,
            2020: 50000,
            2021: 0
          }
        },
        cxm: {
          depot: {
            2017: 0,
            2018: 2,
            2019: 0,
            2020: 4,
            2021: 0
          },
          octroiEtProlongation: {
            2017: 0,
            2018: 1,
            2019: 3,
            2020: 4,
            2021: 0
          },
          refusees: {
            2017: 0,
            2018: 1,
            2019: 0,
            2020: 0,
            2021: 1
          },
          surface: {
            2017: 0,
            2018: 3000,
            2019: 0,
            2020: 50000,
            2021: 0
          }
        }
      })
  }
)

export const Loading = Template.bind(
  {},
  {
    getStats: () =>
      new Promise<StatistiquesMinerauxMetauxMetropole>(resolve => {})
  }
)

export const WithError = Template.bind(
  {},
  {
    getStats: () => Promise.reject(new Error('because reasons'))
  }
)
