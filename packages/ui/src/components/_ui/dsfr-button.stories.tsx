import { DsfrButton, buttonTypes, buttonSizes, DsfrButtonIcon } from './dsfr-button'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/DsfrButton',
  component: DsfrButton,
  argTypes: {},
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onClick = action('onClick')
export const Default: StoryFn = () => <DsfrButton title="Mon title" onClick={onClick} />
export const Disabled: StoryFn = () => <DsfrButton title="Mon title" disabled={true} onClick={onClick} />
export const All: StoryFn = () => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {buttonTypes.map(buttonType => (
      <div class="fr-pb-4w">
        {buttonSizes.map(buttonSize => (
          <DsfrButton class="fr-mr-4w" title={`Mon title ${buttonType}/${buttonSize}`} onClick={onClick} buttonType={buttonType} buttonSize={buttonSize} />
        ))}
      </div>
    ))}
  </div>
)

export const AllIcon: StoryFn = () => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {buttonTypes.map(buttonType => (
      <div class="fr-pb-4w">
        {buttonSizes.map(buttonSize => (
          <DsfrButtonIcon class="fr-mr-4w" title={`Mon title ${buttonType}/${buttonSize}`} onClick={onClick} buttonType={buttonType} buttonSize={buttonSize} icon="fr-icon-add-line" />
        ))}
      </div>
    ))}
  </div>
)
