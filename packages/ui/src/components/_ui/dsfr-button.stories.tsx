import { DsfrButton, buttonTypes, buttonSizes, DsfrButtonIcon, DsfrLink } from './dsfr-button'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Button',
  component: DsfrButton,
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

export const ButtonWithTextAndIcon: StoryFn = () => <DsfrButton title="Mon title" onClick={onClick} icon="fr-icon-alert-fill" />

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

export const Link: StoryFn = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <DsfrLink disabled={false} icon={null} title="Titre" label="Label" to={{ name: 'dashboard' }} />
    <DsfrLink disabled={true} icon={null} title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink disabled={false} icon="fr-icon-account-circle-fill" title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink disabled={true} icon="fr-icon-add-line" title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink buttonType="primary" icon={null} disabled={true} title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink buttonType="primary" icon={null} disabled={false} title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink buttonType="primary" disabled={true} icon="fr-icon-add-line" title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink buttonType="primary" disabled={false} icon="fr-icon-alert-fill" title="Titre" to={{ name: 'dashboard' }} />
    <DsfrLink buttonType="primary" disabled={false} icon="fr-icon-alert-fill" title="Titre" to={{ name: 'dashboard' }} label={null} />
  </div>
)
