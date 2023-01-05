import { TypeEdit } from './type-edit'
import { Meta, Story } from '@storybook/vue3'
import {
  EtapeStatutId,
  ETAPES_STATUTS
} from 'camino-common/src/static/etapesStatuts'
import {
  ETAPES_TYPES,
  etapesTypesIds,
  EtapeTypeId
} from 'camino-common/src/static/etapesTypes'
import { action } from '@storybook/addon-actions'
import { ref } from 'vue'
import { etape } from '../../api/titres-etapes'

const meta: Meta = {
  title: 'Components/Etape/TypeEdit',
  component: TypeEdit,
  argTypes: {}
}
export default meta

const onEtapeChange = action('onEtapeChange')

// FIXME comment gérer ça ?
const myStatutId = ref<EtapeStatutId | null>(ETAPES_STATUTS.EN_CONSTRUCTION)
const myEtapeTypeId = ref<EtapeTypeId | null>(ETAPES_TYPES.demande)
let myEtape: any = {
  statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
  type: { id: ETAPES_TYPES.demande }
}

export const Simple: Story = () => (
  <TypeEdit
    onEtapeChange={(statut, etapeTypeId) => {
      onEtapeChange(statut, etapeTypeId)
      myEtape = { statutId: statut, type: { id: etapeTypeId } }
    }}
    etapeIsDemandeEnConstruction={false}
    etapesTypesIds={etapesTypesIds}
    etape={myEtape}
  />
)
