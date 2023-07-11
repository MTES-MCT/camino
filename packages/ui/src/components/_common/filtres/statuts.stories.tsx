import { Meta, StoryFn } from '@storybook/vue3'
import { FiltresStatuts } from './statuts'
import { EtapesStatuts } from 'camino-common/src/static/etapesStatuts'

const meta: Meta<typeof FiltresStatuts> = {
  title: 'Components/Common/Filtres/Statuts',
  component: FiltresStatuts,
}
export default meta

export const AllStatuts: StoryFn = () => (
  <div style="height:100%;width:100%;background:white">
    <table>
      <tr>
        <th>Statuts</th>
        <th>Rendu</th>
      </tr>
      {Object.values(EtapesStatuts).map(statut => (
        <tr>
          <td>{statut}</td>
          <td>
            <FiltresStatuts
              element={{
                couleur: statut.couleur,
                nom: statut.nom,
              }}
            />
          </td>
        </tr>
      ))}
    </table>
  </div>
)
