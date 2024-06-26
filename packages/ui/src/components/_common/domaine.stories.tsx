import { Meta, StoryFn } from '@storybook/vue3'
import { Domaine } from './domaine'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines'

const meta: Meta = {
  title: 'Components/Common/Domaine',
  component: Domaine,
  argTypes: {
    domaineId: { name: 'string', required: false },
  },
}
export default meta

export const Default: StoryFn = () => <Domaine />
export const AllDomaines: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Domaine</th>
        <th>Rendu</th>
      </tr>
      {Object.values(DOMAINES_IDS).map(domaine => (
        <tr>
          <td>{domaine}</td>
          <td>
            <Domaine domaineId={domaine} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
