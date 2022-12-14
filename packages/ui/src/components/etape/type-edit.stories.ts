import { Props, TypeEdit } from './type-edit'
import { Meta, Story } from '@storybook/vue3'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import {
  EtapeStatutId,
  ETAPES_STATUTS
} from 'camino-common/src/static/etapesStatuts'
import {
  EtapeTypeId,
  ETAPES_TYPES,
  etapesTypesIds
} from 'camino-common/src/static/etapesTypes'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/TypeEdit',
  component: TypeEdit,
  argTypes: {}
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { TypeEdit },
  data: () => ({
    etape: {
      statutId: ETAPES_STATUTS.EN_CONSTRUCTION,
      incertitudes: { date: false },
      date: toCaminoDate('2022-01-02'),
      type: { id: ETAPES_TYPES.demande }
    }
  }),
  setup() {
    return { args }
  },
  methods: {
    completeUpdate: action('completeUpdate'),
    typeUpdate: action('typeUpdate'),
    updateEtape: action('update:etape')
  },
  template: `<TypeEdit  v-bind="args" :etape="etape" @complete-update="completeUpdate" @type-update="typeUpdate" @update:etape="updateEtape" />`
})
export const Simple = Template.bind({})
Simple.args = {
  userIsAdmin: true,
  etapesTypesIds,
  etapeIsDemandeEnConstruction: false
}
