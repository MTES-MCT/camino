import { testBlankUser } from 'camino-common/src/tests-utils'
import { PureMetas } from './metas'
import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Metas',
  component: PureMetas,
  decorators: [vueRouter([{ name: 'meta-activite' }, { name: 'meta-etape' }, { name: 'meta-demarche' }, { name: 'meta-titre' }, { name: 'meta' }])],
}
export default meta

export const NotConnected: StoryFn = () => <PureMetas user={null} currentRoute={{ name: 'metas', query: {} }} />
export const Forbidden: StoryFn = () => <PureMetas user={{ ...testBlankUser, role: 'defaut' }} currentRoute={{ name: 'metas', query: {} }} />
export const Super: StoryFn = () => <PureMetas user={{ ...testBlankUser, role: 'super' }} currentRoute={{ name: 'metas', query: {} }} />
