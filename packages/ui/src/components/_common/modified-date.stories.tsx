import { Meta, StoryFn } from '@storybook/vue3'
import { ModifiedDate } from './modified-date'
import { caminoDateValidator } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Common/ModifiedDate',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: ModifiedDate,
}
export default meta

export const Default: StoryFn = () => <ModifiedDate modified_date={caminoDateValidator.parse('2020-01-01')} />
