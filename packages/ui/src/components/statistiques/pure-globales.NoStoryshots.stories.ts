import PureGlobales from './pure-globales.vue'
import { Meta, Story } from '@storybook/vue3'
import { Statistiques } from 'camino-common/src/statistiques'

const meta: Meta = {
  title: 'Components/NoStoryshots/Statistiques/Globales',
  component: PureGlobales,
  argTypes: {}
}
export default meta

type Props = { statistiques: Statistiques }

const Template: Story<Props> = (args: Props) => ({
  components: { PureGlobales },
  setup() {
    return { args }
  },

  template: '<PureGlobales v-bind="args" />>'
})

export const Default = Template.bind({})
Default.args = {
  statistiques: {
    titresActivitesBeneficesEntreprise: 678,
    titresActivitesBeneficesAdministration: 339,
    recherches: [
      { mois: '2021-05', quantite: 0 },
      { mois: '2021-06', quantite: 0 },
      { mois: '2021-07', quantite: 3657 },
      { mois: '2021-08', quantite: 2787 },
      { mois: '2021-09', quantite: 2505 },
      { mois: '2021-10', quantite: 3905 },
      { mois: '2021-11', quantite: 4644 },
      { mois: '2021-12', quantite: 3022 },
      { mois: '2022-01', quantite: 5358 },
      { mois: '2022-02', quantite: 5162 },
      { mois: '2022-03', quantite: 6769 },
      { mois: '2022-04', quantite: 2612 }
    ],
    titresModifies: [
      { mois: '2021-05', quantite: 0 },
      { mois: '2021-06', quantite: 54 },
      { mois: '2021-07', quantite: 320 },
      { mois: '2021-08', quantite: 90 },
      { mois: '2021-09', quantite: 152 },
      { mois: '2021-10', quantite: 259 },
      { mois: '2021-11', quantite: 107 },
      { mois: '2021-12', quantite: 310 },
      { mois: '2022-01', quantite: 178 },
      { mois: '2022-02', quantite: 189 },
      { mois: '2022-03', quantite: 223 },
      { mois: '2022-04', quantite: 147 }
    ],
    actions: 27.6,
    sessionDuree: 8,
    telechargements: 139,
    demarches: 366,
    signalements: 352,
    reutilisations: 6,
    utilisateurs: {
      rattachesAUnTypeDAdministration: {
        aut: 5,
        dea: 8,
        dre: 38,
        min: 26,
        ope: 24,
        pre: 8
      },
      rattachesAUneEntreprise: 128,
      visiteursAuthentifies: 124
    }
  }
}
