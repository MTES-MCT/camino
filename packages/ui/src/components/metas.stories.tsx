import { testBlankUser } from 'camino-common/src/tests-utils'
import { PureMetas } from './metas'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Metas',
  component: PureMetas,
}
export default meta

export const NotConnected: StoryFn = () => <PureMetas user={null} currentRoute={{ name: 'metas', query: {}, params: {} }} />
export const Forbidden: StoryFn = () => <PureMetas user={{ ...testBlankUser, role: 'defaut' }} currentRoute={{ name: 'metas', query: {}, params: {} }} />
export const Super: StoryFn = () => <PureMetas user={{ ...testBlankUser, role: 'super' }} currentRoute={{ name: 'metas', query: {}, params: {} }} />
