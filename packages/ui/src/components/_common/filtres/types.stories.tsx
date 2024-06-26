import { Meta, StoryFn } from '@storybook/vue3'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { TitresTypesTypes, TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
import { FiltresTypes, Props } from './types'
import { MapPattern } from '../../_map/pattern'

const meta: Meta<typeof FiltresTypes> = {
  title: 'Components/Common/Filtres/Types',
  component: FiltresTypes,
}
export default meta

export const AllTypes: StoryFn<Props> = () => (
  <div style="height:100%;width:100%;background:white" class="fr-table">
    <MapPattern />
    <table>
      <thead>
        <th>Types</th>
        <th>Rendu</th>
      </thead>
      {Object.values(TITRES_TYPES_TYPES_IDS).map(type => (
        <tr>
          <td>{type}</td>
          <td>
            <FiltresTypes element={{ id: type, nom: TitresTypesTypes[type].nom }} />
          </td>
        </tr>
      ))}
      {Object.values(TITRES_TYPES_TYPES_IDS).map(type =>
        Object.values(DOMAINES_IDS).map(domaine => (
          <tr>
            <td>
              {type}-{domaine}
            </td>
            <td>
              <FiltresTypes
                element={{
                  id: `${type}-${domaine}`,
                  nom: TitresTypesTypes[type].nom,
                }}
              />
            </td>
          </tr>
        ))
      )}
    </table>
  </div>
)
