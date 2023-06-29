import { ButtonIcon } from './button-icon'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/ButtonIcon',
  component: ButtonIcon,
  argTypes: {},
}
export default meta

const onClick = action('onClick')
export const Default: StoryFn = () => <ButtonIcon title="Mon title" onClick={onClick} icon="close" />
export const Multiple: StoryFn = () => (
  <div>
    <ButtonIcon title="Mon title" onClick={onClick} icon="close" />
    <ButtonIcon title="Mon title2" onClick={onClick} icon="checkbox" />
    <ButtonIcon title="Mon title3" onClick={onClick} icon="download" />
    <ButtonIcon title="Mon title4" onClick={onClick} icon="globe" />
  </div>
)
