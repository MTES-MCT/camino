import { Meta, Story } from '@storybook/vue3'
import Domaine from './domaine.vue'
import {DomaineId, DOMAINES_IDS} from "@/../../common/types";

const meta: Meta = {
  title: 'Common/Domaine',
  component: Domaine,
  argTypes: {
    domaineId: { name: 'string', required: false },
  }
}
export default meta

type Props = {
  domaineId: DomaineId
}

const Template: Story<Props> = (args: Props) => ({
  components: { Domaine },
  setup() {
    return { args }
  },
  template: '<Domaine v-bind="args"/>',
})

export const Simple = Template.bind({})
Simple.args = {
  domaineId: "w"
}
export const Empty = Template.bind({})
Empty.args = {
}

//FIXME pas de storyshot
export const AllDomaines = ({domaineIds}: { domaineIds: DomaineId[]}) => ({
  components: { Domaine },
  setup() {
    return { domaineIds }
  },
  template: `
      <div v-for="item in domaineIds" :key="item" style="display: inline">
        <Domaine :domaine-id="item"/>
      </div>
  `,
})

AllDomaines.args = {
  domaineIds: DOMAINES_IDS
}
