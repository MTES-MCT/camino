import { PureGranulatsMarins } from './granulats-marins'
import { Meta, Story } from '@storybook/vue3'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Statistiques/GranulatsMarins',
  component: PureGranulatsMarins,
  argTypes: {}
}
export default meta

const data = {
  annees: [
    {
      annee: 2006,
      titresPrw: { quantite: 1, surface: 36000 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 1, surface: 200 },
      volume: 0,
      masse: 0,
      activitesDeposesQuantite: 0,
      activitesDeposesRatio: 0,
      concessionsValides: { quantite: 8, surface: 3340 }
    },
    {
      annee: 2007,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 1, surface: 66 },
      titresCxw: { quantite: 1, surface: 1000 },
      volume: 0,
      masse: 0,
      activitesDeposesQuantite: 0,
      activitesDeposesRatio: 0,
      concessionsValides: { quantite: 9, surface: 4340 }
    },
    {
      annee: 2008,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 2, surface: 977 },
      volume: 0,
      masse: 0,
      activitesDeposesQuantite: 0,
      activitesDeposesRatio: 0,
      concessionsValides: { quantite: 11, surface: 5317 }
    },
    {
      annee: 2009,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 0,
      masse: 0,
      activitesDeposesQuantite: 0,
      activitesDeposesRatio: 0,
      concessionsValides: { quantite: 11, surface: 5317 }
    },
    {
      annee: 2010,
      titresPrw: { quantite: 1, surface: 5327 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 2, surface: 707 },
      volume: 2969364,
      masse: 4454046,
      activitesDeposesQuantite: 9,
      activitesDeposesRatio: 60,
      concessionsValides: { quantite: 12, surface: 5324 }
    },
    {
      annee: 2011,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 4, surface: 3528 },
      volume: 3095681,
      masse: 4643521,
      activitesDeposesQuantite: 11,
      activitesDeposesRatio: 58,
      concessionsValides: { quantite: 16, surface: 8852 }
    },
    {
      annee: 2012,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 1, surface: 5000 },
      volume: 3166140,
      masse: 4749210,
      activitesDeposesQuantite: 12,
      activitesDeposesRatio: 71,
      concessionsValides: { quantite: 16, surface: 13802 }
    },
    {
      annee: 2013,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 4, surface: 3696 },
      volume: 3470248,
      masse: 5205372,
      activitesDeposesQuantite: 16,
      activitesDeposesRatio: 76,
      concessionsValides: { quantite: 20, surface: 17498 }
    },
    {
      annee: 2014,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 2769436,
      masse: 4154154,
      activitesDeposesQuantite: 16,
      activitesDeposesRatio: 84,
      concessionsValides: { quantite: 18, surface: 16521 }
    },
    {
      annee: 2015,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 1, surface: 400 },
      volume: 2843149,
      masse: 4264723,
      activitesDeposesQuantite: 17,
      activitesDeposesRatio: 85,
      concessionsValides: { quantite: 19, surface: 16921 }
    },
    {
      annee: 2016,
      titresPrw: { quantite: 1, surface: 43143 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 2850329,
      masse: 4275493,
      activitesDeposesQuantite: 17,
      activitesDeposesRatio: 85,
      concessionsValides: { quantite: 19, surface: 16921 }
    },
    {
      annee: 2017,
      titresPrw: { quantite: 1, surface: 43240 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 2, surface: 920 },
      volume: 3333008,
      masse: 4999512,
      activitesDeposesQuantite: 19,
      activitesDeposesRatio: 86,
      concessionsValides: { quantite: 21, surface: 17841 }
    },
    {
      annee: 2018,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 3634158,
      masse: 5451237,
      activitesDeposesQuantite: 19,
      activitesDeposesRatio: 90,
      concessionsValides: { quantite: 21, surface: 17841 }
    },
    {
      annee: 2019,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 1, surface: 1030 },
      volume: 3664927,
      masse: 5497390,
      activitesDeposesQuantite: 18,
      activitesDeposesRatio: 86,
      concessionsValides: { quantite: 21, surface: 18071 }
    },
    {
      annee: 2020,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 3747669,
      masse: 5621503,
      activitesDeposesQuantite: 21,
      activitesDeposesRatio: 100,
      concessionsValides: { quantite: 21, surface: 18071 }
    },
    {
      annee: 2021,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 4338720,
      masse: 6508080,
      activitesDeposesQuantite: 21,
      activitesDeposesRatio: 100,
      concessionsValides: { quantite: 21, surface: 18071 }
    },
    {
      annee: 2022,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 613044,
      masse: 919566,
      activitesDeposesQuantite: 1,
      activitesDeposesRatio: 5,
      concessionsValides: { quantite: 20, surface: 17967 }
    },
    {
      annee: 2023,
      titresPrw: { quantite: 0, surface: 0 },
      titresPxw: { quantite: 0, surface: 0 },
      titresCxw: { quantite: 0, surface: 0 },
      volume: 0,
      masse: 0,
      activitesDeposesQuantite: 0,
      activitesDeposesRatio: 0,
      concessionsValides: { quantite: 20, surface: 17967 }
    }
  ],
  surfaceExploration: 43386,
  surfaceExploitation: 17967,
  titresInstructionExploration: 1,
  titresValPrw: 0,
  titresInstructionExploitation: 2,
  titresValCxw: 19,
  titresDmiCxw: null,
  titresModCxw: null,
  titresModPrw: null
}

export const DefaultNoSnapshot: Story = () => (
  <PureGranulatsMarins getStatistiques={() => Promise.resolve(data)} />
)

export const EnConstruction20210402NoSnapshot: Story = () => (
  <PureGranulatsMarins
    getStatistiques={() => Promise.resolve(data)}
    currentDate={toCaminoDate('2021-04-02')}
  />
)

export const Loading: Story = () => (
  <PureGranulatsMarins
    getStatistiques={() => new Promise<any>(resolve => {})}
  />
)
export const WithError: Story = () => (
  <PureGranulatsMarins
    getStatistiques={() => Promise.reject(new Error('because reasons'))}
  />
)
