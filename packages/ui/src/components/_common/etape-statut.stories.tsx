import { Meta, StoryFn } from '@storybook/vue3'
import { AvisStatut, EtapeStatut } from './etape-statut'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'
import { AvisStatutIds } from 'camino-common/src/static/avisTypes'

const meta: Meta = {
  title: 'Components/Common/EtapeStatut',
  component: EtapeStatut,
}
export default meta

export const All: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
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
    <table>
      <tr>
        <th>Statut des avis</th>
        <th>Rendu</th>
      </tr>
      {AvisStatutIds.map(statutId => (
        <tr>
          <td>{statutId}</td>
          <td>
            <AvisStatut avisStatutId={statutId} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
