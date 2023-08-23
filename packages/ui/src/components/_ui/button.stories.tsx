import { Button } from './button'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Deprecated/Components/UI/Button',
  component: Button,
}
export default meta

const onClick = action('onClick')
export const Default: StoryFn = () => <Button title="Mon title" onClick={onClick} render={() => <>Contenu du bouton</>} />
export const Multiple: StoryFn = () => (
  <div>
    <Button title="Mon title" onClick={onClick} render={() => <>Contenu du bouton</>} />
    <Button title="Mon title2" onClick={onClick} render={() => <h1>Contenu du bouton</h1>} />
  </div>
)
