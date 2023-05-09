import { Meta, StoryFn } from '@storybook/vue3'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { FiltreDomaine } from './domaine'

const meta: Meta<typeof FiltreDomaine> = {
  title: 'Components/Common/Filtres/Domaine',
  component: FiltreDomaine,
}
export default meta

export const AllDomaines: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Domaines</th>
        <th>Rendu</th>
      </tr>
      {sortedDomaines.map(domaine => (
        <tr>
          <td>{domaine.id}</td>
          <td>
            <FiltreDomaine element={domaine} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
