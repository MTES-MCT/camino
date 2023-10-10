import { Meta, StoryFn } from '@storybook/vue3'
import { TitreStatut } from './titre-statut'
import { titresStatutsArray } from 'camino-common/src/static/titresStatuts'

const meta: Meta = {
  title: 'Components/Common/TitreStatut',
  component: TitreStatut,
  argTypes: {},
}
export default meta

export const All: StoryFn = () => (
  <div style="height:100%;width:100%;background:white" class="dsfr">
    <table>
      <tr>
        <th>Statut de titre</th>
        <th>Rendu</th>
      </tr>
      {Object.values(titresStatutsArray).map(statut => (
        <tr>
          <td>{statut.nom}</td>
          <td>
            <TitreStatut titreStatutId={statut.id} />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
