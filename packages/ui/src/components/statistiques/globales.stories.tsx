import { yearMonthValidator } from 'camino-common/src/statistiques'
import { PureGlobales } from './globales'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Statistiques/GlobalesNoStoryshots',
  component: PureGlobales,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const DefaultNoSnapshot: StoryFn = () => (
  <PureGlobales
    statistiques={{
      titresActivitesBeneficesEntreprise: 678,
      titresActivitesBeneficesAdministration: 339,
      titresModifies: [
        { mois: yearMonthValidator.parse('2021-05'), quantite: 0 },
        { mois: yearMonthValidator.parse('2021-06'), quantite: 54 },
        { mois: yearMonthValidator.parse('2021-07'), quantite: 320 },
        { mois: yearMonthValidator.parse('2021-08'), quantite: 90 },
        { mois: yearMonthValidator.parse('2021-09'), quantite: 152 },
        { mois: yearMonthValidator.parse('2021-10'), quantite: 259 },
        { mois: yearMonthValidator.parse('2021-11'), quantite: 107 },
        { mois: yearMonthValidator.parse('2021-12'), quantite: 310 },
        { mois: yearMonthValidator.parse('2022-01'), quantite: 178 },
        { mois: yearMonthValidator.parse('2022-02'), quantite: 189 },
        { mois: yearMonthValidator.parse('2022-03'), quantite: 223 },
        { mois: yearMonthValidator.parse('2022-04'), quantite: 147 },
      ],
      demarches: 366,
      "Nombre d'utilisateurs rattachés à une Autorité": 5,
      "Nombre d'utilisateurs rattachés à une Dréal": 38,
      "Nombre d'utilisateurs rattachés à une Déal": 8,
      "Nombre d'utilisateurs rattachés à un ministère": 26,
      "Nombre d'utilisateurs rattachés à une préfecture": 8,
      "Nombre d'utilisateurs affiliés à une entreprise": 128,
      "Nombre d'utilisateurs sur la plateforme": 124,
    }}
  />
)
