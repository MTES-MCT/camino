import { Meta } from '@storybook/vue3'
import {
  TitresStatutIds,
  TitresStatuts
} from 'camino-common/src/static/titresStatuts'
import { FiltresStatuts } from './statuts'

const meta: Meta = {
  title: 'Common/Filtres/Statuts',
  component: FiltresStatuts
}
export default meta

export const AllStatuts = () => ({
  components: { FiltresStatuts },
  template: `
    <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Statuts</th>
        <th>Rendu</th>
      </tr>
      ${Object.values(TitresStatutIds)
        .map(
          statut =>
            `<tr><td>${statut}</td><td><FiltresStatuts :element="{couleur: '${
              TitresStatuts[statut].couleur
            }', nom: '${TitresStatuts[statut].nom.replaceAll(
              "'",
              "\\'"
            )}'}" /></td></tr>`
        )
        .join('')}
    </table>
    </div>
  `
})
