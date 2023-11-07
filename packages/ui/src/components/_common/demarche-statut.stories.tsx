import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheStatut } from './demarche-statut'
import { sortedDemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'

const meta: Meta = {
  title: 'Components/Common/DemarcheStatut',
  component: DemarcheStatut,
}
export default meta

export const All: StoryFn = () => (
  <div style="height:100%;width:100%;background:white" class="dsfr">
    <table>
      <tr>
        <th>Statut de titre</th>
        <th>Rendu</th>
      </tr>
      {Object.values(sortedDemarchesStatuts).map(statut => (
        <tr>
          <td>{statut.nom}</td>
          <td>
            <DemarcheStatut demarcheStatutId={statut.id} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
