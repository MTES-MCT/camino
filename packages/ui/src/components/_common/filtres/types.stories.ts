import { Meta } from '@storybook/vue3'
import { DOMAINES_IDS } from 'camino-common/src/static/domaines'
import {
  TitresTypesTypes,
  TITRES_TYPES_TYPES_IDS
} from 'camino-common/src/static/titresTypesTypes'
import { FiltresTypes } from './types'
import MapPattern from '../../_map/pattern.vue'

const meta: Meta = {
  title: 'Common/Filtres/Types',
  component: FiltresTypes
}
export default meta

export const AllTypes = () => ({
  components: { FiltresTypes, MapPattern },
  template: `
    <div style="height:100%;width:100%;background:white">
    <MapPattern
      :domainesIds="[${Object.values(DOMAINES_IDS)
        .map(d => `'${d}'`)
        .join(',')}]"
      :typesIds="[${Object.values(TITRES_TYPES_TYPES_IDS)
        .map(t => `'${t}'`)
        .join(',')}]"
    />
    <table>
      <tr>
        <th>Types</th>
        <th>Rendu</th>
      </tr>
      ${Object.values(TITRES_TYPES_TYPES_IDS)
        .map(
          type =>
            `<tr><td>${type}</td><td><FiltresTypes :element="{id: '${type}', nom: '${TitresTypesTypes[
              type
            ].nom.replaceAll("'", "\\'")}'}" /></td></tr>`
        )
        .join('')}
        ${Object.values(TITRES_TYPES_TYPES_IDS)
          .map(type =>
            Object.values(DOMAINES_IDS)
              .map(
                domaine =>
                  `<tr><td>${type}-${domaine}</td><td><FiltresTypes :element="{id: '${type}-${domaine}', nom: '${TitresTypesTypes[
                    type
                  ].nom.replaceAll("'", "\\'")}'}" /></td></tr>`
              )
              .join('')
          )
          .join('')}
    </table>
    </div>
  `
})
