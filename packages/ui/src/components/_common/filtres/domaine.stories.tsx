import { Meta, Story } from '@storybook/vue3'
import { sortedDomaines } from 'camino-common/src/static/domaines'
import { FiltreDomaine, Props } from './domaine'

const meta: Meta = {
  title: 'Components/Common/Filtres/Domaine',
  component: FiltreDomaine
}
export default meta

export const AllDomaines: Story<Props> = () => (
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
