import { Meta } from '@storybook/vue3'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { FiltresDomaines } from './domaines'

const meta: Meta = {
  title: 'Common/Filtres/Domaines',
  component: FiltresDomaines
}
export default meta

export const AllDomaines = () => ({
  components: { FiltresDomaines },
  template: `
    <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Domaines</th>
        <th>Rendu</th>
      </tr>
      ${Object.values(DOMAINES_IDS)
        .map(
          domaine =>
            `<tr><td>${domaine}</td><td><FiltresDomaines :element="{id: '${domaine}'}" /></td></tr>`
        )
        .join('')}
    </table>
    </div>
  `
})
