import { testBlankUser } from 'camino-common/src/tests-utils'
import { CaminoAccessError } from './error'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Error',
  component: CaminoAccessError,
}
export default meta

export const NotConnected: StoryFn = () => <CaminoAccessError user={{ ...testBlankUser, role: 'super' }} />
export const Forbidden: StoryFn = () => <CaminoAccessError user={undefined} />
