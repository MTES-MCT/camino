import { Meta, StoryFn } from '@storybook/vue3'
import { EtapeStatut } from './etape-statut'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'

const meta: Meta = {
  title: 'Components/Common/EtapeStatut',
  component: EtapeStatut,
}
export default meta

export const All: StoryFn = () => (
  <div style="height:100%;width:100%;background:white" class="dsfr">
    <table>
      <tr>
        <th>Statut d'étape</th>
        <th>Rendu</th>
      </tr>
      {Object.values(EtapesStatuts).map(statut => (
        <tr>
          <td>{statut.nom}</td>
          <td>
            <EtapeStatut etapeStatutId={statut.id} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
