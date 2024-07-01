import { Meta, StoryFn } from '@storybook/vue3'
import { ActiviteStatut } from './activite-statut'
import { activitesStatuts } from 'camino-common/src/static/activitesStatuts'

const meta: Meta = {
  title: 'Components/Common/ActiviteStatut',
  component: ActiviteStatut,
  argTypes: {},
}
export default meta

export const All: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Statut de titre</th>
        <th>Rendu</th>
      </tr>
      {Object.values(activitesStatuts).map(statut => (
        <tr>
          <td>{statut.nom}</td>
          <td>
            <ActiviteStatut activiteStatutId={statut.id} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
